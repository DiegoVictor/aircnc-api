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

describe('Booking', () => {
  const url = `${process.env.APP_URL}:${process.env.APP_PORT}/v1/spots`;
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

  it("should be able to get user's bookings", async () => {
    const spot = await factory.create('Spot', {
      user: user._id.toString(),
    });
    await factory.createMany('Booking', 3, {
      user: user._id,
      spot,
    });

    const bookings = await Booking.find({
      date: { $gte: new Date() },
      approved: { $ne: false },
      user: user._id,
    }).populate('spot');

    const response = await request(app)
      .get('/v1/bookings')
      .set('Authorization', `Bearer ${token}`);

    bookings.forEach(booking => {
      expect(response.body).toContainEqual({
        ...booking.toJSON(),
        _id: booking._id.toString(),
        spot: {
          ...booking.spot.toJSON(),
          _id: booking.spot._id.toString(),
          user: booking.spot.user.toString(),
          thumbnail_url: `${process.env.APP_URL}:${process.env.APP_PORT}/files/${booking.spot.thumbnail}`,
          url: `${url}/${booking.spot._id}`,
        },
        user: booking.user.toString(),
        date: booking.date.toISOString(),
      });
    });
  });

  it('should be able to book a spot', async () => {
    let spot = await factory.create('Spot', {
      user: user._id.toString(),
    });
    const date = faker.date.future();

    const response = await request(app)
      .post(`/v1/spots/${spot._id}/booking`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date,
      });

    spot.techs.forEach(tech => {
      expect(response.body.spot.techs).toContainEqual(tech);
    });

    spot = spot.toJSON();
    spot._id = spot._id.toString();
    spot.user = spot.user.toString();

    expect(response.body).toMatchObject({
      spot,
      date: date.toISOString(),
    });
  });

  it('should be able to emit event to requested spot', async () => {
    const { _id: spotOwnerId } = await factory.create('User');
    const spot = await factory.create('Spot', {
      user: spotOwnerId,
    });
    const date = faker.date.future();
    const socketId = faker.datatype.number();

    connect({
      id: socketId,
      handshake: {
        query: {
          user_id: spotOwnerId.toString(),
        },
      },
    });

    await request(app)
      .post(`/v1/spots/${spot._id}/booking`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        date,
      });

    expect(to).toHaveBeenCalledWith(`${socketId}`);
    expect(emit).toHaveBeenCalledWithMatch('booking_request', {
      spot: spot.toJSON(),
      user: user.toJSON(),
      date,
    });
  });
});
