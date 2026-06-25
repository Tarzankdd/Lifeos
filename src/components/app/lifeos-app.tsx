"use client";

import {
  DndContext,
  type DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Archive,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  Download,
  Flag,
  Goal,
  GripVertical,
  HeartPulse,
  LayoutDashboard,
  ListTodo,
  Moon,
  NotebookPen,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAnalytics,
  quote,
  seedLifeOSState,
  type CalendarEvent,
  type DiaryEntry,
  type Habit,
  type LifeOSState,
  type Note,
  type PlanType,
  type SavingGoal,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type Transaction,
  type TransactionType,
} from "@/lib/lifeos-data";
import { cn, formatCurrency, formatPercent, toISODate, uid } from "@/lib/utils";

type Section =
  | "Dashboard"
  | "Tasks"
  | "Finance"
  | "Savings"
  | "Diary"
  | "Projects"
  | "Habits"
  | "Planner"
  | "Calendar"
  | "Notes"
  | "Notifications"
  | "Settings";

const navItems: { id: Section; icon: typeof LayoutDashboard }[] = [
  { id: "Dashboard", icon: LayoutDashboard },
  { id: "Tasks", icon: ListTodo },
  { id: "Finance", icon: WalletCards },
  { id: "Savings", icon: Goal },
  { id: "Diary", icon: NotebookPen },
  { id: "Projects", icon: ClipboardList },
  { id: "Habits", icon: HeartPulse },
  { id: "Planner", icon: CalendarDays },
  { id: "Calendar", icon: Clock3 },
  { id: "Notes", icon: BookOpen },
  { id: "Notifications", icon: Bell },
  { id: "Settings", icon: Settings },
];

const taskStatuses: TaskStatus[] = ["Backlog", "Planned", "In Progress", "Waiting", "Completed"];
const priorityTone: Record<TaskPriority, "red" | "amber" | "cyan" | "neutral"> = {
  Critical: "red",
  High: "amber",
  Medium: "cyan",
  Low: "neutral",
};
const chartColors = ["#8bd450", "#6ad6dd", "#f7bf4f", "#f26d6d", "#b995ff"];
const storageKey = "lifeos-state-v1";

const inputClass =
  "h-10 w-full rounded-md border border-white/10 bg-black/20 px-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#8bd450]/50 focus:ring-2 focus:ring-[#8bd450]/15";
const textareaClass =
  "min-h-24 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-[#8bd450]/50 focus:ring-2 focus:ring-[#8bd450]/15";

export function LifeOSApp() {
  const [activeSection, setActiveSection] = useState<Section>("Dashboard");
  const [query, setQuery] = useState("");
  const [now, setNow] = useState<Date | null>(null);
  const [state, setState] = useState<LifeOSState>(() => {
    if (typeof window === "undefined") return seedLifeOSState;
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return seedLifeOSState;
    try {
      return JSON.parse(stored) as LifeOSState;
    } catch {
      return seedLifeOSState;
    }
  });
  const [taskDraft, setTaskDraft] = useState({
    title: "",
    priority: "Medium" as TaskPriority,
    dueDate: toISODate(new Date()),
  });
  const [transactionDraft, setTransactionDraft] = useState({
    title: "",
    amount: "",
    type: "Expense" as TransactionType,
    category: "Food",
  });
  const [journalDraft, setJournalDraft] = useState({
    title: "",
    content: "",
    mood: "Good" as DiaryEntry["mood"],
  });
  const [goalDraft, setGoalDraft] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: "2026-12-31",
  });
  const [noteDraft, setNoteDraft] = useState({
    title: "",
    content: "",
    folder: "Ideas",
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const firstTick = window.setTimeout(() => setNow(new Date()), 0);
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("light", state.settings.theme === "light");
  }, [state.settings.theme]);

  const analytics = useMemo(() => buildAnalytics(state), [state]);
  const todayKey = now ? toISODate(now) : toISODate(new Date());
  const todayTasks = state.tasks.filter((task) => task.dueDate.startsWith(todayKey));
  const upcomingTasks = state.tasks
    .filter((task) => task.status !== "Completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);
  const filteredNotes = state.notes.filter((note) =>
    `${note.title} ${note.content} ${note.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  const filteredJournal = state.diaryEntries.filter((entry) =>
    `${entry.title} ${entry.content} ${entry.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );

  function addTask() {
    if (!taskDraft.title.trim()) return;
    const task: Task = {
      id: uid("task"),
      title: taskDraft.title.trim(),
      description: "",
      priority: taskDraft.priority,
      status: "Backlog",
      dueDate: `${taskDraft.dueDate}T09:00:00`,
      category: "Inbox",
      tags: ["quick-add"],
      estimatedTime: 30,
    };
    setState((current) => ({ ...current, tasks: [task, ...current.tasks] }));
    setTaskDraft({ title: "", priority: "Medium", dueDate: toISODate(new Date()) });
  }

  function addTransaction() {
    const amount = Number(transactionDraft.amount);
    if (!transactionDraft.title.trim() || Number.isNaN(amount) || amount <= 0) return;
    const transaction: Transaction = {
      id: uid("txn"),
      title: transactionDraft.title.trim(),
      amount,
      type: transactionDraft.type,
      category: transactionDraft.category,
      date: todayKey,
      account: "Wallet",
      tags: ["manual"],
    };
    setState((current) => ({ ...current, transactions: [transaction, ...current.transactions] }));
    setTransactionDraft({ title: "", amount: "", type: "Expense", category: "Food" });
  }

  function addJournalEntry() {
    if (!journalDraft.title.trim() || !journalDraft.content.trim()) return;
    const entry: DiaryEntry = {
      id: uid("entry"),
      title: journalDraft.title.trim(),
      content: journalDraft.content.trim(),
      mood: journalDraft.mood,
      tags: ["daily"],
      date: todayKey,
      isLocked: false,
    };
    setState((current) => ({ ...current, diaryEntries: [entry, ...current.diaryEntries] }));
    setJournalDraft({ title: "", content: "", mood: "Good" });
  }

  function addSavingGoal() {
    const targetAmount = Number(goalDraft.targetAmount);
    const currentAmount = Number(goalDraft.currentAmount);
    if (!goalDraft.name.trim() || Number.isNaN(targetAmount) || targetAmount <= 0) return;
    const goal: SavingGoal = {
      id: uid("goal"),
      name: goalDraft.name.trim(),
      targetAmount,
      currentAmount: Number.isNaN(currentAmount) ? 0 : currentAmount,
      deadline: goalDraft.deadline,
      notes: "",
      color: chartColors[state.savingGoals.length % chartColors.length],
    };
    setState((current) => ({ ...current, savingGoals: [goal, ...current.savingGoals] }));
    setGoalDraft({ name: "", targetAmount: "", currentAmount: "", deadline: "2026-12-31" });
  }

  function addNote() {
    if (!noteDraft.title.trim() || !noteDraft.content.trim()) return;
    const note: Note = {
      id: uid("note"),
      title: noteDraft.title.trim(),
      content: noteDraft.content.trim(),
      folder: noteDraft.folder,
      tags: ["manual"],
      isPinned: false,
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, notes: [note, ...current.notes] }));
    setNoteDraft({ title: "", content: "", folder: "Ideas" });
  }

  function updateTaskStatus(taskId: string, status: TaskStatus) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              completedAt: status === "Completed" ? new Date().toISOString() : undefined,
            }
          : task,
      ),
    }));
  }

  function deleteTask(taskId: string) {
    setState((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== taskId),
    }));
  }

  function deleteTransaction(transactionId: string) {
    setState((current) => ({
      ...current,
      transactions: current.transactions.filter((transaction) => transaction.id !== transactionId),
    }));
  }

  function deleteNote(noteId: string) {
    setState((current) => ({
      ...current,
      notes: current.notes.filter((note) => note.id !== noteId),
    }));
  }

  function toggleHabit(habitId: string) {
    setState((current) => ({
      ...current,
      habits: current.habits.map((habit) => {
        if (habit.id !== habitId) return habit;
        const completed = habit.completedDates.includes(todayKey);
        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter((date) => date !== todayKey)
            : [todayKey, ...habit.completedDates],
        };
      }),
    }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    const status = event.over?.id as TaskStatus | undefined;
    if (status && taskStatuses.includes(status)) {
      updateTaskStatus(taskId, status);
    }
  }

  function exportFinanceCsv() {
    const header = "type,title,amount,category,date,account,tags";
    const rows = state.transactions.map((transaction) =>
      [
        transaction.type,
        transaction.title,
        transaction.amount,
        transaction.category,
        transaction.date,
        transaction.account,
        transaction.tags.join("|"),
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(","),
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lifeos-finance-${todayKey}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function resetDemoData() {
    setState(seedLifeOSState);
    window.localStorage.removeItem(storageKey);
  }

  return (
    <div className="min-h-screen bg-[#0d0f0c] text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#11130f] lg:block">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-white/[0.08] px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8bd450] text-[#11130f]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-semibold">LifeOS</p>
                  <p className="text-xs text-zinc-500">Personal command center</p>
                </div>
              </div>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm text-zinc-400 transition hover:bg-white/[0.06] hover:text-white",
                      activeSection === item.id && "bg-white/[0.08] text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.id}
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-white/[0.08] p-4">
              <div className="rounded-lg border border-[#8bd450]/20 bg-[#8bd450]/10 p-3">
                <p className="text-xs text-zinc-400">Weekly productivity</p>
                <p className="mt-1 text-2xl font-semibold text-[#c8f5a4]">
                  {analytics.productivityScore}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/[0.08] bg-[#0d0f0c]/90 backdrop-blur">
            <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#8bd450]">LifeOS</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal text-white md:text-3xl">
                  {activeSection}
                </h1>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    className={cn(inputClass, "pl-9")}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search LifeOS"
                  />
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  title="Toggle theme"
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      settings: {
                        ...current.settings,
                        theme: current.settings.theme === "dark" ? "light" : "dark",
                      },
                    }))
                  }
                >
                  <Moon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSection(item.id)}
                  className="shrink-0"
                >
                  {item.id}
                </Button>
              ))}
            </div>
          </header>

          <div className="px-4 py-5 lg:px-6">
            {activeSection === "Dashboard" && (
              <DashboardSection
                analytics={analytics}
                now={now}
                todayTasks={todayTasks}
                upcomingTasks={upcomingTasks}
                habits={state.habits}
                savingGoals={state.savingGoals}
                currency={state.settings.currency}
              />
            )}
            {activeSection === "Tasks" && (
              <TasksSection
                tasks={state.tasks}
                taskDraft={taskDraft}
                setTaskDraft={setTaskDraft}
                addTask={addTask}
                updateTaskStatus={updateTaskStatus}
                deleteTask={deleteTask}
                onDragEnd={handleDragEnd}
              />
            )}
            {activeSection === "Finance" && (
              <FinanceSection
                analytics={analytics}
                transactions={state.transactions}
                transactionDraft={transactionDraft}
                setTransactionDraft={setTransactionDraft}
                addTransaction={addTransaction}
                deleteTransaction={deleteTransaction}
                exportFinanceCsv={exportFinanceCsv}
                currency={state.settings.currency}
              />
            )}
            {activeSection === "Savings" && (
              <SavingsSection
                goals={state.savingGoals}
                goalDraft={goalDraft}
                setGoalDraft={setGoalDraft}
                addSavingGoal={addSavingGoal}
                currency={state.settings.currency}
                referenceTime={now?.getTime() ?? Date.parse("2026-06-25T00:00:00")}
              />
            )}
            {activeSection === "Diary" && (
              <DiarySection
                entries={filteredJournal}
                journalDraft={journalDraft}
                setJournalDraft={setJournalDraft}
                addJournalEntry={addJournalEntry}
              />
            )}
            {activeSection === "Projects" && <ProjectsSection state={state} />}
            {activeSection === "Habits" && (
              <HabitsSection habits={state.habits} toggleHabit={toggleHabit} todayKey={todayKey} />
            )}
            {activeSection === "Planner" && <PlannerSection planners={state.planners} />}
            {activeSection === "Calendar" && <CalendarSection events={state.events} tasks={state.tasks} />}
            {activeSection === "Notes" && (
              <NotesSection
                notes={filteredNotes}
                noteDraft={noteDraft}
                setNoteDraft={setNoteDraft}
                addNote={addNote}
                deleteNote={deleteNote}
              />
            )}
            {activeSection === "Notifications" && (
              <NotificationsSection notifications={state.notifications} />
            )}
            {activeSection === "Settings" && (
              <SettingsSection
                state={state}
                setState={setState}
                resetDemoData={resetDemoData}
                exportFinanceCsv={exportFinanceCsv}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardSection({
  analytics,
  now,
  todayTasks,
  upcomingTasks,
  habits,
  savingGoals,
  currency,
}: {
  analytics: ReturnType<typeof buildAnalytics>;
  now: Date | null;
  todayTasks: Task[];
  upcomingTasks: Task[];
  habits: Habit[];
  savingGoals: SavingGoal[];
  currency: string;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Tasks completed"
            value={String(analytics.completedToday)}
            detail="today"
            icon={Check}
          />
          <MetricCard
            label="Spent today"
            value={formatCurrency(analytics.todaySpent, currency)}
            detail="expenses"
            icon={CircleDollarSign}
          />
          <MetricCard
            label="Saved"
            value={formatCurrency(analytics.savedThisMonth, currency)}
            detail="all goals"
            icon={Target}
          />
          <MetricCard
            label="Productivity"
            value={String(analytics.productivityScore)}
            detail="weekly score"
            icon={TrendingUp}
          />
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Today Overview</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                {now ? format(now, "EEEE, MMMM d, yyyy - h:mm a") : "Loading current time"}
              </p>
            </div>
            <Badge tone="green">{formatPercent(analytics.habitCompletionRate)} habits</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              <blockquote className="rounded-lg border border-[#8bd450]/20 bg-[#8bd450]/10 p-4 text-sm leading-6 text-[#d6f8ba]">
                {quote}
              </blockquote>
              <div className="grid gap-3 md:grid-cols-2">
                {todayTasks.map((task) => (
                  <div key={task.id} className="rounded-lg border border-white/[0.08] bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{task.title}</p>
                      <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">{format(new Date(task.dueDate), "h:mm a")}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {savingGoals.slice(0, 3).map((goal) => (
                <ProgressRow
                  key={goal.id}
                  label={goal.name}
                  value={goal.currentAmount}
                  max={goal.targetAmount}
                  color={goal.color}
                  suffix={formatCurrency(goal.targetAmount, currency)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Cash Flow">
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={analytics.cashflow}>
                <defs>
                  <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8bd450" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#8bd450" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="income" stroke="#8bd450" fill="url(#income)" />
                <Area type="monotone" dataKey="expense" stroke="#f26d6d" fill="#f26d6d22" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Expense Mix">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={analytics.expenseByCategory} innerRadius={55} outerRadius={90} dataKey="value">
                  {analytics.expenseByCategory.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <ChartCard title="Task Completion">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.taskStatus}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="status" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#6ad6dd" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Habit Consistency">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.habitConsistency} layout="vertical">
                <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#71717a"
                  width={90}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="completion" radius={[0, 6, 6, 0]} fill="#f7bf4f" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-[#8bd450]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.title}</p>
                  <p className="text-xs text-zinc-500">{format(new Date(task.dueDate), "MMM d, h:mm a")}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Habits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {habits.map((habit) => (
              <ProgressRow
                key={habit.id}
                label={habit.name}
                value={habit.completedDates.length}
                max={7}
                color={habit.color}
                suffix={`${habit.completedDates.length}/7`}
              />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TasksSection({
  tasks,
  taskDraft,
  setTaskDraft,
  addTask,
  updateTaskStatus,
  deleteTask,
  onDragEnd,
}: {
  tasks: Task[];
  taskDraft: { title: string; priority: TaskPriority; dueDate: string };
  setTaskDraft: (draft: { title: string; priority: TaskPriority; dueDate: string }) => void;
  addTask: () => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="grid gap-3 md:grid-cols-[1fr_160px_160px_auto]">
          <input
            className={inputClass}
            value={taskDraft.title}
            onChange={(event) => setTaskDraft({ ...taskDraft, title: event.target.value })}
            placeholder="Quick add task"
          />
          <select
            className={inputClass}
            value={taskDraft.priority}
            onChange={(event) => setTaskDraft({ ...taskDraft, priority: event.target.value as TaskPriority })}
          >
            {(["Critical", "High", "Medium", "Low"] satisfies TaskPriority[]).map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
          <input
            className={inputClass}
            type="date"
            value={taskDraft.dueDate}
            onChange={(event) => setTaskDraft({ ...taskDraft, dueDate: event.target.value })}
          />
          <Button onClick={addTask}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </CardContent>
      </Card>

      <DndContext onDragEnd={onDragEnd}>
        <div className="grid gap-4 xl:grid-cols-5">
          {taskStatuses.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              updateTaskStatus={updateTaskStatus}
              deleteTask={deleteTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  status,
  tasks,
  updateTaskStatus,
  deleteTask,
}: {
  status: TaskStatus;
  tasks: Task[];
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Card className={cn("min-h-96", isOver && "border-[#8bd450]/60 bg-[#8bd450]/5")}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{status}</CardTitle>
        <Badge>{tasks.length}</Badge>
      </CardHeader>
      <CardContent ref={setNodeRef} className="space-y-3">
        {tasks.map((task) => (
          <KanbanTask
            key={task.id}
            task={task}
            updateTaskStatus={updateTaskStatus}
            deleteTask={deleteTask}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function KanbanTask({
  task,
  updateTaskStatus,
  deleteTask,
}: {
  task: Task;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  deleteTask: (taskId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border border-white/[0.08] bg-black/25 p-3 shadow-sm",
        isDragging && "opacity-60 ring-2 ring-[#8bd450]/50",
      )}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 text-zinc-600 hover:text-zinc-300"
          title="Drag task"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-5">{task.title}</p>
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-zinc-500">{task.description}</p>
        </div>
        <Button variant="ghost" size="icon" title="Delete task" onClick={() => deleteTask(task.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge tone={priorityTone[task.priority]}>{task.priority}</Badge>
        <Badge tone="neutral">{format(new Date(task.dueDate), "MMM d")}</Badge>
      </div>
      <select
        className={cn(inputClass, "mt-3 h-8 text-xs")}
        value={task.status}
        onChange={(event) => updateTaskStatus(task.id, event.target.value as TaskStatus)}
      >
        {taskStatuses.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
    </div>
  );
}

function FinanceSection({
  analytics,
  transactions,
  transactionDraft,
  setTransactionDraft,
  addTransaction,
  deleteTransaction,
  exportFinanceCsv,
  currency,
}: {
  analytics: ReturnType<typeof buildAnalytics>;
  transactions: Transaction[];
  transactionDraft: { title: string; amount: string; type: TransactionType; category: string };
  setTransactionDraft: (draft: { title: string; amount: string; type: TransactionType; category: string }) => void;
  addTransaction: () => void;
  deleteTransaction: (transactionId: string) => void;
  exportFinanceCsv: () => void;
  currency: string;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard label="Income" value={formatCurrency(analytics.totalIncome, currency)} detail="month" icon={TrendingUp} />
          <MetricCard label="Expenses" value={formatCurrency(analytics.totalExpenses, currency)} detail="month" icon={CircleDollarSign} />
          <MetricCard label="Net cash flow" value={formatCurrency(analytics.netCashflow, currency)} detail="month" icon={WalletCards} />
        </div>
        <ChartCard title="Daily Cash Flow">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.cashflow}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="income" fill="#8bd450" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#f26d6d" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ledger</CardTitle>
            <Button variant="secondary" size="sm" onClick={exportFinanceCsv}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-zinc-500">
                <tr>
                  <th className="pb-3 font-medium">Title</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 text-right font-medium">Amount</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-3 font-medium">{transaction.title}</td>
                    <td className="py-3">
                      <Badge tone={transaction.type === "Income" ? "green" : transaction.type === "Expense" ? "red" : "cyan"}>
                        {transaction.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-zinc-400">{transaction.category}</td>
                    <td className="py-3 text-zinc-400">{format(new Date(`${transaction.date}T00:00:00`), "MMM d")}</td>
                    <td className="py-3 text-right font-medium">
                      {formatCurrency(transaction.amount, currency)}
                    </td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="icon" title="Delete transaction" onClick={() => deleteTransaction(transaction.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className={inputClass}
            value={transactionDraft.title}
            onChange={(event) => setTransactionDraft({ ...transactionDraft, title: event.target.value })}
            placeholder="Title"
          />
          <input
            className={inputClass}
            value={transactionDraft.amount}
            onChange={(event) => setTransactionDraft({ ...transactionDraft, amount: event.target.value })}
            placeholder="Amount"
            inputMode="decimal"
          />
          <select
            className={inputClass}
            value={transactionDraft.type}
            onChange={(event) => setTransactionDraft({ ...transactionDraft, type: event.target.value as TransactionType })}
          >
            {(["Expense", "Income", "Investment", "Transfer"] satisfies TransactionType[]).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
          <input
            className={inputClass}
            value={transactionDraft.category}
            onChange={(event) => setTransactionDraft({ ...transactionDraft, category: event.target.value })}
            placeholder="Category"
          />
          <Button className="w-full" onClick={addTransaction}>
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function SavingsSection({
  goals,
  goalDraft,
  setGoalDraft,
  addSavingGoal,
  currency,
  referenceTime,
}: {
  goals: SavingGoal[];
  goalDraft: { name: string; targetAmount: string; currentAmount: string; deadline: string };
  setGoalDraft: (draft: { name: string; targetAmount: string; currentAmount: string; deadline: string }) => void;
  addSavingGoal: () => void;
  currency: string;
  referenceTime: number;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
          const months = Math.max(
            1,
            Math.ceil((new Date(goal.deadline).getTime() - referenceTime) / (1000 * 60 * 60 * 24 * 30)),
          );
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>{goal.name}</CardTitle>
                  <Flag className="h-4 w-4" style={{ color: goal.color }} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressRow
                  label={formatCurrency(goal.currentAmount, currency)}
                  value={goal.currentAmount}
                  max={goal.targetAmount}
                  color={goal.color}
                  suffix={formatCurrency(goal.targetAmount, currency)}
                />
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-zinc-500">Remaining</p>
                    <p className="mt-1 font-medium">{formatCurrency(remaining, currency)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Monthly need</p>
                    <p className="mt-1 font-medium">{formatCurrency(remaining / months, currency)}</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-zinc-400">{goal.notes}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>New Goal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className={inputClass}
            value={goalDraft.name}
            onChange={(event) => setGoalDraft({ ...goalDraft, name: event.target.value })}
            placeholder="Goal name"
          />
          <input
            className={inputClass}
            value={goalDraft.targetAmount}
            onChange={(event) => setGoalDraft({ ...goalDraft, targetAmount: event.target.value })}
            placeholder="Target amount"
            inputMode="decimal"
          />
          <input
            className={inputClass}
            value={goalDraft.currentAmount}
            onChange={(event) => setGoalDraft({ ...goalDraft, currentAmount: event.target.value })}
            placeholder="Current amount"
            inputMode="decimal"
          />
          <input
            className={inputClass}
            type="date"
            value={goalDraft.deadline}
            onChange={(event) => setGoalDraft({ ...goalDraft, deadline: event.target.value })}
          />
          <Button className="w-full" onClick={addSavingGoal}>
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function DiarySection({
  entries,
  journalDraft,
  setJournalDraft,
  addJournalEntry,
}: {
  entries: DiaryEntry[];
  journalDraft: { title: string; content: string; mood: DiaryEntry["mood"] };
  setJournalDraft: (draft: { title: string; content: string; mood: DiaryEntry["mood"] }) => void;
  addJournalEntry: () => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Daily Journal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className={inputClass}
            value={journalDraft.title}
            onChange={(event) => setJournalDraft({ ...journalDraft, title: event.target.value })}
            placeholder="Title"
          />
          <select
            className={inputClass}
            value={journalDraft.mood}
            onChange={(event) =>
              setJournalDraft({ ...journalDraft, mood: event.target.value as DiaryEntry["mood"] })
            }
          >
            {(["Great", "Good", "Neutral", "Stressed", "Sad"] satisfies DiaryEntry["mood"][]).map((mood) => (
              <option key={mood}>{mood}</option>
            ))}
          </select>
          <textarea
            className={textareaClass}
            value={journalDraft.content}
            onChange={(event) => setJournalDraft({ ...journalDraft, content: event.target.value })}
            placeholder="Reflection"
          />
          <Button className="w-full" onClick={addJournalEntry}>
            <Plus className="h-4 w-4" />
            Save Entry
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {entries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{entry.title}</CardTitle>
                  <p className="mt-1 text-xs text-zinc-500">
                    {format(new Date(`${entry.date}T00:00:00`), "MMMM d, yyyy")}
                  </p>
                </div>
                <Badge tone={entry.mood === "Great" || entry.mood === "Good" ? "green" : "amber"}>
                  {entry.mood}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-zinc-300">{entry.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProjectsSection({ state }: { state: LifeOSState }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {state.projects.map((project) => {
        const linkedTasks = state.tasks.filter((task) => task.projectId === project.id);
        const completedTasks = linkedTasks.filter((task) => task.status === "Completed").length;
        const progress = linkedTasks.length ? (completedTasks / linkedTasks.length) * 100 : 0;
        const milestoneProgress =
          (project.milestones.filter((milestone) => milestone.completed).length / project.milestones.length) * 100;
        return (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <CardTitle>{project.name}</CardTitle>
                <Badge tone="cyan">{project.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-zinc-400">{project.description}</p>
              <ProgressRow label="Tasks" value={progress} max={100} color={project.color} suffix={formatPercent(progress)} />
              <ProgressRow
                label="Milestones"
                value={milestoneProgress}
                max={100}
                color="#f7bf4f"
                suffix={formatPercent(milestoneProgress)}
              />
              <div className="space-y-2">
                {project.milestones.map((milestone) => (
                  <div key={milestone.title} className="flex items-center gap-2 text-sm">
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border",
                        milestone.completed
                          ? "border-[#8bd450] bg-[#8bd450] text-[#11130f]"
                          : "border-white/15 text-zinc-600",
                      )}
                    >
                      {milestone.completed && <Check className="h-3 w-3" />}
                    </span>
                    {milestone.title}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function HabitsSection({
  habits,
  toggleHabit,
  todayKey,
}: {
  habits: Habit[];
  toggleHabit: (habitId: string) => void;
  todayKey: string;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {habits.map((habit) => {
        const completed = habit.completedDates.includes(todayKey);
        return (
          <Card key={habit.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{habit.name}</CardTitle>
                <Button
                  variant={completed ? "primary" : "secondary"}
                  size="icon"
                  title="Toggle habit"
                  onClick={() => toggleHabit(habit.id)}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ProgressRow
                label="Seven day streak"
                value={habit.completedDates.length}
                max={7}
                color={habit.color}
                suffix={`${habit.completedDates.length}/7`}
              />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-[3px] border border-white/[0.05]",
                      index < habit.completedDates.length ? "bg-[#8bd450]" : "bg-white/[0.04]",
                    )}
                  />
                ))}
              </div>
              <Badge tone={completed ? "green" : "neutral"}>
                {completed ? "Completed today" : "Open today"}
              </Badge>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function PlannerSection({ planners }: { planners: LifeOSState["planners"] }) {
  const types: PlanType[] = ["Daily", "Weekly", "Monthly", "Quarterly", "Yearly"];
  const visiblePlans = types
    .map((type) => planners.find((planner) => planner.type === type))
    .filter((planner): planner is LifeOSState["planners"][number] => Boolean(planner));

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {visiblePlans.map((planner) => (
        <Card key={planner.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{planner.title}</CardTitle>
              <Badge tone="amber">{planner.type}</Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase text-zinc-500">Goals</p>
              <div className="space-y-2">
                {planner.goals.map((goal) => (
                  <div key={goal} className="rounded-md border border-white/[0.08] bg-black/20 px-3 py-2 text-sm">
                    {goal}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-zinc-500">Priorities</p>
              <div className="space-y-2">
                {planner.priorities.map((priority) => (
                  <div key={priority} className="rounded-md border border-white/[0.08] bg-black/20 px-3 py-2 text-sm">
                    {priority}
                  </div>
                ))}
              </div>
            </div>
            <p className="md:col-span-2 text-sm leading-6 text-zinc-400">{planner.notes}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CalendarSection({ events, tasks }: { events: CalendarEvent[]; tasks: Task[] }) {
  const days = Array.from({ length: 30 }).map((_, index) => index + 1);
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>June 2026</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {days.map((day) => {
              const dayKey = `2026-06-${String(day).padStart(2, "0")}`;
              const dayEvents = events.filter((event) => event.startsAt.startsWith(dayKey));
              const dayTasks = tasks.filter((task) => task.dueDate.startsWith(dayKey));
              return (
                <div
                  key={day}
                  className="min-h-24 rounded-lg border border-white/[0.08] bg-black/20 p-2 text-left"
                >
                  <p className="text-xs text-zinc-500">{day}</p>
                  <div className="mt-2 space-y-1">
                    {[...dayEvents, ...dayTasks.map(taskToEvent)].slice(0, 2).map((item) => (
                      <div key={item.id} className="truncate rounded bg-[#8bd450]/15 px-2 py-1 text-[11px] text-[#c8f5a4]">
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {events.map((event) => (
            <div key={event.id} className="rounded-lg border border-white/[0.08] bg-black/20 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{event.title}</p>
                <Badge tone="cyan">{event.type}</Badge>
              </div>
              <p className="mt-2 text-xs text-zinc-500">{format(new Date(event.startsAt), "MMM d, h:mm a")}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function NotesSection({
  notes,
  noteDraft,
  setNoteDraft,
  addNote,
  deleteNote,
}: {
  notes: Note[];
  noteDraft: { title: string; content: string; folder: string };
  setNoteDraft: (draft: { title: string; content: string; folder: string }) => void;
  addNote: () => void;
  deleteNote: (noteId: string) => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <input
            className={inputClass}
            value={noteDraft.title}
            onChange={(event) => setNoteDraft({ ...noteDraft, title: event.target.value })}
            placeholder="Title"
          />
          <input
            className={inputClass}
            value={noteDraft.folder}
            onChange={(event) => setNoteDraft({ ...noteDraft, folder: event.target.value })}
            placeholder="Folder"
          />
          <textarea
            className={textareaClass}
            value={noteDraft.content}
            onChange={(event) => setNoteDraft({ ...noteDraft, content: event.target.value })}
            placeholder="Markdown note"
          />
          <Button className="w-full" onClick={addNote}>
            <Plus className="h-4 w-4" />
            Save Note
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>{note.title}</CardTitle>
                  <p className="mt-1 text-xs text-zinc-500">{note.folder}</p>
                </div>
                <Button variant="ghost" size="icon" title="Delete note" onClick={() => deleteNote(note.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-zinc-300">{note.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {note.isPinned && <Badge tone="green">Pinned</Badge>}
                {note.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function NotificationsSection({ notifications }: { notifications: LifeOSState["notifications"] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {notifications.map((notification) => (
        <Card key={notification.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>{notification.title}</CardTitle>
              <Badge tone={notification.status === "Unread" ? "amber" : "neutral"}>{notification.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-zinc-300">{notification.body}</p>
            <p className="mt-4 text-xs text-zinc-500">{format(new Date(notification.dueAt), "MMM d, h:mm a")}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SettingsSection({
  state,
  setState,
  resetDemoData,
  exportFinanceCsv,
}: {
  state: LifeOSState;
  setState: React.Dispatch<React.SetStateAction<LifeOSState>>;
  resetDemoData: () => void;
  exportFinanceCsv: () => void;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="block text-sm text-zinc-400">
            Currency
            <select
              className={cn(inputClass, "mt-2")}
              value={state.settings.currency}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  settings: { ...current.settings, currency: event.target.value },
                }))
              }
            >
              {["USD", "KHR", "EUR", "SGD"].map((currency) => (
                <option key={currency}>{currency}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-400">
            Language
            <select
              className={cn(inputClass, "mt-2")}
              value={state.settings.language}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  settings: { ...current.settings, language: event.target.value },
                }))
              }
            >
              {["English", "Khmer", "French", "Japanese"].map((language) => (
                <option key={language}>{language}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-black/20 p-3 text-sm text-zinc-300">
            Dark mode
            <input
              type="checkbox"
              checked={state.settings.theme === "dark"}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  settings: { ...current.settings, theme: event.target.checked ? "dark" : "light" },
                }))
              }
              className="h-4 w-4 accent-[#8bd450]"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={exportFinanceCsv}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="secondary" onClick={() => window.print()}>
            <Archive className="h-4 w-4" />
            Print Backup
          </Button>
          <Button variant="danger" onClick={resetDemoData}>
            Reset Demo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof LayoutDashboard;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{detail}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/[0.05] text-[#8bd450]">
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  max,
  color,
  suffix,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix: string;
}) {
  const percent = max ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-xs text-zinc-500">{suffix}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function taskToEvent(task: Task): CalendarEvent {
  return {
    id: task.id,
    title: task.title,
    type: "Task",
    startsAt: task.dueDate,
  };
}

const tooltipStyle = {
  background: "#151712",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  color: "#f4f4f5",
};
