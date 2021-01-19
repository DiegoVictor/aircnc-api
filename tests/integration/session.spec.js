import request from 'supertest';
import Mongoose from 'mongoose';

import app from '../../src/app';
import factory from '../utils/factory';
import User from '../../src/app/models/User';

describe('Session', () => {
  beforeEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should be able to authenticate user', async () => {
    const { _id, email } = await factory.create('User');

    const response = await request(app)
      .post('/v1/sessions')
      .send({ email });

    expect(response.body).toMatchObject({
      user: {
        _id: _id.toString(),
        email,
      },
      token: expect.any(String),
    });
  });

  it('should be able to authenticate with new user', async () => {
    const { email } = await factory.attrs('User');

    const response = await request(app)
      .post('/v1/sessions')
      .send({ email });

    expect(response.body).toMatchObject({
      user: {
        email,
      },
      token: expect.any(String),
    });
  });
});
