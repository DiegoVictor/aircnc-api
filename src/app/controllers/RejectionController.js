import EmitBooking from '../services/EmitBooking';
import RejectBooking from '../services/RejectBooking';

class RejectionController {
  async store(req, res) {
    const { user_id: user } = req;
    const { booking_id } = req.params;

    const rejectBooking = new RejectBooking();
    const booking = await rejectBooking.execute({ booking_id, user });

    if (user !== booking.user.toString()) {
      const emitBooking = new EmitBooking();
      await emitBooking.execute({
        user_id: booking.user,
        booking,
        event: 'booking_response',
      });
    }

    return res.json(booking);
  }
}

export default RejectionController;
