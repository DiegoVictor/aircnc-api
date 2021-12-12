import EmitBooking from '../services/EmitBooking';
import ApproveBooking from '../services/ApproveBooking';

class ApprovalController {
  async store(req, res) {
    const { id } = req.params;
    const { user_id: user, hostUrl } = req;

    const approveBooking = new ApproveBooking();
    const booking = await approveBooking.execute({ booking_id: id, user });

    const booking_user_id = booking.user._id.toString();
    if (user !== booking_user_id) {
      const emitBooking = new EmitBooking();
      await emitBooking.execute({
        user_id: booking_user_id,
        booking,
        event: 'booking_response',
      });
    }

    return res.json({
      ...booking,
      spot: {
        ...booking.spot,
        url: `${hostUrl}/v1/spots/${booking.spot._id}`,
      },
    });
  }
}

export default ApprovalController;
