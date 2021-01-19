import request from 'supertest';
import faker from 'faker';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import { connect, emit, to } from '../../mocks/socket.io';
import '../utils/extend';
import User from '../../src/app/models/User';
import Spot from '../../src/app/models/Spot';
import Booking from '../../src/app/models/Booking';
import jwtoken from '../utils/jwtoken';

describe('Approval', () => {
  let token;
  let user;

  beforeEach(async () => {
    await User.deleteMany();
    await Spot.deleteMany();
    await Booking.deleteMany();

    user = await factory.create('User');
    token = jwtoken(user.id);
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to approve a booking', async () => {
    const { _id: spotId } = await factory.create('Spot', { user: user._id });
    const { _id: bookingId } = await factory.create('Booking', {
      spot: spotId,
      user: user._id.toString(),
    });

    const response = await request(app)
      .post(`/v1/bookings/${bookingId}/approval`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      _id: bookingId.toString(),
      approved: true,
    });
  });

  it('should not be able to approve a booking with wrong user', async () => {
    const { _id: spotId } = await factory.create('Spot');
    const { _id: bookingId } = await factory.create('Booking', {
      spot: spotId,
    });

    const response = await request(app)
      .post(`/v1/bookings/${bookingId}/approval`)
      .expect(401)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'Only the spot owner can approve bookings',
    });
  });

  it('should be able to emit a approved booking event', async () => {
    const { _id: bookingUserId } = await factory.create('User');
    const spot = await factory.create('Spot', { user: user._id });
    const { _id: bookingId, date } = await factory.create('Booking', {
      spot: spot._id,
      user: bookingUserId,
    });
    const socketId = faker.random.number();

    connect({
      id: socketId,
      handshake: {
        query: {
          user_id: bookingUserId.toString(),
        },
      },
    });

    await request(app)
      .post(`/v1/bookings/${bookingId}/approval`)
      .set('Authorization', `Bearer ${token}`);

    expect(to).toHaveBeenCalledWith(`${socketId}`);
    expect(emit).toHaveBeenCalledWithMatch('booking_response', {
      approved: true,
      date,
      spot: spot.toJSON(),
      user: bookingUserId,
    });
  });
});
