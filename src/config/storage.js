import multer from 'multer';
import path from 'path';

export default {
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '..', '..', 'uploads'),
    filename: (_, file, callback) => {
      const ext = path.extname(file.originalname);
      callback(
        null,
        `${path.basename(file.originalname, ext)}-${Date.now()}${ext}`
      );
    },
  }),
};
