import EmitBooking from '../services/EmitBooking';
import RejectBooking from '../services/RejectBooking';

class RejectionController {
  async store(req, res) {
    const { user_id: user, hostUrl } = req;

    const rejectBooking = new RejectBooking();
    const booking = await rejectBooking.execute({ booking_id, user });

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

export default RejectionController;
