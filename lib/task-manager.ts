// Task Manager - In-memory storage for demo purposes
// In production, replace with database or API calls

type Task = {
  id: string;
  title: string;
  description?: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  due_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
};

type TaskFilter = {
  status?: "all" | "pending" | "in_progress" | "completed";
  priority?: "all" | "low" | "medium" | "high";
  limit?: number;
};

// In-memory task storage (replace with database in production)
let tasks: Task[] = [
  {
    id: "task-001",
    title: "Review quarterly reports",
    description: "Analyze Q4 financial and performance reports for the board meeting",
    status: "in_progress",
    priority: "high",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ["finance", "quarterly"],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "task-002",
    title: "Update documentation",
    description: "Update API documentation with new endpoints",
    status: "pending",
    priority: "medium",
    tags: ["docs", "api"],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "task-003",
    title: "Team standup preparation",
    status: "completed",
    priority: "low",
    tags: ["meetings"],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function getTasks(filter: TaskFilter): Promise<Task[]> {
  let filtered = [...tasks];

  if (filter.status && filter.status !== "all") {
    filtered = filtered.filter(t => t.status === filter.status);
  }

  if (filter.priority && filter.priority !== "all") {
    filtered = filtered.filter(t => t.priority === filter.priority);
  }

  // Sort by priority (high first) and then by created date (newest first)
  filtered.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (filter.limit) {
    filtered = filtered.slice(0, filter.limit);
  }

  return filtered;
}

export async function createTask(data: Omit<Task, "id" | "created_at" | "updated_at" | "status">): Promise<Task> {
  const newTask: Task = {
    ...data,
    id: `task-${Date.now().toString(36)}`,
    status: "pending",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  tasks.push(newTask);
  return newTask;
}

export async function updateTask(id: string, updates: any): Promise<Task | null> {
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return null;
  }

  const { due_date, ...otherUpdates } = updates;

  tasks[index] = {
    ...tasks[index],
    ...otherUpdates,
    due_date: due_date === null ? undefined : due_date,
    updated_at: new Date().toISOString()
  };

  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return false;
  }

  tasks.splice(index, 1);
  return true;
}

export async function getTaskStats(period: "today" | "week" | "month" | "year") {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  const relevantTasks = tasks.filter(t =>
    new Date(t.created_at) >= startDate
  );

  const completed = relevantTasks.filter(t => t.status === "completed").length;
  const in_progress = relevantTasks.filter(t => t.status === "in_progress").length;
  const pending = relevantTasks.filter(t => t.status === "pending").length;

  const completedTasks = relevantTasks.filter(t => t.status === "completed");
  let avg_completion_time = 0;

  if (completedTasks.length > 0) {
    const totalTime = completedTasks.reduce((sum, task) => {
      const created = new Date(task.created_at).getTime();
      const updated = new Date(task.updated_at).getTime();
      return sum + (updated - created);
    }, 0);
    avg_completion_time = Math.round(totalTime / completedTasks.length / (1000 * 60 * 60 * 24));
  }

  return {
    total: relevantTasks.length,
    completed,
    in_progress,
    pending,
    completion_rate: relevantTasks.length > 0
      ? Math.round((completed / relevantTasks.length) * 100)
      : 0,
    avg_completion_time
  };
}

export async function getProductivityData(period: "today" | "week" | "month" | "year") {
  const now = new Date();
  const days = period === "today" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 365;

  // Generate sample daily completed data
  const daily_completed = Array.from({ length: Math.min(days, 30) }, () =>
    Math.floor(Math.random() * 8) + 1
  );

  // Calculate tags distribution
  const allTags = tasks.flatMap(t => t.tags || []);
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const tags_distribution = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  // Calculate priority breakdown
  const priority_breakdown = ["high", "medium", "low"].map(priority => ({
    priority,
    count: tasks.filter(t => t.priority === priority).length
  }));

  // Calculate overdue and upcoming
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue_count = tasks.filter(t =>
    t.due_date && new Date(t.due_date) < today && t.status !== "completed"
  ).length;

  const upcoming_count = tasks.filter(t => {
    if (!t.due_date || t.status === "completed") return false;
    const dueDate = new Date(t.due_date);
    const daysUntilDue = (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  }).length;

  return {
    daily_completed,
    tags_distribution,
    priority_breakdown,
    overdue_count,
    upcoming_count
  };
}