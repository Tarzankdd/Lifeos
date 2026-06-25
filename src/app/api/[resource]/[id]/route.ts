import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Delegate = {
  findFirst(args: Record<string, unknown>): Promise<unknown>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
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
  params: Promise<{ resource: string; id: string }>;
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

async function assertOwnedRecord(delegate: Delegate, id: string, userId: string) {
  return delegate.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  const delegate = getDelegate(resource);
  if (!delegate) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const record = await assertOwnedRecord(delegate, id, userId);
  if (!record) return NextResponse.json({ error: "Not found." }, { status: 404 });

  return NextResponse.json(record);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  const delegate = getDelegate(resource);
  if (!delegate) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const existing = await assertOwnedRecord(delegate, id, userId);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const data = (await request.json()) as Record<string, unknown>;
  const record = await delegate.update({
    where: { id },
    data,
  });

  return NextResponse.json(record);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { resource, id } = await context.params;
  const delegate = getDelegate(resource);
  if (!delegate) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });

  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const existing = await assertOwnedRecord(delegate, id, userId);
  if (!existing) return NextResponse.json({ error: "Not found." }, { status: 404 });

  await delegate.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
