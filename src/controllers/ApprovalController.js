import Booking from '../models/Booking';

class ApprovalController {
  async store(req, res) {
    const { booking_id } = req.params;
    const booking = await Booking.findById(booking_id).populate('spot');

    booking.approved = true;
    await booking.save();

    const booking_user = req.connections[booking.user];
    if (booking_user) {
      req.io.to(booking_user).emit('booking_response', booking);
    }

    return res.json(booking);
  }
}

export default new ApprovalController();
