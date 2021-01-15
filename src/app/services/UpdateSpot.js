import Spot from '../models/Spot';

class UpdateSpot {
  async execute({ _id, company, file, price, techs = [], user }) {
    const data = {
      company,
      price,
      techs,
    };
    if (typeof file === 'object') {
      data.thumbnail = file.filename;
    }

    data.techs = techs.split(',').map(tech => tech.trim());

    const spot = await Spot.findOneAndUpdate({ _id, user }, data, {
      new: true,
    });

    return {
      ...spot.toJSON(),
      thumbnail: data.thumbnail,
    };
  }
}

export default UpdateSpot;
