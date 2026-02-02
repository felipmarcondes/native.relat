import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateMockMetrics(companyId: string) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const connections = await prisma.metaConnection.findMany({ where: { companyId } });

  for (const connection of connections) {
    if (connection.type === 'ad_account') {
      await prisma.adsMetricsDaily.create({
        data: {
          companyId,
          adAccountExternalId: connection.externalId,
          date: today,
          spend: randomInt(500, 1500) / 10,
          results: randomInt(20, 120),
          clicks: randomInt(40, 200),
          impressionsOrViews: randomInt(1000, 5000),
          activeAdsCount: randomInt(2, 8)
        }
      });
      continue;
    }

    await prisma.profileMetricsDaily.create({
      data: {
        companyId,
        source: connection.type === 'instagram_profile' ? 'instagram' : 'facebook',
        profileExternalId: connection.externalId,
        date: today,
        profileViews: randomInt(100, 500),
        totalViews: randomInt(500, 2000),
        totalReach: randomInt(400, 1500),
        engagement: randomInt(50, 300),
        likes: randomInt(20, 200),
        comments: randomInt(5, 40),
        shares: randomInt(2, 20)
      }
    });

    const postsToCreate = randomInt(1, 3);
    for (let i = 0; i < postsToCreate; i += 1) {
      const post = await prisma.contentPost.create({
        data: {
          companyId,
          source: connection.type === 'instagram_profile' ? 'instagram' : 'facebook',
          postExternalId: `${connection.externalId}-${Date.now()}-${i}`,
          profileExternalId: connection.externalId,
          createdTime: today,
          permalink: 'https://www.instagram.com/p/mock',
          captionShort: 'Post mockado gerado pelo worker.',
          mediaType: 'image'
        }
      });

      await prisma.contentMetricsDaily.create({
        data: {
          postId: post.id,
          date: today,
          views: randomInt(100, 800),
          reach: randomInt(80, 600),
          engagement: randomInt(20, 200),
          likes: randomInt(10, 150),
          comments: randomInt(2, 25),
          shares: randomInt(1, 15)
        }
      });
    }
  }
}

const worker = new Worker(
  'sync',
  async (job) => {
    if (job.name === 'sync:company') {
      // TODO: replace mock generation with Meta API sync (Instagram Graph + Marketing API).
      await generateMockMetrics(job.data.companyId);
    }
  },
  {
    connection: {
      url: redisUrl
    }
  }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
