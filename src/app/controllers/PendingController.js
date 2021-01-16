import Booking from '../models/Booking';
import Spot from '../models/Spot';

class PendingController {
  async index(req, res) {
    const { user_id: user, hostUrl } = req;
    const spots = await Spot.find({ user });
    const bookings = await Booking.find({
      approved: { $exists: false },
      date: { $gte: new Date() },
      spot: { $in: spots.map(spot => spot._id) },
    })
      .populate('user')
      .populate('spot');

    return res.json(
      bookings.map(booking => ({
        ...booking.toJSON(),
        spot: {
          ...booking.spot.toJSON(),
          url: `${hostUrl}/v1/spots/${booking.spot._id}`,
        },
      }))
    );
  }
}

export default PendingController;
