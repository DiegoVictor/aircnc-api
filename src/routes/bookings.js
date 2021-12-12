import { Router } from 'express';

import BookingController from '../app/controllers/BookingController';
import ApprovalController from '../app/controllers/ApprovalController';
import RejectionController from '../app/controllers/RejectionController';
import idValidator from '../app/validators/idValidator';

const app = Router();

const bookingController = new BookingController();
const approvalController = new ApprovalController();
const rejectionController = new RejectionController();

app.get('/', bookingController.index);
app.post('/:id/approval', idValidator, approvalController.store);
app.post('/:id/rejection', idValidator, rejectionController.store);

export default app;
