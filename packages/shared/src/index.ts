// ============================================
// Claudeborne — Shared Types
// ============================================

/** Games in the FromSoftware universe we support */
export type Game = 'bloodborne' | 'dark-souls' | 'elden-ring';

/** Character types — each tied to specific games */
export type CharacterType = 'hunter' | 'knight';

/** Which character belongs to which games */
export const CHARACTER_GAMES: Record<CharacterType, Game[]> = {
  hunter: ['bloodborne'],
  knight: ['dark-souls', 'elden-ring'],
};

/** Scene identifiers */
export type SceneId = 'hunters-dream' | 'firelink-shrine' | 'site-of-grace';

/** Scene metadata */
export interface SceneConfig {
  id: SceneId;
  name: string;
  game: Game;
  character: CharacterType;
  victoryText: string;
  deathText: string;
}

export const SCENES: SceneConfig[] = [
  {
    id: 'hunters-dream',
    name: "Hunter's Dream",
    game: 'bloodborne',
    character: 'hunter',
    victoryText: 'PREY SLAUGHTERED',
    deathText: 'YOU DIED',
  },
  {
    id: 'firelink-shrine',
    name: 'Bonfire',
    game: 'dark-souls',
    character: 'knight',
    victoryText: 'HEIR OF FIRE DESTROYED',
    deathText: 'YOU DIED',
  },
  {
    id: 'site-of-grace',
    name: 'Site of Grace',
    game: 'elden-ring',
    character: 'knight',
    victoryText: 'GREAT ENEMY FELLED',
    deathText: 'YOU DIED',
  },
];

// ============================================
// Claude Code Event Types
// ============================================

/** Raw event types from Claude Code hooks */
export type ClaudeEventType =
  | 'session_start'
  | 'session_end'
  | 'tool_use'
  | 'tool_result'
  | 'assistant_response'
  | 'thinking'
  | 'error';

/** Tool categories we care about */
export type ToolCategory = 'edit' | 'bash' | 'read' | 'search' | 'other';

/** Event sent from CLI to web app over WebSocket */
export interface ClaudeEvent {
  type: ClaudeEventType;
  timestamp: number;
  tool?: {
    name: string;
    category: ToolCategory;
  };
  message?: string;
}

/** Categorize a tool name into a broad category */
export function categorizeToolName(toolName: string): ToolCategory {
  const name = toolName.toLowerCase();
  if (name === 'edit' || name === 'write' || name === 'notebookedit') return 'edit';
  if (name === 'bash') return 'bash';
  if (name === 'read') return 'read';
  if (name === 'grep' || name === 'glob') return 'search';
  return 'other';
}

// ============================================
// Character Animation States
// ============================================

export type AnimationState =
  | 'idle'
  | 'walk'
  | 'inscribe'   // writing/editing code
  | 'read'       // reading files
  | 'forge'      // running bash commands
  | 'meditate'   // thinking
  | 'stagger'    // error
  | 'victory'    // task complete
  | 'rest'       // idle timeout
  | 'enter'      // session start
  | 'exit';      // session end

/** Map Claude events to character animation states */
export function eventToAnimation(event: ClaudeEvent): AnimationState {
  switch (event.type) {
    case 'session_start':
      return 'enter';
    case 'session_end':
      return 'exit';
    case 'thinking':
      return 'meditate';
    case 'error':
      return 'stagger';
    case 'assistant_response':
      return 'idle';
    case 'tool_use':
      if (!event.tool) return 'idle';
      switch (event.tool.category) {
        case 'edit': return 'inscribe';
        case 'bash': return 'forge';
        case 'read': return 'read';
        case 'search': return 'read';
        default: return 'idle';
      }
    default:
      return 'idle';
  }
}

// ============================================
// WebSocket Protocol
// ============================================

export const WS_PORT = 19280;
export const HTTP_PORT = 19281;
export const WEB_PORT = 19282;

export interface WsMessage {
  type: 'event' | 'scene_init' | 'ping' | 'pong';
  payload: ClaudeEvent | { sceneId: SceneId } | Record<string, never>;
}
