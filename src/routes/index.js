import { Router } from 'express';

import authenticate from '../app/middlewares/authenticate';

import bookings from './bookings';
import dashboard from './dashboard';
import pending from './pending';
import sessions from './sessions';
import spots from './spots';

const app = Router();

app.use('/sessions', sessions);

app.use(authenticate);

app.use('/spots', spots);
app.use('/dashboard', dashboard);
app.use('/pending', pending);
app.use('/bookings', bookings);

export default app;
