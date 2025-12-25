import { useState } from "react";
import { CheckCircle2, Circle, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/utils/cn";
import type { TestResult } from "../types/hardware-viewer";
import { formatDistanceToNow } from "dayjs";

interface TestResultViewerProps {
  testData?: unknown;
}

export function TestResultViewer({ testData }: TestResultViewerProps) {
  const [results] = useState<TestResult[]>(
    testData as TestResult[] ?? [
      {
        id: "1",
        name: "Example Test",
        status: "pass",
        duration: 120,
        timestamp: new Date(),
      },
      {
        id: "2",
        name: "Another Test",
        status: "fail",
        duration: 45,
        timestamp: new Date(),
      },
    ],
  );

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "fail":
        return <XCircle className="h-4 w-4 text-error" />;
      case "running":
        return <Circle className="h-4 w-4 text-warning animate-pulse" />;
      default:
        return <AlertCircle className="h-4 w-4 text-text-light" />;
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pass":
        return "text-success";
      case "fail":
        return "text-error";
      case "running":
        return "text-warning";
      default:
        return "text-text-light";
    }
  };

  const passedCount = results.filter((r) => r.status === "pass").length;
  const failedCount = results.filter((r) => r.status === "fail").length;
  const skippedCount = results.filter((r) => r.status === "skipped").length;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border bg-secondary-bg px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">Test Results</span>
          <div className="flex items-center gap-4 text-xs">
            <span className="text-success">
              <CheckCircle2 className="mr-1 inline h-3 w-3" />
              {passedCount} passed
            </span>
            <span className="text-error">
              <XCircle className="mr-1 inline h-3 w-3" />
              {failedCount} failed
            </span>
            {skippedCount > 0 && (
              <span className="text-text-light">
                <Circle className="mr-1 inline h-3 w-3" />
                {skippedCount} skipped
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-border">
          {results.map((result) => (
            <button
              type="button"
              key={result.id}
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-hover"
            >
              <div className="shrink-0">{getStatusIcon(result.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-medium text-text">{result.name}</span>
                  <span
                    className={cn("rounded-full px-1.5 py-0.5 text-xs", getStatusColor(result.status))}
                  >
                    {result.status}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-text-lighter">
                  <span>{result.duration}ms</span>
                  <span>{formatDistanceToNow(result.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
              <div className="shrink-0">
                <button
                  type="button"
                  className="rounded border border-border px-2 py-1 text-xs text-text hover:bg-hover"
                >
                  Details
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
