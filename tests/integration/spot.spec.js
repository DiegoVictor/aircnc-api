import request from 'supertest';
import faker from 'faker';
import path from 'path';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import User from '../../src/app/models/User';
import Spot from '../../src/app/models/Spot';
import Booking from '../../src/app/models/Booking';
import jwtoken from '../utils/jwtoken';

describe('Spot', () => {
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

  it('should be able to get a list of spots', async () => {
    const tech = faker.random.word();

    await factory.createMany('Spot', 3, { techs: [tech] });

    const response = await request(app)
      .get(`/v1/spots?tech=${tech}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(3);
    expect(response.body).toContainEqual(
      expect.objectContaining({
        _id: expect.any(String),
        techs: [tech],
      })
    );
  });

  it('should be able to get a spot details', async () => {
    const {
      _id,
      company,
      price,
      techs,
      user: spotUser,
      thumbnail_url,
    } = await factory.create('Spot');

    const response = await request(app)
      .get(`/v1/spots/${_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    expect(response.body).toStrictEqual({
      company,
      price,
      techs: [...techs],
      user: spotUser,
      thumbnail_url,
      bookings: [],
      url: `${url}/${_id}`,
    });
  });

  it('should be able to create a spot', async () => {
    const filePath = path.resolve(__dirname, '..', 'files', 'example.jpg');
    const { company, techs, price } = await factory.attrs('Spot');

    const response = await request(app)
      .post('/v1/spots')
      .set('Authorization', `Bearer ${token}`)
      .attach('thumbnail', filePath)
      .field('company', company)
      .field('price', price)
      .field('techs', techs.join(','));

    expect(response.body).toMatchObject({
      techs,
      user: user._id.toString(),
      company,
      price,
      _id: expect.any(String),
      thumbnail: expect.any(String),
    });
  });

  it('should not be able to create a spot with a user that not exists', async () => {
    const filePath = path.resolve(__dirname, '..', 'files', 'example.jpg');
    const { company, techs, price } = await factory.attrs('Spot');

    await user.remove();

    const response = await request(app)
      .post('/v1/spots')
      .expect(400)
      .set('Authorization', `Bearer ${token}`)
      .attach('thumbnail', filePath)
      .field('company', company)
      .field('price', price)
      .field('techs', techs.join(', '));

    expect(response.body).toMatchObject({
      error: 'Bad Request',
      message: 'User does not exists',
    });
  });

  it('should be able to update a spot', async () => {
    const filePath = path.resolve(__dirname, '..', 'files', 'example.jpg');
    const spot = await factory.create('Spot', {
      user: user._id.toString(),
    });
    const { company, price, techs } = await factory.attrs('Spot');

    const response = await request(app)
      .put(`/v1/spots/${spot._id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('thumbnail', filePath)
      .field('company', company)
      .field('price', price)
      .field('techs', techs.join(','));

    expect(response.body).toMatchObject({
      techs,
      company,
      price,
      thumbnail: expect.anything(),
      url: `${url}/${spot._id}`,
    });
  });

  it('should be able to delete a spot', async () => {
    const spot = await factory.create('Spot', {
      user: user._id,
    });

    const response = await request(app)
      .delete(`/v1/spots/${spot._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(204);
    expect(response.body).toStrictEqual({});
  });

  it('should not be able to delete a spot that has bookings approved', async () => {
    const spot = await factory.create('Spot', {
      user: user._id.toString(),
    });
    await factory.create('Booking', {
      spot: spot._id,
      approved: true,
    });

    const response = await request(app)
      .delete(`/v1/spots/${spot._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'You can not remove spot with bookings approved',
    });
  });

  it('should not be able to delete a spot that not exists', async () => {
    const spot = await factory.create('Spot', {
      user: user._id,
    });
    await spot.delete();

    const response = await request(app)
      .delete(`/v1/spots/${spot._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      error: 'Bad Request',
      message: 'Spot does not exists',
    });
  });
});
