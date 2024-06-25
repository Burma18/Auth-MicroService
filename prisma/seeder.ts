import { PrismaClient, UserRole, UserPlan, PlanRange } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  const users = [
    {
      firstName: 'Burma',
      lastName: 'Rysmatova',
      email: 'burma@wedevx.co',
      password: 'password123',
      stripeCustomerId: 'stripe_1234',
    },
    {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane.doe@example.com',
      password: 'password456',
      stripeCustomerId: 'stripe_5678',
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
}

async function seedCourses() {
  const courses = [
    {
      title: 'Sdet',
      isPublished: true,
      cover: 'https://example.com/intro-programming-cover.jpg',
      isActive: true,
      slug: 'intro-programming',
      updatedAt: new Date(),
    },
    {
      title: 'Devops',
      isPublished: true,
      cover: 'https://example.com/advanced-js-cover.jpg',
      isActive: true,
      slug: 'advanced-js-concepts',
      updatedAt: new Date(),
    },
  ];

  for (const course of courses) {
    await prisma.courseMaster.upsert({
      where: { title: course.title },
      update: {},
      create: course,
    });
  }
}

async function seedOrganizations() {
  const organizations = [
    {
      name: 'Org1',
      adminUrl: 'https://admin.org1.wedevx.co',
      studentUrl: 'https://student.org1.wedevx.co',
      userId: 1,
    },
    {
      name: 'Org2',
      adminUrl: 'https://admin.org2.wedevx.co',
      studentUrl: 'https://student.org2.wedevx.co',
      userId: 2,
    },
  ];

  for (const org of organizations) {
    await prisma.organizations.upsert({
      where: { name: org.name },
      update: {},
      create: org,
    });
  }
}

async function seedMemberships() {
  const memberships = [
    {
      userId: 1,
      organizationId: 2,
      role: UserRole.ADMIN,
    },
    {
      userId: 2,
      organizationId: 3,
      role: UserRole.USER,
    },
  ];

  for (const membership of memberships) {
    await prisma.memberships.upsert({
      where: {
        userId_organizationId: {
          userId: membership.userId,
          organizationId: membership.organizationId,
        },
      },
      update: {},
      create: {
        role: membership.role,
        userId: membership.userId,
        organizationId: membership.organizationId,
      },
    });
  }
}

async function seedUserSubscriptions() {
  const subscriptions = [
    {
      userId: 1,
      courseId: 1,
      plan: UserPlan.PREMIUM,
      planRange: PlanRange.MONTHLY,
      membershipId: 2,
    },
    {
      userId: 2,
      courseId: 2,
      plan: UserPlan.FREE,
      planRange: PlanRange.ANNUALLY,
      membershipId: 3,
    },
  ];

  for (const subscription of subscriptions) {
    await prisma.userSubscription.upsert({
      where: {
        userId_courseId: {
          userId: subscription.userId,
          courseId: subscription.courseId,
        },
      },
      update: {},
      create: {
        userId: subscription.userId,
        courseId: subscription.courseId,
        plan: subscription.plan,
        planRange: subscription.planRange,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        membershipId: subscription.membershipId,
      },
    });
  }
}

async function main() {
  try {
    await seedUsers();
    await seedOrganizations();
    await seedCourses();
    await seedMemberships();
    await seedUserSubscriptions();
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
