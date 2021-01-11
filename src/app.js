import 'dotenv/config';

import 'express-async-errors';
import Express from 'express';
import Mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import http from 'http';
import helmet from 'helmet';

import './database';
import routes from './routes';
import { setupWebSocket } from './websocket';

const App = Express();
const Server = http.Server(App);

setupWebSocket(Server);

app.use(helmet());

app.use('/v1', routes);

export default Server;
