import { Router } from 'express';

import BookingController from '../app/controllers/BookingController';
import ApprovalController from '../app/controllers/ApprovalController';
import RejectionController from '../app/controllers/RejectionController';
import bookingIdValidator from '../app/validators/bookingIdValidator';

const app = Router();

const bookingController = new BookingController();
const approvalController = new ApprovalController();
const rejectionController = new RejectionController();

app.get('/', bookingController.index);
app.post('/:booking_id/approval', bookingIdValidator, approvalController.store);
app.post(
  '/:booking_id/rejection',
  bookingIdValidator,
  rejectionController.store
);

export default app;
