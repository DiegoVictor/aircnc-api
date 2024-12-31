import request from 'supertest';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import User from '../../src/app/models/User';
import Spot from '../../src/app/models/Spot';
import Booking from '../../src/app/models/Booking';
import jwtoken from '../utils/jwtoken';

describe('Pending', () => {
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

  it('should be able to get a list of peding bookings', async () => {
    const { _id: spotId } = await factory.create('Spot', { user: user._id });
    const bookings = await factory.createMany('Booking', 3, { spot: spotId });
    const response = await request(app)
      .get('/v1/pending')
      .set('Authorization', `Bearer ${token}`);

    bookings.forEach((booking) => {
      expect(response.body).toContainEqual(
        expect.objectContaining({
          _id: booking._id.toString(),
        })
      );
    });
  });
});
