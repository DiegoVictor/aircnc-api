import { Router } from 'express';

import PendingController from '../app/controllers/PendingController';

const app = Router();
const pendingController = new PendingController();

app.get('/', pendingController.index);

export default app;
