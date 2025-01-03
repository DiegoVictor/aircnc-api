import request from 'supertest';
import { faker } from '@faker-js/faker';
import Mongoose from 'mongoose';

import app from '../../src/app';

describe('Authenticate', () => {
  afterAll(async () => {
    await Mongoose.disconnect();
  });

  it('should not be able autheticate', async () => {
    const response = await request(app)
      .get('/v1/developers')
      .expect(401)
      .send();

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'Token not provided',
    });
  });

  it('should not be able autheticate', async () => {
    const response = await request(app)
      .get('/v1/developers')
      .expect(401)
      .set('Authorization', faker.string.alphanumeric(16))
      .send();

    expect(response.body).toMatchObject({
      error: 'Unauthorized',
      message: 'Token invalid',
    });
  });
});
