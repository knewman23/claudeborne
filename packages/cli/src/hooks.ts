// ============================================
// Claudeborne — Claude Code Hook Installation
// ============================================

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { HTTP_PORT } from '@claudeborne/shared';

const SETTINGS_PATH = join(homedir(), '.claude', 'settings.json');
const MARKER = 'claudeborne';

// The curl command each hook uses to relay stdin JSON to our HTTP server.
// We include "claudeborne" in the URL query so we can identify our hooks later.
function makeHookCommand(): string {
  return `curl -s -X POST "http://localhost:${HTTP_PORT}/event?source=${MARKER}" -H 'Content-Type: application/json' -d @- 2>/dev/null || true`;
}

/**
 * Claude Code hooks use a nested format:
 * { "hooks": [{ "type": "command", "command": "..." }], "matcher"?: "..." }
 */
function makeHookEntry() {
  return {
    hooks: [{ type: 'command' as const, command: makeHookCommand() }],
  };
}

/** Hook event names Claude Code supports */
const HOOK_EVENTS = ['PreToolUse', 'PostToolUse', 'Notification', 'Stop'] as const;

interface HookCommandEntry {
  type?: string;
  command?: string;
}

interface HookGroupEntry {
  matcher?: string;
  hooks?: HookCommandEntry[];
  // Flat format fallback
  type?: string;
  command?: string;
}

/**
 * Check if a hook entry (in either flat or nested format) belongs to claudeborne.
 */
function isOurHook(entry: HookGroupEntry): boolean {
  // Nested format: { hooks: [{ type, command }] }
  if (Array.isArray(entry.hooks)) {
    return entry.hooks.some(
      (h) => typeof h.command === 'string' && h.command.includes(MARKER)
    );
  }
  // Flat format: { type, command }
  return typeof entry.command === 'string' && entry.command.includes(MARKER);
}

async function readSettings(): Promise<Record<string, unknown>> {
  try {
    const raw = await readFile(SETTINGS_PATH, 'utf-8');
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function writeSettings(settings: Record<string, unknown>): Promise<void> {
  // Ensure the directory exists
  await mkdir(join(homedir(), '.claude'), { recursive: true });
  await writeFile(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
}

/**
 * Install claudeborne hooks into ~/.claude/settings.json.
 * Merges with existing hooks — does not overwrite user config.
 */
export async function installHooks(): Promise<void> {
  const settings = await readSettings();

  // Ensure hooks object exists
  if (!settings.hooks || typeof settings.hooks !== 'object') {
    settings.hooks = {};
  }
  const hooks = settings.hooks as Record<string, unknown[]>;

  for (const eventName of HOOK_EVENTS) {
    if (!Array.isArray(hooks[eventName])) {
      hooks[eventName] = [];
    }

    // Remove any existing claudeborne hooks first (idempotent)
    hooks[eventName] = hooks[eventName].filter(
      (h: unknown) => !isOurHook(h as HookGroupEntry)
    );

    // Add our hook
    hooks[eventName].push(makeHookEntry());
  }

  settings.hooks = hooks;
  await writeSettings(settings);
  console.log(`  ⚔  Hooks installed in ${SETTINGS_PATH}`);
}

/**
 * Remove claudeborne hooks from ~/.claude/settings.json.
 * Preserves all other user hooks and settings.
 */
export async function removeHooks(): Promise<void> {
  let settings: Record<string, unknown>;
  try {
    settings = await readSettings();
  } catch {
    // If we can't read settings, nothing to remove
    return;
  }

  if (!settings.hooks || typeof settings.hooks !== 'object') {
    return;
  }
  const hooks = settings.hooks as Record<string, unknown[]>;

  for (const eventName of HOOK_EVENTS) {
    if (!Array.isArray(hooks[eventName])) continue;

    hooks[eventName] = hooks[eventName].filter(
      (h: unknown) => !isOurHook(h as HookGroupEntry)
    );

    // Clean up empty arrays
    if (hooks[eventName].length === 0) {
      delete hooks[eventName];
    }
  }

  // Clean up empty hooks object
  if (Object.keys(hooks).length === 0) {
    delete settings.hooks;
  } else {
    settings.hooks = hooks;
  }

  await writeSettings(settings);
  console.log(`  ⚔  Hooks removed from ${SETTINGS_PATH}`);
}

/**
 * Synchronous version of removeHooks for use in signal handlers
 * where async operations may not complete before process exit.
 */
export function removeHooksSync(): void {
  try {
    const raw = readFileSync(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(raw) as Record<string, unknown>;

    if (!settings.hooks || typeof settings.hooks !== 'object') return;
    const hooks = settings.hooks as Record<string, unknown[]>;

    for (const eventName of HOOK_EVENTS) {
      if (!Array.isArray(hooks[eventName])) continue;
      hooks[eventName] = hooks[eventName].filter(
        (h: unknown) => !isOurHook(h as HookGroupEntry)
      );
      if (hooks[eventName].length === 0) {
        delete hooks[eventName];
      }
    }

    if (Object.keys(hooks).length === 0) {
      delete settings.hooks;
    } else {
      settings.hooks = hooks;
    }

    mkdirSync(join(homedir(), '.claude'), { recursive: true });
    writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2) + '\n', 'utf-8');
    console.log(`  ⚔  Hooks removed from ${SETTINGS_PATH}`);
  } catch (err) {
    console.error('  ⚔  Warning: Could not remove hooks:', err);
  }
}
