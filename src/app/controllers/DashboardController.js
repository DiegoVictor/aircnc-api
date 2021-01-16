import Spot from '../models/Spot';

class DashboardController {
  async index(req, res) {
    const { user_id: user } = req;
    const spots = await Spot.find({ user });
    const count = await Spot.countDocuments({ user });
    res.header('X-Total-Count', count);

    return res.json(spots);
  }
}

export default DashboardController;
