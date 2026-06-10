import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const gyms = [
    {
      name: 'Iron Paradise Gym',
      address: 'Civil Lines, Kanpur',
      latitude: 26.4637,
      longitude: 80.3455,
      phone: '9876543210',
      photos: [],
      amenities: ['Weights', 'Cardio', 'Locker Room'],
      rating: 4.5,
    },
    {
      name: 'FitZone Gym',
      address: 'Kakadeo, Kanpur',
      latitude: 26.4499,
      longitude: 80.3121,
      phone: '9876543211',
      photos: [],
      amenities: ['Weights', 'Yoga', 'Sauna'],
      rating: 4.2,
    },
    {
      name: 'PowerHouse Fitness',
      address: 'Kidwai Nagar, Kanpur',
      latitude: 26.4745,
      longitude: 80.3372,
      phone: '9876543212',
      photos: [],
      amenities: ['Crossfit', 'Cardio', 'Personal Training'],
      rating: 4.7,
    },
    {
      name: "Gold's Gym Kanpur",
      address: 'Swaroop Nagar, Kanpur',
      latitude: 26.4912,
      longitude: 80.3201,
      phone: '9876543213',
      photos: [],
      amenities: ['Weights', 'Cardio', 'Pool', 'Sauna'],
      rating: 4.8,
    },
    {
      name: 'Flex Fitness Studio',
      address: 'Govind Nagar, Kanpur',
      latitude: 26.4402,
      longitude: 80.3567,
      phone: '9876543214',
      photos: [],
      amenities: ['Zumba', 'Yoga', 'Weights'],
      rating: 4.0,
    },
  ]

  const createdGyms = []
  for (const gym of gyms) {
    const existing = await prisma.gym.findUnique({ where: { name: gym.name } })
    if (existing) {
      createdGyms.push(existing)
    } else {
      const created = await prisma.gym.create({ data: gym })
      createdGyms.push(created)
    }
  }

  console.log('✅ Seeded gyms')

  for (const gym of createdGyms) {
    await prisma.gymSession.deleteMany({ where: { gymId: gym.id } })

    const sessions = [
      {
        gymId: gym.id,
        type: 'demo',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        price: 199,
        slots: 10,
      },
      {
        gymId: gym.id,
        type: 'demo',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        price: 199,
        slots: 10,
      },
      {
        gymId: gym.id,
        type: 'day_pass',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        price: 499,
        slots: 20,
      },
      {
        gymId: gym.id,
        type: 'day_pass',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        price: 499,
        slots: 20,
      },
    ]

    await prisma.gymSession.createMany({ data: sessions })
  }

  console.log('✅ Seeded sessions')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())