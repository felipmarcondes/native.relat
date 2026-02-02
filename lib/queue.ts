import { Queue } from 'bullmq';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const syncQueue = new Queue('sync', {
  connection: {
    url: redisUrl
  }
});
