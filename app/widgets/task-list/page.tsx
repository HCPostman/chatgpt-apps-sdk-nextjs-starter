"use client";

import React from "react";
import { useWidgetProps } from "@/app/hooks";

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

export default function TaskListWidget() {
  const widgetProps = useWidgetProps();
  const structuredContent = widgetProps?.structuredContent as any;
  const tasks = (structuredContent?.tasks || []) as Task[];
  const filter = structuredContent?.filter || {};

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return "✓";
      case "in_progress": return "⏱";
      case "pending": return "○";
      default: return "•";
    }
  };

  const formatDueDate = (date: string) => {
    const due = new Date(date);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return <span className="text-red-600">Overdue</span>;
    if (days === 0) return <span className="text-orange-600">Today</span>;
    if (days === 1) return <span className="text-yellow-600">Tomorrow</span>;
    if (days <= 7) return <span className="text-blue-600">{days} days</span>;
    return new Date(date).toLocaleDateString();
  };

  if (tasks.length === 0) {
    return (
      <div className="w-full max-w-full p-6 text-center">
        <div className="text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-sm">No tasks found</p>
          {filter.status !== "all" && (
            <p className="text-xs mt-1">Try changing your filters</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full overflow-x-auto">
      <div className="min-w-0 p-4">
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" title={task.status}>
                      {getStatusIcon(task.status)}
                    </span>
                    <h3 className="font-medium text-gray-900 truncate flex-1">
                      {task.title}
                    </h3>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>

                    {task.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {formatDueDate(task.due_date)}
                      </span>
                    )}

                    {task.tags && task.tags.length > 0 && (
                      <div className="flex gap-1">
                        {task.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  #{task.id.slice(0, 8)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filter.status !== "all" && (
          <div className="mt-4 text-xs text-gray-500 text-center">
            Showing {filter.status} tasks
          </div>
        )}
      </div>
    </div>
  );
}