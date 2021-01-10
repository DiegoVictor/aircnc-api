import { Router } from 'express';
import multer from 'multer';

import DashboardController from './app/controllers/DashboardController';
import SessionController from './app/controllers/SessionController';
import PendingController from './app/controllers/PendingController';
import SpotController from './app/controllers/SpotController';
import BookingController from './app/controllers/BookingController';
import DashboardController from './app/controllers/DashboardController';
import ApprovalController from './app/controllers/ApprovalController';
import RejectionController from './app/controllers/RejectionController';

import SessionStore from './app/validators/Session/Store';
import SpotStore from './app/validators/Spot/Store';
import SpotUpdate from './app/validators/Spot/Update';
import BookingStore from './app/validators/Booking/Store';

import Authenticate from './app/middlewares/Authenticate';
import storage from './config/storage';

const Route = Router();

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
