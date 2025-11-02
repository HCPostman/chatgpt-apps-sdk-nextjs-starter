"use client";

import React from "react";
import { useWidgetProps } from "@/app/hooks";

type Stats = {
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  completion_rate: number;
  avg_completion_time: number;
};

type ProductivityData = {
  daily_completed: number[];
  tags_distribution: { tag: string; count: number }[];
  priority_breakdown: { priority: string; count: number }[];
  overdue_count: number;
  upcoming_count: number;
};

export default function ProductivityStatsWidget() {
  const widgetProps = useWidgetProps();
  const structuredContent = widgetProps?.structuredContent as any;
  const stats = structuredContent?.stats as Stats;
  const productivity = structuredContent?.productivity as ProductivityData;
  const period = structuredContent?.period as string;

  if (!stats || !productivity) {
    return (
      <div className="w-full p-6 text-center text-gray-500">
        <p className="text-sm">No productivity data available</p>
      </div>
    );
  }

  const maxDaily = Math.max(...(productivity.daily_completed || [1]));

  return (
    <div className="w-full max-w-full p-4">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Productivity Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            {period === "today" ? "Today" :
             period === "week" ? "Last 7 days" :
             period === "month" ? "Last 30 days" : "Last year"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-blue-600">{stats.in_progress}</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-gray-600">Pending</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Rate</span>
              <span className="text-sm font-bold text-gray-900">{stats.completion_rate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.completion_rate}%` }}
              />
            </div>
          </div>

          {/* Daily Activity Chart */}
          {productivity.daily_completed && productivity.daily_completed.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Activity</h3>
              <div className="flex items-end gap-1 h-20">
                {productivity.daily_completed.map((count, idx) => (
                  <div
                    key={idx}
                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{
                      height: `${(count / maxDaily) * 100}%`,
                      minHeight: count > 0 ? "4px" : "0"
                    }}
                    title={`Day ${idx + 1}: ${count} tasks`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Tasks completed per day</p>
            </div>
          )}

          {/* Priority Distribution */}
          {productivity.priority_breakdown && productivity.priority_breakdown.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Priority Distribution</h3>
              <div className="space-y-2">
                {productivity.priority_breakdown.map((item) => (
                  <div key={item.priority} className="flex items-center gap-3">
                    <span className={`text-xs font-medium w-16 ${
                      item.priority === "high" ? "text-red-600" :
                      item.priority === "medium" ? "text-yellow-600" :
                      "text-green-600"
                    }`}>
                      {item.priority}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.priority === "high" ? "bg-red-500" :
                          item.priority === "medium" ? "bg-yellow-500" :
                          "bg-green-500"
                        }`}
                        style={{ width: `${(item.count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-8">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Metrics */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-600">Avg. Completion Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats.avg_completion_time} days
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue / Upcoming</p>
              <p className="text-lg font-semibold">
                <span className="text-red-600">{productivity.overdue_count}</span>
                <span className="text-gray-400"> / </span>
                <span className="text-blue-600">{productivity.upcoming_count}</span>
              </p>
            </div>
          </div>

          {/* Tags Distribution */}
          {productivity.tags_distribution && productivity.tags_distribution.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Tags</h3>
              <div className="flex flex-wrap gap-2">
                {productivity.tags_distribution.slice(0, 8).map((tag) => (
                  <span
                    key={tag.tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {tag.tag} ({tag.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}