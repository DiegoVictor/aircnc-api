import { notFound, unauthorized } from '@hapi/boom';

import Booking from '../models/Booking';
import Spot from '../models/Spot';

class DeleteSpot {
  async execute({ _id, user }) {
    const spot = await Spot.findOne({ _id, user });

    if (!spot) {
      throw notFound('Spot does not exists', { code: 344 });
    }

    const bookings = await Booking.find({
      spot: _id,
      approved: true,
      date: { $gte: new Date() },
    });

    if (bookings.length > 0) {
      throw unauthorized(
        'You can not remove spot with bookings approved',
        'sample',
        { code: 341 }
      );
    }

    await Spot.deleteOne({ _id });

    return spot;
  }
}

export default DeleteSpot;
