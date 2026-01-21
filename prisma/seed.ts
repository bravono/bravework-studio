import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.roles.upsert({
    where: { role_name: 'contributor' },
    update: {},
    create: { role_name: 'contributor' },
  })
}

main().finally(() => prisma.$disconnect())