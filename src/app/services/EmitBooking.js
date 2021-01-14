import { findConnection, emit } from '../../websocket';

class EmitBooking {
  async execute({ user_id, booking, event }) {
    const booking_user_socket_id = await findConnection(user_id);
    if (booking_user_socket_id) {
      emit(booking_user_socket_id, event, booking);
    }
  }
}

export default EmitBooking;
