import Spot from '../models/Spot';

class DashboardController {
  async index(req, res) {
    const { user_id: user, hostUrl } = req;

    const [spots, count] = await Promise.all([
      Spot.find({ user }),
      Spot.countDocuments({ user }),
    ]);

    res.header('X-Total-Count', count);

    return res.json(
      spots.map((spot) => ({
        ...spot.toJSON(),
        url: `${hostUrl}/v1/spots/${spot._id}`,
      }))
    );
  }
}

export default DashboardController;
