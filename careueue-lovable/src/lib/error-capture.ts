let lastError: unknown = null;
export function captureError(e: unknown) {
  lastError = e;
}
export function consumeLastCapturedError() {
  const e = lastError;
  lastError = null;
  return e;
}
