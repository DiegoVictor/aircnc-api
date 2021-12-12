import { Router } from 'express';
import multer from 'multer';

import SpotController from '../app/controllers/SpotController';
import BookingController from '../app/controllers/BookingController';
import spotAndIdValidator from '../app/validators/spotAndIdValidator';
import bookingValidator from '../app/validators/bookingValidator';
import idValidator from '../app/validators/idValidator';
import spotValidator from '../app/validators/spotValidator';

import storage from '../config/storage';

const app = Router();
const spotController = new SpotController();
const bookingController = new BookingController();

app.get('/', spotController.index);
app.get('/:id', idValidator, spotController.show);
app.post(
  '/',
  multer(storage).single('thumbnail'),
  spotValidator,
  spotController.store
);
app.put(
  '/:id',
  multer(storage).single('thumbnail'),
  spotAndIdValidator,
  spotController.update
);
app.post(
  '/:id/booking',
  idValidator,
  bookingValidator,
  bookingController.store
);
app.delete('/:id', idValidator, spotController.destroy);

export default app;
