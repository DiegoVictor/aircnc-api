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
import sessionValidator from './app/validators/sessionValidator';
import spotValidator from './app/validators/spotValidator';
import spotAndIdValidator from './app/validators/spotAndIdValidator';
import bookingValidator from './app/validators/bookingValidator';
import idValidator from './app/validators/idValidator';
import bookingIdValidator from './app/validators/bookingIdValidator';

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

routes.get('/spots', spotController.index);
routes.get('/spots/:id', idValidator, spotController.show);
routes.post(
  '/spots',
  multer(storage).single('thumbnail'),
  spotValidator,
  spotController.store
);
routes.put(
  '/spots/:id',
  multer(storage).single('thumbnail'),
  spotAndIdValidator,
  spotController.update
);
routes.post(
  '/spots/:spot_id/booking',
  bookingValidator,
  bookingController.store
);
routes.delete('/spots/:id', idValidator, spotController.destroy);

routes.get('/dashboard', dashboardController.index);

routes.get('/pending', pendingController.index);

routes.get('/bookings', bookingController.index);
routes.post(
  '/bookings/:booking_id/approval',
  bookingIdValidator,
  approvalController.store
);
routes.post(
  '/bookings/:booking_id/rejection',
  bookingIdValidator,
  rejectionController.store
);

export default routes;
