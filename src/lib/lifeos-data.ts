import { format, subDays } from "date-fns";

export type TaskStatus = "Backlog" | "Planned" | "In Progress" | "Waiting" | "Completed" | "Cancelled";
export type TaskPriority = "Critical" | "High" | "Medium" | "Low";
export type Mood = "Great" | "Good" | "Neutral" | "Stressed" | "Sad";
export type PlanType = "Daily" | "Weekly" | "Monthly" | "Quarterly" | "Yearly";
export type TransactionType = "Expense" | "Income" | "Investment" | "Transfer";

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  category: string;
  tags: string[];
  estimatedTime: number;
  actualTime?: number;
  projectId?: string;
  completedAt?: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  deadline: string;
  status: "Planned" | "Active" | "Paused" | "Completed" | "Cancelled";
  color: string;
  milestones: { title: string; completed: boolean }[];
};

export type Transaction = {
  id: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  date: string;
  account: string;
  tags: string[];
};

export type SavingGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  notes: string;
  color: string;
};

export type DiaryEntry = {
  id: string;
  title: string;
  content: string;
  mood: Mood;
  tags: string[];
  date: string;
  isLocked: boolean;
};

export type Habit = {
  id: string;
  name: string;
  color: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  targetCount: number;
  completedDates: string[];
};

export type PlannerItem = {
  id: string;
  type: PlanType;
  title: string;
  goals: string[];
  priorities: string[];
  notes: string;
  startDate: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  type: "Task" | "Goal" | "Event" | "Reminder";
  startsAt: string;
  endsAt?: string;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  folder: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
};

export type LifeNotification = {
  id: string;
  title: string;
  body: string;
  dueAt: string;
  status: "Unread" | "Read" | "Archived";
};

export type LifeOSState = {
  tasks: Task[];
  projects: Project[];
  transactions: Transaction[];
  savingGoals: SavingGoal[];
  diaryEntries: DiaryEntry[];
  habits: Habit[];
  planners: PlannerItem[];
  events: CalendarEvent[];
  notes: Note[];
  notifications: LifeNotification[];
  settings: {
    currency: string;
    language: string;
    theme: "dark" | "light";
  };
};

const today = "2026-06-25";
const yesterday = "2026-06-24";
const twoDaysAgo = "2026-06-23";

export const quote =
  "A system is a promise you make to your future self, then keep with small actions.";

export const seedLifeOSState: LifeOSState = {
  tasks: [
    {
      id: "task-1",
      title: "Edit YouTube video intro",
      description: "Tighten hook, lower the music bed, and export a clean 1080p draft.",
      priority: "High",
      status: "In Progress",
      dueDate: `${today}T18:00:00`,
      category: "Content",
      tags: ["youtube", "editing"],
      estimatedTime: 90,
      projectId: "project-web3",
    },
    {
      id: "task-2",
      title: "Follow up with ZYN contact",
      description: "Send final media proposal and suggest two meeting windows.",
      priority: "Critical",
      status: "Planned",
      dueDate: "2026-06-26T10:30:00",
      category: "Business",
      tags: ["sponsor", "btalk"],
      estimatedTime: 20,
      projectId: "project-btalk",
    },
    {
      id: "task-3",
      title: "Pay phone and software bills",
      description: "Clear recurring payments and log them in finance.",
      priority: "Medium",
      status: "Backlog",
      dueDate: "2026-06-28T12:00:00",
      category: "Admin",
      tags: ["bills"],
      estimatedTime: 15,
    },
    {
      id: "task-4",
      title: "Publish three podcast clips",
      description: "Schedule one clip per channel with title variations.",
      priority: "High",
      status: "Waiting",
      dueDate: "2026-06-27T21:00:00",
      category: "Content",
      tags: ["clips", "social"],
      estimatedTime: 60,
      projectId: "project-web3",
    },
    {
      id: "task-5",
      title: "Finish chapter three notes",
      description: "Condense the Heckscher-Ohlin section into presentation bullets.",
      priority: "Medium",
      status: "Completed",
      dueDate: `${today}T14:00:00`,
      category: "Study",
      tags: ["university"],
      estimatedTime: 45,
      actualTime: 40,
      completedAt: `${today}T13:40:00`,
    },
  ],
  projects: [
    {
      id: "project-web3",
      name: "Web3 Perspective",
      description: "Podcast content pipeline, sponsor assets, shorts, and publishing rhythm.",
      startDate: "2026-06-01",
      deadline: "2026-07-15",
      status: "Active",
      color: "#6ad6dd",
      milestones: [
        { title: "Record episode", completed: true },
        { title: "Edit final cut", completed: false },
        { title: "Publish clips", completed: false },
      ],
    },
    {
      id: "project-btalk",
      name: "BTalk Podcast",
      description: "Media proposal, partner outreach, and sponsor follow-up workflow.",
      startDate: "2026-06-10",
      deadline: "2026-06-30",
      status: "Active",
      color: "#f6a65f",
      milestones: [
        { title: "Proposal drafted", completed: true },
        { title: "High-res deck sent", completed: true },
        { title: "Sponsor call", completed: false },
      ],
    },
    {
      id: "project-finance",
      name: "Personal Finance",
      description: "Monthly budget, savings goals, spending review, and investment capital.",
      startDate: "2026-06-01",
      deadline: "2026-12-31",
      status: "Active",
      color: "#8bd450",
      milestones: [
        { title: "Track every expense", completed: true },
        { title: "Build emergency fund", completed: false },
        { title: "Invest consistently", completed: false },
      ],
    },
  ],
  transactions: [
    {
      id: "txn-1",
      type: "Expense",
      title: "Lunch meeting",
      amount: 12.5,
      category: "Food",
      date: today,
      account: "Cash",
      tags: ["meeting"],
    },
    {
      id: "txn-2",
      type: "Expense",
      title: "Adobe subscription",
      amount: 31.99,
      category: "Subscription",
      date: "2026-06-22",
      account: "Card",
      tags: ["software"],
    },
    {
      id: "txn-3",
      type: "Income",
      title: "Client editing payment",
      amount: 420,
      category: "Freelance",
      date: "2026-06-20",
      account: "Bank",
      tags: ["client"],
    },
    {
      id: "txn-4",
      type: "Income",
      title: "Podcast sponsor deposit",
      amount: 300,
      category: "Business",
      date: twoDaysAgo,
      account: "Bank",
      tags: ["btalk"],
    },
    {
      id: "txn-5",
      type: "Investment",
      title: "Index fund allocation",
      amount: 150,
      category: "Investment",
      date: yesterday,
      account: "Brokerage",
      tags: ["monthly"],
    },
    {
      id: "txn-6",
      type: "Expense",
      title: "Taxi to recording",
      amount: 6.2,
      category: "Transport",
      date: yesterday,
      account: "Cash",
      tags: ["podcast"],
    },
  ],
  savingGoals: [
    {
      id: "goal-camera",
      name: "Camera Upgrade",
      targetAmount: 1800,
      currentAmount: 760,
      deadline: "2026-09-30",
      notes: "Upgrade production quality for podcast and YouTube shoots.",
      color: "#8bd450",
    },
    {
      id: "goal-emergency",
      name: "Emergency Fund",
      targetAmount: 3000,
      currentAmount: 1320,
      deadline: "2026-12-31",
      notes: "Keep six months of essential expenses within reach.",
      color: "#6ad6dd",
    },
    {
      id: "goal-travel",
      name: "Travel Fund",
      targetAmount: 1200,
      currentAmount: 450,
      deadline: "2026-11-15",
      notes: "Trip buffer for flights, stays, and food.",
      color: "#f6a65f",
    },
  ],
  diaryEntries: [
    {
      id: "entry-1",
      title: "Resetting my workspace",
      content: "Cleared the desktop, organized the creative files, and set a calmer tone for the week.",
      mood: "Good",
      tags: ["reflection", "systems"],
      date: today,
      isLocked: false,
    },
    {
      id: "entry-2",
      title: "Podcast energy",
      content: "The strongest ideas today were around making every episode easier to repurpose into shorts.",
      mood: "Great",
      tags: ["podcast", "content"],
      date: yesterday,
      isLocked: false,
    },
  ],
  habits: [
    {
      id: "habit-1",
      name: "Journaling",
      color: "#f7bf4f",
      frequency: "Daily",
      targetCount: 1,
      completedDates: [twoDaysAgo, yesterday],
    },
    {
      id: "habit-2",
      name: "Reading",
      color: "#6ad6dd",
      frequency: "Daily",
      targetCount: 1,
      completedDates: [today, yesterday, twoDaysAgo],
    },
    {
      id: "habit-3",
      name: "Saving Money",
      color: "#8bd450",
      frequency: "Weekly",
      targetCount: 1,
      completedDates: [twoDaysAgo],
    },
    {
      id: "habit-4",
      name: "Exercise",
      color: "#f26d6d",
      frequency: "Daily",
      targetCount: 1,
      completedDates: [yesterday],
    },
  ],
  planners: [
    {
      id: "plan-daily",
      type: "Daily",
      title: "Thursday execution plan",
      goals: ["Ship LifeOS MVP", "Finish proposal follow-up", "Workout before dinner"],
      priorities: ["Content edit", "Sponsor follow-up", "Finance cleanup"],
      notes: "Keep the day practical and measurable.",
      startDate: today,
    },
    {
      id: "plan-weekly",
      type: "Weekly",
      title: "Week 4 review",
      goals: ["Publish new clip batch", "Reduce subscriptions", "Study chapter three"],
      priorities: ["Podcast", "Budget", "University"],
      notes: "End the week with a clean project board.",
      startDate: "2026-06-22",
    },
    {
      id: "plan-monthly",
      type: "Monthly",
      title: "June closeout",
      goals: ["Save $500", "Finish sponsor proposal", "Standardize content workflow"],
      priorities: ["Money", "Business", "Systems"],
      notes: "Review every recurring expense before July.",
      startDate: "2026-06-01",
    },
    {
      id: "plan-yearly",
      type: "Yearly",
      title: "2026 personal operating plan",
      goals: ["Grow business income", "Maintain health routine", "Build investment capital"],
      priorities: ["Career", "Finance", "Health"],
      notes: "Quarterly reviews decide what gets simplified.",
      startDate: "2026-01-01",
    },
  ],
  events: [
    {
      id: "event-1",
      title: "Edit YouTube video intro",
      type: "Task",
      startsAt: `${today}T18:00:00`,
    },
    {
      id: "event-2",
      title: "Sponsor follow-up",
      type: "Reminder",
      startsAt: "2026-06-26T10:30:00",
    },
    {
      id: "event-3",
      title: "Weekly review",
      type: "Event",
      startsAt: "2026-06-29T17:00:00",
    },
  ],
  notes: [
    {
      id: "note-1",
      title: "Content repurposing ideas",
      content: "Turn every long podcast into a quote card, three reels, one newsletter outline, and one sponsor insight.",
      folder: "Ideas",
      tags: ["content", "workflow"],
      isPinned: true,
      updatedAt: `${today}T09:30:00`,
    },
    {
      id: "note-2",
      title: "Heckscher-Ohlin study brief",
      content: "Focus on factor endowments, trade pattern predictions, and the Stolper-Samuelson connection.",
      folder: "Study",
      tags: ["economics"],
      isPinned: false,
      updatedAt: `${yesterday}T21:10:00`,
    },
  ],
  notifications: [
    {
      id: "notif-1",
      title: "Task due today",
      body: "Edit YouTube video intro before 6 PM.",
      dueAt: `${today}T18:00:00`,
      status: "Unread",
    },
    {
      id: "notif-2",
      title: "Savings checkpoint",
      body: "Camera Upgrade needs about $347/month to finish on time.",
      dueAt: "2026-06-30T09:00:00",
      status: "Unread",
    },
  ],
  settings: {
    currency: "USD",
    language: "English",
    theme: "dark",
  },
};

export function buildAnalytics(state: LifeOSState) {
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const completedToday = state.tasks.filter((task) => task.completedAt?.startsWith(todayKey)).length;
  const totalIncome = state.transactions
    .filter((transaction) => transaction.type === "Income")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpenses = state.transactions
    .filter((transaction) => transaction.type === "Expense")
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const todaySpent = state.transactions
    .filter((transaction) => transaction.type === "Expense" && transaction.date === todayKey)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const savedThisMonth = state.savingGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const activeGoals = state.savingGoals.filter((goal) => goal.currentAmount < goal.targetAmount).length;
  const completedHabits = state.habits.filter((habit) => habit.completedDates.includes(todayKey)).length;
  const habitCompletionRate = state.habits.length ? (completedHabits / state.habits.length) * 100 : 0;
  const completedTasks = state.tasks.filter((task) => task.status === "Completed").length;
  const productivityScore = state.tasks.length
    ? Math.round((completedTasks / state.tasks.length) * 65 + (habitCompletionRate / 100) * 35)
    : 0;

  const expenseByCategory = Object.values(
    state.transactions
      .filter((transaction) => transaction.type === "Expense")
      .reduce<Record<string, { name: string; value: number }>>((acc, transaction) => {
        acc[transaction.category] = acc[transaction.category] ?? {
          name: transaction.category,
          value: 0,
        };
        acc[transaction.category].value += transaction.amount;
        return acc;
      }, {}),
  );

  const cashflow = Array.from({ length: 6 }).map((_, index) => {
    const date = format(subDays(new Date(), 5 - index), "yyyy-MM-dd");
    const dayTransactions = state.transactions.filter((transaction) => transaction.date === date);
    return {
      date: format(new Date(`${date}T00:00:00`), "MMM d"),
      income: dayTransactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
      expense: dayTransactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    };
  });

  const taskStatus = ["Backlog", "Planned", "In Progress", "Waiting", "Completed"].map((status) => ({
    status,
    count: state.tasks.filter((task) => task.status === status).length,
  }));

  const savingsProgress = state.savingGoals.map((goal) => ({
    name: goal.name,
    saved: goal.currentAmount,
    target: goal.targetAmount,
  }));

  const habitConsistency = state.habits.map((habit) => ({
    name: habit.name,
    completion: Math.min(100, (habit.completedDates.length / 7) * 100),
  }));

  return {
    completedToday,
    totalIncome,
    totalExpenses,
    netCashflow: totalIncome - totalExpenses,
    todaySpent,
    savedThisMonth,
    activeGoals,
    productivityScore,
    habitCompletionRate,
    expenseByCategory,
    cashflow,
    taskStatus,
    savingsProgress,
    habitConsistency,
  };
}
