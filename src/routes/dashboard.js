import { Router } from 'express';

import DashboardController from '../app/controllers/DashboardController';

const app = Router();
const dashboardController = new DashboardController();

app.get('/', dashboardController.index);

export default app;
