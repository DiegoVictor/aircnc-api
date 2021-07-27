import { Router } from 'express';

import SessionController from '../app/controllers/SessionController';
import sessionValidator from '../app/validators/sessionValidator';

const app = Router();
const sessionController = new SessionController();

app.post('/', sessionValidator, sessionController.store);

export default app;
