import Booking from '../models/Booking';
import EmitBooking from '../services/EmitBooking';

class BookingController {
  async index(req, res) {
    const { user_id: user, hostUrl } = req;

    const conditions = {
      date: { $gte: new Date() },
      approved: { $ne: false },
      user,
    };

    const [bookings, count] = await Promise.all([
      Booking.find(conditions).populate('spot').populate('user'),
      Booking.countDocuments(conditions),
    ]);

    res.header('X-Total-Count', count);

    return res.json(
      bookings.map((booking) => {
        const bookingSerialized = booking.toJSON();

        return {
          ...bookingSerialized,
          spot: {
            ...bookingSerialized.spot,
            url: `${hostUrl}/v1/spots/${bookingSerialized.spot._id}`,
          },
        };
      })
    );
  }

  async store(req, res) {
    const { user_id: user, hostUrl } = req;
    const { id: spot } = req.params;
    const { date } = req.body;

    const booking = await Booking.create({ user, spot, date });

    await Booking.populate(booking, [{ path: 'spot' }, { path: 'user' }]);

    const emitBooking = new EmitBooking();
    await emitBooking.execute({
      user_id: booking.spot.user,
      booking,
      event: 'booking_request',
    });

    return res.status(201).json({
      ...booking.toJSON(),
      spot: {
        ...booking.spot.toJSON(),
        url: `${hostUrl}/v1/spots/${booking.spot._id}`,
      },
    });
  }
}

export default BookingController;
