import Spot from '../models/Spot';

class UpdateSpot {
  async execute({ _id, file, user, ...rest }) {
    const data = { techs: [] };
    ['company', 'price', 'techs'].forEach((field) => {
      if (rest[field]) {
        data[field] = rest[field];
      }
    });

    if (typeof file === 'object') {
      data.thumbnail = file.filename;
    }

    if (rest.techs) {
      data.techs = rest.techs.split(',').map((tech) => tech.trim());
    }

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
