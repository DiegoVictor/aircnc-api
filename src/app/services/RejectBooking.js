import { unauthorized } from '@hapi/boom';
import { isAfter, subDays } from 'date-fns';

import Spot from '../models/Spot';
import Booking from '../models/Booking';

class RejectBooking {
  async execute({ booking_id, user }) {
    const spots = await Spot.find({ user });
    const booking = await Booking.findOne({
      _id: booking_id,
      $or: [{ user }, { spot: spots.map((spot) => spot._id) }],
    })
      .populate('spot')
      .populate('user');

    if (!booking) {
      throw unauthorized(
        "You didn't request a booking to this spot or is not the spot owner",
        'sample',
        { code: 343 }
      );
    }

    if (
      booking.user.equals(user) &&
      isAfter(new Date(), subDays(booking.date, 1))
    ) {
      throw unauthorized(
        'You can only cancel bookings with 24 hours in advance',
        'sample',
        { code: 345 }
      );
    }

    booking.approved = false;
    await booking.save();

    return booking;
  }
}

export default RejectBooking;
