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

export default function TaskDetailsWidget() {
  const widgetProps = useWidgetProps();
  const structuredContent = widgetProps?.structuredContent as any;
  const task = structuredContent?.task as Task;
  const action = structuredContent?.action as string;

  if (!task) {
    return (
      <div className="w-full p-6 text-center text-gray-500">
        <p className="text-sm">No task data available</p>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600 bg-green-50 border-green-200";
      case "in_progress": return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending": return "text-gray-600 bg-gray-50 border-gray-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="w-full max-w-full p-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {action && (
          <div className={`px-4 py-2 text-xs font-medium ${
            action === "created" ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
          }`}>
            Task {action}
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {task.title}
            </h2>
            <p className="text-xs text-gray-500">ID: {task.id}</p>
          </div>

          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Status</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
                {task.status.replace("_", " ")}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Priority</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {task.due_date && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Due Date</h3>
              <p className="text-sm text-gray-600">
                {formatDate(task.due_date)}
              </p>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-sm bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <span className="font-medium">Created:</span> {formatDate(task.created_at)}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {formatDate(task.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}