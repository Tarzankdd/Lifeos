import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  ExpenseCategory,
  HabitFrequency,
  IncomeCategory,
  Mood,
  PlannerType,
  PrismaClient,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL ?? "postgresql://lifeos:lifeos@localhost:5432/lifeos?schema=public",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await hash("lifeos-demo", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@lifeos.local" },
    update: {},
    create: {
      name: "Kanal Chun",
      email: "demo@lifeos.local",
      passwordHash,
      currency: "USD",
      language: "en",
      theme: "dark",
    },
  });

  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.habitLog.deleteMany({ where: { userId: user.id } });
  await prisma.habit.deleteMany({ where: { userId: user.id } });
  await prisma.subTask.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.project.deleteMany({ where: { userId: user.id } });
  await prisma.savingTransaction.deleteMany({ where: { userId: user.id } });
  await prisma.savingGoal.deleteMany({ where: { userId: user.id } });
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.income.deleteMany({ where: { userId: user.id } });
  await prisma.diaryEntry.deleteMany({ where: { userId: user.id } });
  await prisma.planner.deleteMany({ where: { userId: user.id } });
  await prisma.event.deleteMany({ where: { userId: user.id } });
  await prisma.note.deleteMany({ where: { userId: user.id } });
  await prisma.category.deleteMany({ where: { userId: user.id } });
  await prisma.tag.deleteMany({ where: { userId: user.id } });

  const web3 = await prisma.project.create({
    data: {
      userId: user.id,
      name: "Web3 Perspective",
      description: "Podcast content pipeline, sponsors, publishing, and audience growth.",
      startDate: new Date("2026-06-01"),
      deadline: new Date("2026-07-15"),
      status: ProjectStatus.ACTIVE,
      color: "#6ad6dd",
      milestones: [
        { title: "Record episode", completed: true },
        { title: "Edit final cut", completed: false },
        { title: "Publish clips", completed: false },
      ],
    },
  });

  const btalk = await prisma.project.create({
    data: {
      userId: user.id,
      name: "BTalk Podcast",
      description: "Media proposal, partnership assets, and sponsor follow-ups.",
      startDate: new Date("2026-06-10"),
      deadline: new Date("2026-06-30"),
      status: ProjectStatus.ACTIVE,
      color: "#f6a65f",
      milestones: [
        { title: "Proposal drafted", completed: true },
        { title: "High-res deck sent", completed: true },
        { title: "Sponsor call", completed: false },
      ],
    },
  });

  await prisma.task.createMany({
    data: [
      {
        userId: user.id,
        projectId: web3.id,
        title: "Edit YouTube video intro",
        description: "Tighten hook, lower music bed, export 1080p version.",
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date("2026-06-25T18:00:00+07:00"),
        category: "Content",
        tags: ["youtube", "editing"],
        estimatedTime: 90,
      },
      {
        userId: user.id,
        projectId: btalk.id,
        title: "Follow up with ZYN contact",
        description: "Send final proposal and suggest meeting windows.",
        priority: TaskPriority.CRITICAL,
        status: TaskStatus.PLANNED,
        dueDate: new Date("2026-06-26T10:30:00+07:00"),
        category: "Business",
        tags: ["sponsor", "btalk"],
        estimatedTime: 20,
      },
      {
        userId: user.id,
        title: "Pay phone and software bills",
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.BACKLOG,
        dueDate: new Date("2026-06-28T12:00:00+07:00"),
        category: "Admin",
        tags: ["bills"],
        estimatedTime: 15,
      },
      {
        userId: user.id,
        projectId: web3.id,
        title: "Publish three podcast clips",
        priority: TaskPriority.HIGH,
        status: TaskStatus.WAITING,
        dueDate: new Date("2026-06-27T21:00:00+07:00"),
        category: "Content",
        tags: ["clips", "social"],
        estimatedTime: 60,
      },
    ],
  });

  await prisma.diaryEntry.createMany({
    data: [
      {
        userId: user.id,
        title: "Resetting my workspace",
        content:
          "Cleared the desktop, organized the creative files, and set a calmer tone for the week.",
        mood: Mood.GOOD,
        tags: ["reflection", "systems"],
        date: new Date("2026-06-25"),
      },
      {
        userId: user.id,
        title: "Podcast energy",
        content:
          "The strongest ideas today were around making every episode easier to repurpose into shorts.",
        mood: Mood.GREAT,
        tags: ["podcast", "content"],
        date: new Date("2026-06-24"),
      },
    ],
  });

  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        title: "Lunch meeting",
        amount: "12.50",
        category: ExpenseCategory.FOOD,
        date: new Date("2026-06-25"),
        tags: ["meeting"],
      },
      {
        userId: user.id,
        title: "Adobe subscription",
        amount: "31.99",
        category: ExpenseCategory.SUBSCRIPTION,
        date: new Date("2026-06-22"),
        tags: ["software"],
      },
      {
        userId: user.id,
        title: "Taxi to recording",
        amount: "6.20",
        category: ExpenseCategory.TRANSPORT,
        date: new Date("2026-06-24"),
        tags: ["podcast"],
      },
    ],
  });

  await prisma.income.createMany({
    data: [
      {
        userId: user.id,
        title: "Client editing payment",
        amount: "420.00",
        category: IncomeCategory.FREELANCE,
        source: "Video client",
        date: new Date("2026-06-20"),
      },
      {
        userId: user.id,
        title: "Podcast sponsor deposit",
        amount: "300.00",
        category: IncomeCategory.BUSINESS,
        source: "BTalk",
        date: new Date("2026-06-23"),
      },
    ],
  });

  const camera = await prisma.savingGoal.create({
    data: {
      userId: user.id,
      name: "Camera Upgrade",
      targetAmount: "1800.00",
      currentAmount: "760.00",
      deadline: new Date("2026-09-30"),
      notes: "Upgrade production quality for podcast and YouTube shoots.",
      color: "#8bd450",
      milestones: [
        { amount: 500, label: "Base saved" },
        { amount: 1200, label: "Lens ready" },
        { amount: 1800, label: "Buy camera" },
      ],
    },
  });

  await prisma.savingTransaction.create({
    data: {
      userId: user.id,
      savingGoalId: camera.id,
      amount: "120.00",
      note: "Freelance income split",
      date: new Date("2026-06-23"),
    },
  });

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: "Journaling",
      description: "One useful reflection each day.",
      frequency: HabitFrequency.DAILY,
      color: "#f7bf4f",
    },
  });

  await prisma.habitLog.createMany({
    data: [
      { userId: user.id, habitId: habit.id, date: new Date("2026-06-23"), completed: true, count: 1 },
      { userId: user.id, habitId: habit.id, date: new Date("2026-06-24"), completed: true, count: 1 },
      { userId: user.id, habitId: habit.id, date: new Date("2026-06-25"), completed: false, count: 0 },
    ],
  });

  await prisma.planner.create({
    data: {
      userId: user.id,
      type: PlannerType.DAILY,
      title: "Thursday execution plan",
      goals: ["Ship LifeOS MVP", "Finish proposal follow-up", "Workout before dinner"],
      priorities: ["Content edit", "Sponsor follow-up", "Finance cleanup"],
      schedule: [
        { time: "09:00", title: "Deep work" },
        { time: "14:00", title: "Podcast edit" },
        { time: "18:00", title: "Review money log" },
      ],
      notes: "Keep the day practical and measurable.",
      startDate: new Date("2026-06-25"),
    },
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      title: "Content repurposing ideas",
      content:
        "Turn every long podcast into a quote card, 3 reels, 1 newsletter outline, and 1 sponsor insight.",
      folder: "Ideas",
      tags: ["content", "workflow"],
      isPinned: true,
    },
  });

  await prisma.event.createMany({
    data: [
      {
        userId: user.id,
        title: "Sponsor follow-up",
        type: "REMINDER",
        startsAt: new Date("2026-06-26T10:30:00+07:00"),
      },
      {
        userId: user.id,
        title: "Weekly review",
        type: "EVENT",
        startsAt: new Date("2026-06-29T17:00:00+07:00"),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        title: "Task due today",
        body: "Edit YouTube video intro before 6 PM.",
        dueAt: new Date("2026-06-25T18:00:00+07:00"),
      },
      {
        userId: user.id,
        title: "Savings checkpoint",
        body: "Camera Upgrade needs $347/month to finish on time.",
        dueAt: new Date("2026-06-30T09:00:00+07:00"),
      },
    ],
  });

  await prisma.category.createMany({
    data: [
      { userId: user.id, name: "Food", type: "expense", color: "#f6a65f" },
      { userId: user.id, name: "Content", type: "task", color: "#6ad6dd" },
      { userId: user.id, name: "Business", type: "task", color: "#8bd450" },
    ],
  });

  await prisma.tag.createMany({
    data: [
      { userId: user.id, name: "podcast", color: "#6ad6dd" },
      { userId: user.id, name: "finance", color: "#8bd450" },
      { userId: user.id, name: "study", color: "#f7bf4f" },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
