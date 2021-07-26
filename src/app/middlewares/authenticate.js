import { unauthorized } from '@hapi/boom';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';

export default async (req, _, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw unauthorized('Token not provided', 'sample', { code: 241 });
  }

  const [, token] = authorization.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user_id = decoded.id;
  } catch (err) {
    throw unauthorized('Token invalid', 'sample', { code: 242 });
  }

  return next();
};
