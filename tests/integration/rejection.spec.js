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

describe('Rejection', () => {
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

  it('should be able to reject a booking', async () => {
    const { _id: bookingUserId } = await factory.create('User');
    const { _id: spotId } = await factory.create('Spot', { user: user._id });
    const { _id: bookingId } = await factory.create('Booking', {
      spot: spotId,
      user: bookingUserId,
    });

    const response = await request(app)
      .post(`/v1/bookings/${bookingId}/rejection`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      _id: bookingId.toString(),
      approved: false,
    });
  });

  it('should not be able to approve a booking with wrong user', async () => {
    const { _id: bookingUserId } = await factory.create('User');
    const { _id: spotId } = await factory.create('Spot');
    const { _id: bookingId } = await factory.create('Booking', {
      spot: spotId,
      user: bookingUserId,
    });

    const response = await request(app)
      .post(`/v1/bookings/${bookingId}/rejection`)
      .expect(401)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message:
        "You didn't request a booking to this spot or is not the spot owner",
    });
  });

  it('should not be able to reject a booking that happens in the next 24 hours', async () => {
    const { _id: spotId } = await factory.create('Spot', { user: user._id });
    const { _id: bookingId } = await factory.create('Booking', {
      spot: spotId,
      user: user._id,
      date: (() => {
        const date = new Date();
        date.setHours(date.getHours() + 12);
        return date;
      })(),
    });

    const response = await request(app)
      .post(`/v1/bookings/${bookingId}/rejection`)
      .expect(401)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'You can only cancel bookings with 24 hours in advance',
    });
  });

  it('should be able to emit a rejection booking event', async () => {
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
      .post(`/v1/bookings/${bookingId}/rejection`)
      .set('Authorization', `Bearer ${token}`);

    expect(to).toHaveBeenCalledWith(`${socketId}`);
    expect(emit).toHaveBeenCalledWithMatch('booking_response', {
      approved: false,
      date,
      spot: spot.toJSON(),
      user: bookingUserId,
    });
  });
});
