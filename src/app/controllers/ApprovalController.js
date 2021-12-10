import EmitBooking from '../services/EmitBooking';
import ApproveBooking from '../services/ApproveBooking';

class ApprovalController {
  async store(req, res) {
    const { booking_id } = req.params;
    const { user_id: user } = req;

    const approveBooking = new ApproveBooking();
    const booking = await approveBooking.execute({ booking_id, user });

    const booking_user_id = booking.user._id.toString();
    if (user !== booking_user_id) {
      const emitBooking = new EmitBooking();
      await emitBooking.execute({
        user_id: booking_user_id,
        booking,
        event: 'booking_response',
      });
    }

    return res.json(booking);
  }
}

export default ApprovalController;
