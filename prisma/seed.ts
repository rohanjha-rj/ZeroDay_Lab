import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding fake vulnerable user data for SQLi lab...')
  
  // Vulnerable Users (SQLi)
  await prisma.vulnUser.createMany({
    data: [
      { username: 'admin', password: 'password123', role: 'superadmin' },
      { username: 'alice', password: 'password456', role: 'user' },
      { username: 'bob', password: 'password789', role: 'user' },
    ]
  })

  // Vulnerable Profiles (IDOR)
  await prisma.vulnProfile.createMany({
    data: [
      { id: 1, name: 'Admin', email: 'admin@company.com', role: '👑 superadmin' },
      { id: 2, name: 'Alice', email: 'alice@user.com', role: 'user' },
      { id: 3, name: 'Bob', email: 'bob@user.com', role: 'user' },
      { id: 5, name: 'You', email: 'you@user.com', role: 'user' },
    ]
  })

  // Bank transactions (CSRF)
  await prisma.vulnTransaction.createMany({
    data: [
      { userId: 5, to: 'Netflix', amount: -15 },
      { userId: 5, to: 'Salary', amount: 5000 }
    ]
  })

  console.log('Data seeded successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
