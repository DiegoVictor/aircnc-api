import { celebrate, Segments, Joi } from 'celebrate';

export default celebrate({
  [Segments.BODY]: Joi.object().keys({
    company: Joi.string().required(),
    techs: Joi.string().required(),
    price: Joi.string(),
  }),
});
