"use client";

import App from "@/App";
import { ErrorBoundary } from "@/components/ErrorBoundary";

/**
 * 客户端应用壳：所有 UI 与路由仍由 App + react-router 处理。
 */
export default function SpaApp() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}
