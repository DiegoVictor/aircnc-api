import request from 'supertest';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import User from '../../src/app/models/User';
import Spot from '../../src/app/models/Spot';
import jwtoken from '../utils/jwtoken';

describe('Dashboard', () => {
  const url = `${process.env.APP_URL}:${process.env.APP_PORT}/v1/spots`;
  let token;
  let user;

  beforeEach(async () => {
    await User.deleteMany();
    await Spot.deleteMany();

    user = await factory.create('User');
    token = jwtoken(user.id);
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be get a list of spots of one user', async () => {
    await factory.createMany('Spot', 3, { user: user._id });
    const spots = await Spot.find({ user: user._id });

    const response = await request(app)
      .get('/v1/dashboard')
      .set('Authorization', `Bearer ${token}`)
      .send();

    spots.forEach((spot) => {
      expect(response.body).toContainEqual({
        ...spot.toJSON(),
        _id: spot._id.toString(),
        user: spot.user.toString(),
        thumbnail_url: `${process.env.APP_URL}:${process.env.APP_PORT}/files/${spot.thumbnail}`,
        url: `${url}/${spot._id}`,
      });
    });
  });
});
