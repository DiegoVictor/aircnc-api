import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    date: Joi.string().required(),
  }),
  [Segments.PARAMS]: Joi.object().keys({
    spot_id: Joi.string().required(),
  }),
});
