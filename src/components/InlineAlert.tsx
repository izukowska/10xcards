import * as React from "react";
import { cn } from "@/lib/utils";

interface InlineAlertProps {
  variant: "error" | "warning" | "success" | "info";
  message: string;
  className?: string;
}

const variantStyles = {
  error: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
  warning:
    "bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-800",
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
  info: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
};

export function InlineAlert({ variant, message, className }: InlineAlertProps) {
  return (
    <div className={cn("rounded-md border px-4 py-3 text-sm", variantStyles[variant], className)} role="alert">
      {message}
    </div>
  );
}
