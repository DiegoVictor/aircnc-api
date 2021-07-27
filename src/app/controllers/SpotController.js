import { badRequest } from '@hapi/boom';

import Booking from '../models/Booking';
import Spot from '../models/Spot';
import User from '../models/User';
import DeleteSpot from '../services/DeleteSpot';
import UpdateSpot from '../services/UpdateSpot';

class SpotController {
  async index(req, res) {
    const { currentUrl } = req;
    const { tech } = req.query;

    const spots = await Spot.find({ techs: tech });
    const count = await Spot.countDocuments({ techs: tech });
    res.header('X-Total-Count', count);

    return res.json(
      spots.map((spot) => ({
        ...spot.toJSON(),
        url: `${currentUrl}/${spot._id}`,
      }))
    );
  }

  async show(req, res) {
    const { currentUrl } = req;
    const { id } = req.params;
    const { thumbnail_url, company, price, techs, user } = await Spot.findById(
      id
    );
    const bookings = await Booking.find({
      spot: id,
      date: { $gte: new Date() },
      approved: true,
    })
      .limit(30)
      .populate('user');

    return res.json({
      user,
      company,
      price,
      techs,
      thumbnail_url,
      bookings,
      url: currentUrl,
    });
  }

  async store(req, res) {
    const { user_id } = req;
    const { company, techs, price } = req.body;
    const { filename } = req.file;

    const user = await User.findById(user_id);
    if (!user) {
      throw badRequest('User does not exists', { code: 144 });
    }

    const spot = await Spot.create({
      user: user_id,
      company,
      techs: techs.split(',').map((tech) => tech.trim()),
      price,
      thumbnail: filename,
    });

    return res.json(spot);
  }

  async update(req, res) {
    const { user_id: user, currentUrl } = req;
    const { id: _id } = req.params;
    const { company, techs, price } = req.body;
    let file;

    if (typeof req.file === 'object') {
      file = req.file;
    }

    const updateSpot = new UpdateSpot();
    const spot = await updateSpot.execute({
      _id,
      file,
      user,
      company,
      techs,
      price,
    });

    return res.json({
      ...spot,
      url: currentUrl,
    });
  }

  async destroy(req, res) {
    const { id: _id } = req.params;
    const { user_id: user } = req;

    const deleteSpot = new DeleteSpot();
    await deleteSpot.execute({ _id, user });

    return res.sendStatus(204);
  }
}

export default SpotController;
