import 'dotenv/config';

import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import helmet from 'helmet';
import { errors } from 'celebrate';

import './database';
import routes from './routes';
import { setupWebSocket } from './websocket';

const app = express();
const server = http.Server(app);

setupWebSocket(server);

app.use(helmet());
app.use(express.json());

app.use('/files', express.static(path.resolve(__dirname, '..', 'uploads')));
app.use('/v1', routes);

app.use(errors());
export default server;
