// ============================================
// Claudeborne — Demo Mode
// ============================================

import type { ClaudeEvent } from '@claudeborne/shared';
import { categorizeToolName } from '@claudeborne/shared';

/** Demo event sequence simulating a Claude Code session */
const DEMO_SEQUENCE: Array<{ event: ClaudeEvent; delayMs: number }> = [
  {
    event: { type: 'session_start', timestamp: 0 },
    delayMs: 2000,
  },
  {
    event: { type: 'thinking', timestamp: 0, message: 'Analyzing the codebase...' },
    delayMs: 4000,
  },
  {
    event: {
      type: 'tool_use',
      timestamp: 0,
      tool: { name: 'Read', category: categorizeToolName('Read') },
    },
    delayMs: 3000,
  },
  {
    event: {
      type: 'tool_result',
      timestamp: 0,
      tool: { name: 'Read', category: categorizeToolName('Read') },
    },
    delayMs: 1500,
  },
  {
    event: { type: 'thinking', timestamp: 0, message: 'Planning changes...' },
    delayMs: 3500,
  },
  {
    event: {
      type: 'tool_use',
      timestamp: 0,
      tool: { name: 'Edit', category: categorizeToolName('Edit') },
    },
    delayMs: 4000,
  },
  {
    event: {
      type: 'tool_result',
      timestamp: 0,
      tool: { name: 'Edit', category: categorizeToolName('Edit') },
    },
    delayMs: 1500,
  },
  {
    event: {
      type: 'tool_use',
      timestamp: 0,
      tool: { name: 'Bash', category: categorizeToolName('Bash') },
    },
    delayMs: 5000,
  },
  {
    event: {
      type: 'tool_result',
      timestamp: 0,
      tool: { name: 'Bash', category: categorizeToolName('Bash') },
    },
    delayMs: 1500,
  },
  {
    event: {
      type: 'tool_use',
      timestamp: 0,
      tool: { name: 'Grep', category: categorizeToolName('Grep') },
    },
    delayMs: 3000,
  },
  {
    event: {
      type: 'tool_result',
      timestamp: 0,
      tool: { name: 'Grep', category: categorizeToolName('Grep') },
    },
    delayMs: 1500,
  },
  {
    event: { type: 'thinking', timestamp: 0, message: 'Reviewing changes...' },
    delayMs: 3000,
  },
  {
    event: {
      type: 'assistant_response',
      timestamp: 0,
      message: 'All changes have been applied successfully.',
    },
    delayMs: 4000,
  },
  {
    event: { type: 'session_end', timestamp: 0 },
    delayMs: 3000,
  },
];

/**
 * Run the demo event cycle. Calls `onEvent` for each simulated event.
 * Loops forever until the process is killed.
 */
export function startDemo(onEvent: (event: ClaudeEvent) => void): { stop: () => void } {
  let running = true;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  async function cycle() {
    while (running) {
      for (const step of DEMO_SEQUENCE) {
        if (!running) return;

        const event: ClaudeEvent = {
          ...step.event,
          timestamp: Date.now(),
        };
        onEvent(event);

        await new Promise<void>((resolve) => {
          timeoutId = setTimeout(resolve, step.delayMs);
        });
      }
    }
  }

  cycle();

  return {
    stop() {
      running = false;
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    },
  };
}
