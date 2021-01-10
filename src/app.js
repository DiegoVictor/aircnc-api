import 'dotenv/config';

import 'express-async-errors';
import Express from 'express';
import Mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import http from 'http';
import Sentry from '@sentry/node';
import helmet from 'helmet';
import redis from 'redis';
import RateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

import './database';
import routes from './routes';
import { setupWebSocket } from './websocket';

const App = Express();
const Server = http.Server(App);

setupWebSocket(Server);

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
}

Mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

App.use(helmet());

App.use(cors());
App.use(Express.json());

if (process.env.NODE_ENV !== 'test') {
  App.use(
    new RateLimit({
      max: 100,
      windowMs: 1000 * 60 * 15,
      store: new RedisStore({
        client: redis.createClient({
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        }),
      }),
    })
  );
}

App.use('/files', Express.static(path.resolve(__dirname, '..', 'uploads')));

App.use(routes);

App.use((err, req, res, next) => {
  const { payload } = err.output;

  if (err.data) {
    payload.details = err.data;
  }

  return res.status(payload.statusCode).json(payload);
});

export default Server;
