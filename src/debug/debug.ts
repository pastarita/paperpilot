/**
 * Debug configuration and utility functions
 */

// Debug levels
export enum DebugLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

interface DebugConfig {
  enabled: boolean;
  level: DebugLevel;
  prefix: string;
}

// Default configuration
const config: DebugConfig = {
  enabled: true,
  level: DebugLevel.INFO,
  prefix: '[PaperPilot]'
};

/**
 * Log a debug message
 */
export function debug(...args: any[]) {
  if (!config.enabled || config.level < DebugLevel.DEBUG) return;
  console.debug(config.prefix, ...args);
}

/**
 * Log an info message
 */
export function info(...args: any[]) {
  if (!config.enabled || config.level < DebugLevel.INFO) return;
  console.info(config.prefix, ...args);
}

/**
 * Log a warning message
 */
export function warn(...args: any[]) {
  if (!config.enabled || config.level < DebugLevel.WARN) return;
  console.warn(config.prefix, ...args);
}

/**
 * Log an error message
 */
export function error(...args: any[]) {
  if (!config.enabled || config.level < DebugLevel.ERROR) return;
  console.error(config.prefix, ...args);
}

/**
 * Log a trace message
 */
export function trace(...args: any[]) {
  if (!config.enabled || config.level < DebugLevel.TRACE) return;
  console.trace(config.prefix, ...args);
}

/**
 * Configure debug settings
 */
export function configure(options: Partial<DebugConfig>) {
  Object.assign(config, options);
}

/**
 * Enable or disable debugging
 */
export function setEnabled(enabled: boolean) {
  config.enabled = enabled;
}

/**
 * Set debug level
 */
export function setLevel(level: DebugLevel) {
  config.level = level;
}

/**
 * Set debug prefix
 */
export function setPrefix(prefix: string) {
  config.prefix = prefix;
}

// Export debug configuration
export const DEBUG = {
  config,
  debug,
  info,
  warn,
  error,
  trace,
  configure,
  setEnabled,
  setLevel,
  setPrefix,
  DebugLevel
};