import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getTasks, createTask, updateTask, deleteTask, getTaskStats, getProductivityData } from "@/lib/task-manager";

const handler = createMcpHandler(async (server) => {
  // Tool 1: List all tasks
  server.registerTool(
    "list_tasks",
    {
      title: "List Tasks",
      description: "Call this tool when the user wants to see their tasks, todo list, or current work items",
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

  // Tool 2: Create a new task
  server.registerTool(
    "create_task",
    {
      title: "Create Task",
      description: "Call this tool when the user wants to add, create, or make a new task or todo item",
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

  // Tool 3: Update a task
  server.registerTool(
    "update_task",
    {
      title: "Update Task",
      description: "Call this tool when the user wants to modify, update, edit, or change an existing task",
      inputSchema: {
        task_id: z.string().describe("The ID of the task to update"),
        title: z.string().min(1).max(200).optional().describe("New task title"),
        description: z.string().max(1000).optional().describe("New task description"),
        status: z.enum(["pending", "in_progress", "completed"]).optional().describe("New task status"),
        priority: z.enum(["low", "medium", "high"]).optional().describe("New priority level"),
        due_date: z.string().nullable().optional().describe("New due date or null to clear"),
        tags: z.array(z.string()).optional().describe("New task tags")
      },
      _meta: {
        "openai/outputTemplate": "task-details",
        "openai/resultCanProduceWidget": true,
      }
    },
    async (args) => {
      const { task_id, ...updates } = args;
      const task = await updateTask(task_id, updates);

      if (!task) {
        return {
          content: [{
            type: "text",
            text: `Task with ID ${task_id} not found`
          }]
        };
      }

      return {
        content: [{
          type: "text",
          text: `Updated task: "${task.title}"`
        }],
        structuredContent: {
          task,
          action: "updated"
        },
        _meta: {
          "openai/outputTemplate": "task-details"
        }
      };
    }
  );

  // Tool 4: Delete a task
  server.registerTool(
    "delete_task",
    {
      title: "Delete Task",
      description: "Call this tool when the user wants to delete, remove, or cancel a task",
      inputSchema: {
        task_id: z.string().describe("The ID of the task to delete"),
        confirm: z.boolean().default(false).describe("Confirm deletion")
      }
    },
    async (args) => {
      if (!args.confirm) {
        return {
          content: [{
            type: "text",
            text: "Please confirm deletion by setting confirm to true"
          }]
        };
      }

      const deleted = await deleteTask(args.task_id);

      return {
        content: [{
          type: "text",
          text: deleted
            ? `Task ${args.task_id} has been deleted`
            : `Task ${args.task_id} not found`
        }]
      };
    }
  );

  // Tool 5: Get productivity statistics
  server.registerTool(
    "get_productivity_stats",
    {
      title: "Productivity Stats",
      description: "Call this tool when the user wants to see productivity metrics, statistics, progress, or performance data",
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

export const GET = handler;
export const POST = handler;