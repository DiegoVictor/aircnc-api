import EmitBooking from '../services/EmitBooking';
import ApproveBooking from '../services/ApproveBooking';

const approveBooking = new ApproveBooking();
const emitBooking = new EmitBooking();

class ApprovalController {
  async store(req, res) {
    const { booking_id } = req.params;
    const { user_id: user } = req;

    const booking = await approveBooking.execute({ booking_id, user });

    if (user !== booking.user.toString()) {
      await emitBooking.execute({
        user_id: booking.user,
        booking,
        event: 'booking_response',
      });
    }

    return res.json(booking);
  }
}

export default ApprovalController;
