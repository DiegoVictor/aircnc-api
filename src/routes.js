import { Router } from 'express';
import multer from 'multer';

import DashboardController from './app/controllers/DashboardController';
import SessionController from './app/controllers/SessionController';
import PendingController from './app/controllers/PendingController';
import SpotController from './app/controllers/SpotController';
import BookingController from './app/controllers/BookingController';
import ApprovalController from './app/controllers/ApprovalController';
import RejectionController from './app/controllers/RejectionController';
import Authenticate from './app/middlewares/Authenticate';
import storage from './config/storage';

const sessionController = new SessionController();
const spotController = new SpotController();
const bookingController = new BookingController();
const dashboardController = new DashboardController();
const pendingController = new PendingController();
const approvalController = new ApprovalController();
const rejectionController = new RejectionController();

const routes = Router();

routes.post('/sessions', sessionValidator, sessionController.store);

routes.use(Authenticate);

Route.get('/spots', SpotController.index);
Route.get('/spots/:id', SpotController.show);
Route.post(
  '/spots',
  Multer(storage).single('thumbnail'),
  SpotStore,
  SpotController.store
);
Route.put(
  '/spots/:id',
  Multer(storage).single('thumbnail'),
  SpotUpdate,
  SpotController.update
);
Route.post('/spots/:spot_id/booking', BookingStore, BookingController.store);
Route.delete('/spots/:id', SpotController.destroy);

Route.get('/dashboard', DashboardController.index);

Route.get('/pending', PendingController.index);

Route.get('/bookings', BookingController.index);
Route.post('/bookings/:booking_id/approval', ApprovalController.store);
Route.post('/bookings/:booking_id/rejection', RejectionController.store);

export default Route;
