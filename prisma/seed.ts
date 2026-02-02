import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const clientPassword = await bcrypt.hash('client123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {},
    create: {
      email: 'admin@local',
      name: 'Administrador',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  const companyA = await prisma.company.create({
    data: { name: 'Posto Estradão', maxProfiles: 5, maxAdAccounts: 1 }
  });
  const companyB = await prisma.company.create({
    data: { name: 'Posto Fabri', maxProfiles: 5, maxAdAccounts: 1 }
  });

  const clientA = await prisma.user.create({
    data: {
      email: 'cliente1@local',
      name: 'Cliente 1',
      passwordHash: clientPassword,
      role: 'CLIENT'
    }
  });

  const clientB = await prisma.user.create({
    data: {
      email: 'cliente2@local',
      name: 'Cliente 2',
      passwordHash: clientPassword,
      role: 'CLIENT'
    }
  });

  await prisma.companyUser.createMany({
    data: [
      { companyId: companyA.id, userId: admin.id, role: 'ADMIN' },
      { companyId: companyB.id, userId: admin.id, role: 'ADMIN' },
      { companyId: companyA.id, userId: clientA.id, role: 'CLIENT' },
      { companyId: companyB.id, userId: clientB.id, role: 'CLIENT' }
    ]
  });

  const connections = await prisma.metaConnection.createMany({
    data: [
      {
        companyId: companyA.id,
        type: 'instagram_profile',
        externalId: 'ig-estradao',
        displayName: 'Instagram Estradão',
        status: 'connected'
      },
      {
        companyId: companyA.id,
        type: 'facebook_page',
        externalId: 'fb-estradao',
        displayName: 'Facebook Estradão',
        status: 'connected'
      },
      {
        companyId: companyA.id,
        type: 'ad_account',
        externalId: 'ads-estradao',
        displayName: 'Conta Ads Estradão',
        status: 'connected'
      },
      {
        companyId: companyB.id,
        type: 'instagram_profile',
        externalId: 'ig-fabri',
        displayName: 'Instagram Fabri',
        status: 'connected'
      },
      {
        companyId: companyB.id,
        type: 'facebook_page',
        externalId: 'fb-fabri',
        displayName: 'Facebook Fabri',
        status: 'connected'
      },
      {
        companyId: companyB.id,
        type: 'ad_account',
        externalId: 'ads-fabri',
        displayName: 'Conta Ads Fabri',
        status: 'connected'
      }
    ]
  });

  console.log(`Connections created: ${connections.count}`);

  const companies = [companyA, companyB];

  for (const company of companies) {
    const companyConnections = await prisma.metaConnection.findMany({ where: { companyId: company.id } });

    for (let day = 0; day < 30; day += 1) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setUTCHours(0, 0, 0, 0);

      for (const connection of companyConnections) {
        if (connection.type === 'ad_account') {
          await prisma.adsMetricsDaily.create({
            data: {
              companyId: company.id,
              adAccountExternalId: connection.externalId,
              date,
              spend: randomInt(500, 2000) / 10,
              results: randomInt(10, 120),
              clicks: randomInt(40, 300),
              impressionsOrViews: randomInt(900, 8000),
              activeAdsCount: randomInt(2, 10)
            }
          });
          continue;
        }

        await prisma.profileMetricsDaily.create({
          data: {
            companyId: company.id,
            source: connection.type === 'instagram_profile' ? 'instagram' : 'facebook',
            profileExternalId: connection.externalId,
            date,
            profileViews: randomInt(100, 700),
            totalViews: randomInt(400, 2500),
            totalReach: randomInt(350, 2000),
            engagement: randomInt(40, 400),
            likes: randomInt(20, 250),
            comments: randomInt(2, 40),
            shares: randomInt(1, 30)
          }
        });
      }
    }

    const profileConnections = companyConnections.filter((connection) => connection.type !== 'ad_account');
    for (const connection of profileConnections) {
      for (let week = 0; week < 4; week += 1) {
        const postDate = new Date();
        postDate.setDate(postDate.getDate() - week * 7);
        postDate.setUTCHours(0, 0, 0, 0);

        const post = await prisma.contentPost.create({
          data: {
            companyId: company.id,
            source: connection.type === 'instagram_profile' ? 'instagram' : 'facebook',
            postExternalId: `${connection.externalId}-post-${week}`,
            profileExternalId: connection.externalId,
            createdTime: postDate,
            permalink: 'https://instagram.com/p/mock',
            captionShort: 'Post semanal de exemplo.',
            mediaType: 'image'
          }
        });

        for (let day = 0; day < 7; day += 1) {
          const metricDate = new Date(postDate);
          metricDate.setDate(metricDate.getDate() + day);
          await prisma.contentMetricsDaily.create({
            data: {
              postId: post.id,
              date: metricDate,
              views: randomInt(80, 600),
              reach: randomInt(50, 500),
              engagement: randomInt(20, 200),
              likes: randomInt(10, 150),
              comments: randomInt(1, 20),
              shares: randomInt(1, 15)
            }
          });
        }
      }
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
