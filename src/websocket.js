import Socket from 'socket.io';
import * as redis from 'redis';
// eslint-disable-next-line import/no-extraneous-dependencies
import redisMock from 'redis-mock';

let { createClient } = redis;
if (process.env.NODE_ENV === 'test') {
  createClient = redisMock.createClient;
}

const client = createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

let io;

export function setupWebSocket(server) {
  io = Socket(server);

  io.on('connection', (socket) => {
    const { user_id } = socket.handshake.query;
    client.set(user_id.toString(), socket.id);
  });
}

export async function findConnection(id) {
  const socketId = await new Promise((resolve) => {
    client.get(id.toString(), (_, reply) => {
      resolve(reply);
    });
  });

  if (typeof socketId === 'string') {
    return socketId;
  }
  return null;
}

export function emit(to, event, message) {
  io.to(to).emit(event, message);
}
