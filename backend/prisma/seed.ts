/**
 * Données initiales MySQL.
 *
 * Utilisation : npm run db:seed
 * Le script est idempotent : chaque enregistrement est inséré ou mis à jour
 * en fonction de son identifiant stable.
 */
import { PrismaClient } from '@prisma/client';
import { buildSeed } from '../src/data/seed';

const prisma = new PrismaClient();

const ORDER: string[] = [
  'roles',
  'permissions',
  'adminUsers',
  'siteSettings',
  'services',
  'serviceImages',
  'pages',
  'heroSlides',
  'projects',
  'projectImages',
  'categories',
  'articles',
  'media',
  'testimonials',
  'activityLogs',
];

async function main() {
  const data = buildSeed({ withDemoRequests: false });

  for (const collection of ORDER) {
    const rows = data[collection];
    if (!rows?.length) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const delegate = (prisma as any)[collection];
    if (!delegate) {
      console.warn(`[seed] modèle Prisma introuvable pour « ${collection} » — ignoré.`);
      continue;
    }
    let count = 0;
    for (const row of rows) {
      const { id, ...rest } = row;
      await delegate.upsert({
        where: { id },
        create: row,
        update: rest,
      });
      count += 1;
    }
    console.log(`[seed] ${collection} : ${count} enregistrement(s)`);
  }

  console.log('\n[seed] Terminé. Compte administrateur :');
  console.log(`        e-mail       : ${process.env.SEED_ADMIN_EMAIL ?? 'admin@aces-globalservices.com'}`);
  console.log(`        mot de passe : ${process.env.SEED_ADMIN_PASSWORD ?? 'AcesAdmin2025!'}`);
  console.log('        (modifiez ce mot de passe après la première connexion)\n');
}

main()
  .catch((error) => {
    console.error('[seed] échec :', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
