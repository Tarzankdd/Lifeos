import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Delegate = {
  findMany(args: Record<string, unknown>): Promise<unknown>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
};

const resourceModels = {
  "diary-entries": "diaryEntry",
  expenses: "expense",
  income: "income",
  "saving-goals": "savingGoal",
  "saving-transactions": "savingTransaction",
  tasks: "task",
  subtasks: "subTask",
  projects: "project",
  habits: "habit",
  "habit-logs": "habitLog",
  planners: "planner",
  events: "event",
  notes: "note",
  categories: "category",
  tags: "tag",
  notifications: "notification",
} as const;

type RouteContext = {
  params: Promise<{ resource: string }>;
};

function getDelegate(resource: string) {
  const modelName = resourceModels[resource as keyof typeof resourceModels];
  if (!modelName) return null;
  return (prisma as unknown as Record<string, Delegate>)[modelName];
}

async function getUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}

export async function GET(_request: Request, context: RouteContext) {
  const { resource } = await context.params;
  const delegate = getDelegate(resource);
  if (!delegate) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const records = await delegate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(records);
}

export async function POST(request: Request, context: RouteContext) {
  const { resource } = await context.params;
  const delegate = getDelegate(resource);
  if (!delegate) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const data = (await request.json()) as Record<string, unknown>;
  const record = await delegate.create({
    data: {
      ...data,
      userId,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
