/**
 * Non-blocking background task runner for Node.js, Next.js, and Vercel Serverless.
 * 
 * In serverless environments (Vercel Lambda / Next.js Server Actions), ensures tasks are not
 * aborted prematurely when returning the HTTP response by safely tapping into `waitUntil` if available,
 * while catching and logging any errors to prevent unhandled rejections.
 */
export function runBackgroundTask<T = any>(
  task: (() => Promise<T>) | Promise<T>,
  taskName = 'BackgroundTask'
): void {
  try {
    const promise = typeof task === 'function' ? task() : task;

    // 1. If running under Vercel Serverless / Next.js with global waitUntil
    const globalObj = typeof globalThis !== 'undefined' ? (globalThis as any) : (process as any);
    if (globalObj && typeof globalObj.waitUntil === 'function') {
      globalObj.waitUntil(promise);
      return;
    }

    // 2. Safe async execution with error logging
    promise.catch((err: unknown) => {
      console.warn(`[${taskName}] Non-blocking execution warning:`, err);
    });
  } catch (err: unknown) {
    console.warn(`[${taskName}] Failed to dispatch non-blocking background task:`, err);
  }
}
