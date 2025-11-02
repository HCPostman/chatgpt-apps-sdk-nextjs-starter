import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getTasks, createTask, updateTask, deleteTask, getTaskStats, getProductivityData } from "@/lib/task-manager";

const handler = createMcpHandler(async (server) => {
  // Search through tasks
  server.registerTool(
    "search_tasks",
    {
      title: "Search Tasks",
      description: "Search through tasks by title, description, or tags",
      inputSchema: {
        query: z.string().describe("Search query for tasks"),
        status: z.enum(["all", "pending", "in_progress", "completed"]).default("all").describe("Filter by task status")
      }
    },
    async (args) => {
      try {
        const allTasks = await getTasks({ status: args.status === "all" ? "all" : args.status, limit: 50 });
        const query = args.query.toLowerCase();

        const matchingTasks = allTasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some(tag => tag.toLowerCase().includes(query))
        );

        if (matchingTasks.length === 0) {
          return {
            content: [{
              type: "text",
              text: `No tasks found matching "${args.query}"`
            }]
          };
        }

        const taskList = matchingTasks.map(task =>
          `• **${task.title}** (${task.status}, ${task.priority} priority)
  ${task.description || 'No description'}
  Tags: ${task.tags?.join(', ') || 'None'}
  Due: ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
  ID: ${task.id}`
        ).join('\n\n');

        return {
          content: [{
            type: "text",
            text: `Found ${matchingTasks.length} task(s) matching "${args.query}":\n\n${taskList}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: "Error searching tasks"
          }]
        };
      }
    }
  );

  // Task management tools for Developer Mode
  server.registerTool(
    "list_tasks",
    {
      title: "List Tasks",
      description: "Get a list of tasks with filtering options",
      inputSchema: {
        status: z.enum(["all", "pending", "in_progress", "completed"]).default("all").describe("Filter by task status"),
        priority: z.enum(["all", "low", "medium", "high"]).optional().describe("Filter by priority level"),
        limit: z.number().int().min(1).max(100).default(20).describe("Maximum number of tasks to return")
      },
      _meta: {
        "openai/outputTemplate": "task-list",
        "openai/resultCanProduceWidget": true,
      }
    },
    async (args) => {
      const tasks = await getTasks(args);

      if (tasks.length === 0) {
        return {
          content: [{
            type: "text",
            text: "No tasks found with the specified filters."
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `Found ${tasks.length} task(s)`
        }],
        structuredContent: {
          tasks,
          filter: args
        },
        _meta: {
          "openai/outputTemplate": "task-list"
        }
      };
    }
  );

  server.registerTool(
    "create_task",
    {
      title: "Create Task",
      description: "Create a new task",
      inputSchema: {
        title: z.string().min(1).max(200).describe("Task title"),
        description: z.string().max(1000).optional().describe("Task description"),
        priority: z.enum(["low", "medium", "high"]).default("medium").describe("Task priority"),
        due_date: z.string().optional().describe("Due date in ISO format"),
        tags: z.array(z.string()).optional().describe("Task tags")
      },
      _meta: {
        "openai/outputTemplate": "task-details",
        "openai/resultCanProduceWidget": true,
      }
    },
    async (args) => {
      const task = await createTask(args);

      return {
        content: [{
          type: "text",
          text: `Created task: "${task.title}" with ${task.priority} priority`
        }],
        structuredContent: {
          task,
          action: "created"
        },
        _meta: {
          "openai/outputTemplate": "task-details"
        }
      };
    }
  );

  server.registerTool(
    "get_productivity_stats",
    {
      title: "Productivity Stats",
      description: "Get productivity metrics and statistics",
      inputSchema: {
        period: z.enum(["today", "week", "month", "year"]).default("week").describe("Time period for statistics")
      },
      _meta: {
        "openai/outputTemplate": "productivity-stats",
        "openai/resultCanProduceWidget": true,
      }
    },
    async (args) => {
      const stats = await getTaskStats(args.period);
      const productivity = await getProductivityData(args.period);

      return {
        content: [{
          type: "text",
          text: `Productivity stats for ${args.period}: ${stats.completed} completed, ${stats.in_progress} in progress, ${stats.pending} pending`
        }],
        structuredContent: {
          stats,
          productivity,
          period: args.period
        },
        _meta: {
          "openai/outputTemplate": "productivity-stats"
        }
      };
    }
  );
});

// Force redeploy: 2025-11-01
export const GET = handler;
export const POST = handler;