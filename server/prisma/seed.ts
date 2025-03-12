import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 8;
  const hashedPassword = await bcrypt.hash(
    process.env.PASSWORD_ADMIN!,
    saltRounds,
  );

  await prisma.user.upsert({
    where: { email: process.env.EMAIL_ADMIN },
    update: {},
    create: {
      email: process.env.EMAIL_ADMIN!,
      password: hashedPassword,
      name: 'admin',
      role: 'ADMIN',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
