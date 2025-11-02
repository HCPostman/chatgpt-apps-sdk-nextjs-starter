import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { getTasks, createTask, updateTask, deleteTask, getTaskStats, getProductivityData } from "@/lib/task-manager";

const handler = createMcpHandler(async (server) => {
  // Required tool 1: search
  // This is required for ChatGPT connectors and deep research
  server.registerTool(
    "search",
    {
      title: "Search Tasks",
      description: "Search through tasks and productivity data",
      inputSchema: {
        query: z.string().describe("Search query for tasks")
      }
    },
    async (args) => {
      try {
        // Search through tasks based on the query
        const allTasks = await getTasks({ status: "all", limit: 50 });
        const query = args.query.toLowerCase();

        const matchingTasks = allTasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some(tag => tag.toLowerCase().includes(query))
        );

        // Format results according to ChatGPT requirements
        const results = matchingTasks.map(task => ({
          id: task.id,
          title: task.title,
          url: `https://chatgpt-apps-sdk-nextjs-starter-alpha.vercel.app/widgets/task-details?id=${task.id}`
        }));

        // Return as required JSON-encoded string in text content
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ results })
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({ results: [], error: "Search failed" })
          }]
        };
      }
    }
  );

  // Required tool 2: fetch
  // This is required for ChatGPT connectors and deep research
  server.registerTool(
    "fetch",
    {
      title: "Fetch Task Details",
      description: "Fetch detailed information about a specific task",
      inputSchema: {
        id: z.string().describe("Unique identifier for the task")
      }
    },
    async (args) => {
      try {
        const allTasks = await getTasks({ status: "all", limit: 50 });
        const task = allTasks.find(t => t.id === args.id);

        if (!task) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                id: args.id,
                title: "Task not found",
                text: "The requested task could not be found.",
                url: `https://chatgpt-apps-sdk-nextjs-starter-alpha.vercel.app/widgets/task-details?id=${args.id}`,
                metadata: { error: "not_found" }
              })
            }]
          };
        }

        // Format as required by ChatGPT
        const document = {
          id: task.id,
          title: task.title,
          text: `Task: ${task.title}
Description: ${task.description || 'No description'}
Status: ${task.status}
Priority: ${task.priority}
Due Date: ${task.due_date || 'No due date'}
Tags: ${task.tags?.join(', ') || 'No tags'}
Created: ${new Date(task.created_at).toLocaleDateString()}
Last Updated: ${new Date(task.updated_at).toLocaleDateString()}`,
          url: `https://chatgpt-apps-sdk-nextjs-starter-alpha.vercel.app/widgets/task-details?id=${task.id}`,
          metadata: {
            status: task.status,
            priority: task.priority,
            tags: task.tags,
            source: "task_management_system"
          }
        };

        // Return as required JSON-encoded string in text content
        return {
          content: [{
            type: "text",
            text: JSON.stringify(document)
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              id: args.id,
              title: "Error",
              text: "Failed to fetch task details.",
              metadata: { error: "fetch_failed" }
            })
          }]
        };
      }
    }
  );

  // Additional tools for direct task management (these work with your original widgets)
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