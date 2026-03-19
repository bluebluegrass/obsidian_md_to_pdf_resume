import { PLUGIN_NAME } from "../constants/defaults";

export function debug(message: string, ...details: unknown[]): void {
  console.debug(`[${PLUGIN_NAME}] ${message}`, ...details);
}

export function error(message: string, ...details: unknown[]): void {
  console.error(`[${PLUGIN_NAME}] ${message}`, ...details);
}
