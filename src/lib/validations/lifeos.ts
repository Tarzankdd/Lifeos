import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const taskSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(1200).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  status: z
    .enum(["BACKLOG", "PLANNED", "IN_PROGRESS", "WAITING", "COMPLETED", "CANCELLED"])
    .default("BACKLOG"),
  dueDate: z.string().datetime().optional(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string()).default([]),
});

export const expenseSchema = z.object({
  title: z.string().min(1).max(160),
  amount: z.coerce.number().positive(),
  category: z
    .enum([
      "FOOD",
      "TRANSPORT",
      "SHOPPING",
      "EDUCATION",
      "ENTERTAINMENT",
      "HEALTH",
      "BUSINESS",
      "INVESTMENT",
      "TRAVEL",
      "SUBSCRIPTION",
      "OTHER",
    ])
    .default("OTHER"),
  date: z.string().datetime(),
  notes: z.string().max(1200).optional(),
  tags: z.array(z.string()).default([]),
});

export const incomeSchema = z.object({
  title: z.string().min(1).max(160),
  amount: z.coerce.number().positive(),
  category: z.enum(["SALARY", "FREELANCE", "BUSINESS", "INVESTMENT", "GIFT", "OTHER"]).default("OTHER"),
  date: z.string().datetime(),
  source: z.string().max(120).optional(),
  notes: z.string().max(1200).optional(),
  tags: z.array(z.string()).default([]),
});

export const diaryEntrySchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1),
  mood: z.enum(["GREAT", "GOOD", "NEUTRAL", "STRESSED", "SAD"]).default("NEUTRAL"),
  tags: z.array(z.string()).default([]),
  date: z.string().datetime(),
  isLocked: z.boolean().default(false),
});

export const savingGoalSchema = z.object({
  name: z.string().min(1).max(160),
  targetAmount: z.coerce.number().positive(),
  currentAmount: z.coerce.number().min(0).default(0),
  deadline: z.string().datetime().optional(),
  notes: z.string().max(1200).optional(),
});

export const noteSchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1),
  folder: z.string().max(80).optional(),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
});
