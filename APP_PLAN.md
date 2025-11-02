# Task Management & Productivity Dashboard

This MCP app provides a comprehensive task management system with productivity tracking capabilities. It's designed to help users organize their work, track progress, and analyze their productivity patterns.

## What This App Does

The app offers five core tools for managing tasks and tracking productivity:

1. **Task List Management** - View, filter, and organize tasks with various status and priority levels
2. **Task Creation** - Add new tasks with descriptions, priorities, due dates, and tags
3. **Task Updates** - Modify existing tasks including status changes, priority adjustments, and metadata updates
4. **Task Deletion** - Remove tasks with confirmation requirements for safety
5. **Productivity Analytics** - Generate comprehensive statistics and visualizations of work patterns

## When ChatGPT Should Call These Tools

- **list_tasks**: When users ask about their tasks, todos, current work, or want to see what they need to do. Examples: "Show me my tasks", "What's on my todo list?", "Show me high priority items"

- **create_task**: When users want to add new items to work on. Examples: "Add a task to review the proposal", "Create a todo for tomorrow's meeting", "I need to remember to call the client"

- **update_task**: When users want to modify existing tasks. Examples: "Mark task-001 as completed", "Change the priority to high", "Update the description", "Move this to in-progress"

- **delete_task**: When users want to remove tasks. Examples: "Delete task-003", "Remove the completed task", "Cancel that todo". **This tool requires explicit confirmation (confirm: true) before deletion**

- **get_productivity_stats**: When users want analytics or metrics. Examples: "Show my productivity", "How many tasks did I complete this week?", "Show me my progress dashboard"

## Important Safety Notes

- **Task deletion requires explicit user confirmation** - The delete_task tool will not proceed unless confirm=true is explicitly set
- All widgets are designed to work safely in ChatGPT's iframe environment with responsive layouts
- Tasks are stored in-memory for demo purposes (data resets on server restart)
- Due dates support natural language input and show visual indicators for overdue/upcoming tasks

## Technical Features

- Three interactive widgets: task list, task details, and productivity dashboard
- Responsive design optimized for ChatGPT's constrained iframe environment
- Real-time filtering and sorting capabilities
- Visual priority indicators and status icons
- Comprehensive productivity metrics with charts and statistics