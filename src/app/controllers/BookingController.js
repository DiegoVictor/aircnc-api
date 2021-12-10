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
    const { user_id: user } = req;
    const { spot_id: spot } = req.params;
    const { date } = req.body;

    let booking = await Booking.create({ user, spot, date });

    booking = await booking.populate('spot').populate('user').execPopulate();

    const emitBooking = new EmitBooking();
    await emitBooking.execute({
      user_id: booking.spot.user,
      booking,
      event: 'booking_request',
    });

    return res.json(booking);
  }
}

export default BookingController;
