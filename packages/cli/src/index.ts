#!/usr/bin/env node

import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import path from 'path';
import open from 'open';
import {
  HTTP_PORT,
  SCENES,
  categorizeToolName,
  type ClaudeEvent,
  type ClaudeEventType,
  type WsMessage,
  type SceneId,
} from '@claudeborne/shared';
import { installHooks, removeHooksSync } from './hooks.js';
import { startDemo } from './demo.js';

// ============================================
// CLI Arg Parsing
// ============================================

const args = process.argv.slice(2);
const demoMode = args.includes('--demo');
const noOpen = args.includes('--no-open');

// ============================================
// State
// ============================================

const clients = new Set<WebSocket>();
let currentScene: SceneId = 'firelink-shrine';

// ============================================
// HTTP Server + Static File Serving
// ============================================

const app = express();
app.use(express.json());

// Serve the built web app.
// In dev/workspace: ../web/dist relative to packages/cli/dist/
// In published bundle: ./web relative to dist/index.js
import { existsSync } from 'fs';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webDistCandidates = [
  path.resolve(__dirname, 'web'),           // published bundle (dist/web/)
  path.resolve(__dirname, '../../web/dist'), // workspace layout
];
const webDistPath = webDistCandidates.find(p => existsSync(p)) ?? webDistCandidates[0];
app.use(express.static(webDistPath));

const httpServer = createServer(app);

// ============================================
// WebSocket Server — streams events to browser
// (attached to the same HTTP server)
// ============================================

const wss = new WebSocketServer({ server: httpServer });

// Heartbeat: track alive status per client
const alive = new WeakMap<WebSocket, boolean>();

wss.on('connection', (ws) => {
  clients.add(ws);
  alive.set(ws, true);
  console.log(`  ⚔  Browser connected (${clients.size} client${clients.size > 1 ? 's' : ''})`);

  // Send current scene on connect
  const initMsg: WsMessage = {
    type: 'scene_init',
    payload: { sceneId: currentScene },
  };
  ws.send(JSON.stringify(initMsg));

  ws.on('pong', () => {
    alive.set(ws, true);
  });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString()) as WsMessage;
      if (msg.type === 'pong') {
        alive.set(ws, true);
      }
    } catch {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`  ⚔  Browser disconnected (${clients.size} client${clients.size > 1 ? 's' : ''})`);
  });
});

// Heartbeat interval: ping every 10s, terminate if no response in 30s
const heartbeatInterval = setInterval(() => {
  for (const ws of clients) {
    if (alive.get(ws) === false) {
      // No pong received since last ping — terminate
      ws.terminate();
      clients.delete(ws);
      continue;
    }
    alive.set(ws, false);
    // Send both WebSocket-level ping and application-level ping
    ws.ping();
    const pingMsg: WsMessage = { type: 'ping', payload: {} };
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(pingMsg));
    }
  }
}, 10_000);

function broadcast(event: ClaudeEvent) {
  const msg: WsMessage = { type: 'event', payload: event };
  const data = JSON.stringify(msg);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// ============================================
// HTTP API — receives Claude Code hook events
// ============================================

/**
 * Normalize a Claude Code hook payload into our ClaudeEvent type.
 *
 * Claude Code hooks send JSON via stdin. Different hook types have
 * different payload shapes:
 *   PreToolUse:  { tool_name, tool_input }
 *   PostToolUse: { tool_name, tool_result }
 *   Notification: { message }
 *   Stop: { ... }
 */
function normalizeHookPayload(
  body: Record<string, unknown>,
  hookType?: string
): ClaudeEvent {
  const event: ClaudeEvent = {
    type: 'assistant_response',
    timestamp: Date.now(),
  };

  // Determine event type from hook type or body
  if (hookType === 'PreToolUse' || body.tool_input !== undefined) {
    event.type = 'tool_use';
  } else if (hookType === 'PostToolUse' || body.tool_result !== undefined) {
    event.type = 'tool_result';
  } else if (hookType === 'Notification' || (body.message && !body.tool_name)) {
    event.type = 'thinking';
  } else if (hookType === 'Stop') {
    // Stop fires after each turn (when Claude finishes responding),
    // not at session end. Treat it as returning to idle.
    event.type = 'assistant_response';
  }

  // If body already has a valid type field, prefer it
  const bodyType = body.type as string | undefined;
  if (bodyType && isValidEventType(bodyType)) {
    event.type = bodyType;
  }

  // Handle tool events
  const toolName = (body.tool_name ?? body.tool) as string | undefined;
  if (toolName) {
    event.tool = {
      name: toolName,
      category: categorizeToolName(toolName),
    };
    // If we have a tool name but type wasn't set to tool_use/tool_result, default to tool_use
    if (event.type !== 'tool_use' && event.type !== 'tool_result') {
      event.type = 'tool_use';
    }
  }

  // Handle session events from legacy/direct format
  if (body.event === 'session_start') {
    event.type = 'session_start';
    currentScene = SCENES[Math.floor(Math.random() * SCENES.length)].id;
  } else if (body.event === 'session_end') {
    event.type = 'session_end';
  }

  // Attach message if present
  if (body.message) {
    event.message = body.message as string;
  }

  return event;
}

const VALID_EVENT_TYPES: Set<string> = new Set([
  'session_start', 'session_end', 'tool_use', 'tool_result',
  'assistant_response', 'thinking', 'error',
]);

function isValidEventType(t: string): t is ClaudeEventType {
  return VALID_EVENT_TYPES.has(t);
}

app.post('/event', (req, res) => {
  const body = req.body as Record<string, unknown>;
  const hookType = req.query.hook as string | undefined;
  const event = normalizeHookPayload(body, hookType);

  console.log(`  ⚔  Event: ${event.type}${event.tool ? ` (${event.tool.name})` : ''}${event.message ? ` — ${event.message}` : ''}`);

  broadcast(event);
  res.status(200).json({ ok: true });
});

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'alive',
    scene: currentScene,
    clients: clients.size,
    demo: demoMode,
  });
});

// SPA fallback — serve index.html for any non-API routes
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(webDistPath, 'index.html'));
});

// ============================================
// Banner
// ============================================

function printBanner() {
  const scene = SCENES.find((s) => s.id === currentScene)!;
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║          C L A U D E B O R N E       ║');
  console.log('  ║     FromSoftware × Claude Code        ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  ⚔  Scene: ${scene.name} (${scene.game})`);
  console.log(`  ⚔  Server: http://localhost:${HTTP_PORT}`);
  if (demoMode) {
    console.log('  ⚔  Mode: DEMO (simulated events)');
  } else {
    console.log('  ⚔  Mode: Live (Claude Code hooks)');
  }
  console.log('');
  console.log('  Waiting for a browser connection...');
  console.log('  Press Ctrl+C to quit.');
  console.log('');
}

// ============================================
// Startup
// ============================================

let demoHandle: { stop: () => void } | null = null;

async function start() {
  // Start HTTP server
  await new Promise<void>((resolve) => {
    httpServer.listen(HTTP_PORT, () => {
      resolve();
    });
  });

  printBanner();

  if (demoMode) {
    // Demo mode: send fake events through the broadcast pipeline
    demoHandle = startDemo((event) => {
      console.log(`  ⚔  Demo: ${event.type}${event.tool ? ` (${event.tool.name})` : ''}`);
      broadcast(event);
    });
  } else {
    // Live mode: install Claude Code hooks
    try {
      await installHooks();
    } catch (err) {
      console.error('  ⚔  Warning: Could not install hooks:', err);
      console.error('  ⚔  You can still send events manually via POST /event');
    }
  }

  // Open web app in browser
  if (!noOpen) {
    open(`http://localhost:${HTTP_PORT}`).catch(() => {
      console.log(`  ⚔  Could not auto-open browser. Visit http://localhost:${HTTP_PORT}`);
    });
  }
}

start().catch((err) => {
  console.error('Failed to start Claudeborne:', err);
  process.exit(1);
});

// ============================================
// Graceful Shutdown
// ============================================

let shuttingDown = false;

function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log('\n  ⚔  Shutting down Claudeborne...');

  // Stop demo if running
  if (demoHandle) {
    demoHandle.stop();
  }

  // Remove hooks synchronously so they're cleaned up before process exits
  if (!demoMode) {
    removeHooksSync();
  }

  // Stop heartbeat
  clearInterval(heartbeatInterval);

  // Close servers
  wss.close();
  httpServer.close();

  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
