let isDebugMode = false;

export function setDebugMode(debug: boolean) {
  isDebugMode = debug;
}

export function debugLog(...args: any[]) {
  if (isDebugMode) {
    console.log("[DEBUG]", ...args);
  }
}
