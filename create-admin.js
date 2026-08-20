const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@sidak.com' },
    update: { password_hash: hash },
    create: {
      nama: 'Super Admin',
      email: 'admin@sidak.com',
      password_hash: hash,
      role: 'super_admin'
    }
  });
  console.log('User ready:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
