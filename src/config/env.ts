/** Reads a variable; without a fallback it is required */
export function readEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return value;
}

export function readPort(name: string, fallback: number): number {
  const port = Number(readEnv(name, String(fallback)));
  if (!Number.isInteger(port) || port <= 0 || port > 65_535) {
    throw new Error(`Environment variable ${name} must be a TCP port`);
  }
  return port;
}
