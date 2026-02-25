// ============================================
// Scene Tilesets — 16x16 pixel tiles per scene
// ============================================

import { createSprite } from '../engine/spriteUtils';
import type { Tileset } from '../engine/types';

// ============================================
// Hunter's Workshop Tileset — Gothic workshop
// Index: 0=floor, 1=wall, 2=beam, 3=window, 4=workbench, 5=shelf, 6=chain, 7=empty
// ============================================

const WS_PAL: Record<string, string> = {
  'W': '#2a2030',  // wall dark
  'w': '#322838',  // wall highlight
  'F': '#3d2b1f',  // floor wood
  'f': '#4a3828',  // floor highlight
  'B': '#4a3520',  // beam
  'b': '#5a4530',  // beam highlight
  'N': '#4488aa',  // window moonlight
  'n': '#336688',  // window frame
  'D': '#5a3d2b',  // workbench
  'd': '#6a4d3b',  // workbench highlight
  'S': '#4a3520',  // shelf wood
  's': '#5a4530',  // shelf highlight
  'C': '#666666',  // chain
  'c': '#888888',  // chain highlight
  'K': '#1a1420',  // darkness
  'G': '#3a2a30',  // grout
};

const workshopFloor = createSprite(`
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
fFfFfFfFfFfFfFfF
FfFfFfFfFfFfFfFf
GGGGGGGGGGGGGGGG
`, WS_PAL);

const workshopWall = createSprite(`
WWWWWWWWWWWWWWWw
WWWWWWWWWWWWWWWw
WWwWWWWWWWWwWWWw
WWWWWWWWWWWWWWWw
WWWWWWWWWWWWWWWw
WWWWwWWWWWWWWWWw
WWWWWWWWWWWWWWWw
WWWWWWWWWwWWWWWw
WWWWWWWWWWWWWWWw
WWWWWWWWWWWWWWWw
WWwWWWWWWWWWWWWw
WWWWWWWWWWWWWWWw
WWWWWWWWwWWWWWWw
WWWWWWWWWWWWWWWw
WWWWWWWWWWWWWWWw
GGGGGGGGGGGGGGGG
`, WS_PAL);

const workshopBeam = createSprite(`
BbBBBBBBBBBBBBbB
bBBBBBBBBBBBBBBb
BBbBBBBBBBBBBbBB
BBBBBBBBBBBBBBbb
BbBBBBBBBBBBBBBB
BBBBbBBBBBBBBBbB
BBBBBBBBBBBBBBBb
BbBBBBBBBBBBBbBB
BBBBBBBBBBBBBBBb
BBbBBBBBBBBbBBBB
BBBBBBBBBBBBBBBb
BbBBBBBBBBBBBBBB
BBBBbBBBBBBBBBBb
BBBBBBBBBBBBbBBB
BbBBBBBBBBBBBBBB
BBbBBBBBBBBBBBbB
`, WS_PAL);

const workshopWindow = createSprite(`
nnnnnnnnnnnnnnnn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nnnnnnnnnnnnnnnn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nNNNNNNnnNNNNNNn
nnnnnnnnnnnnnnnn
`, WS_PAL);

const workshopBench = createSprite(`
dddddddddddddddd
DDDDDDDDDDDDDDDd
DDDDDDDDDDDDDDD.
DD..........DDDd
DD..........DDDd
DD..........DDDD
DD..........DDDD
DD..........DDDd
DD..........DDDd
DD..........DDDD
DD..........DDDD
DD..........DDDd
DD..........DDDd
DD..........DDDD
DD..........DDDD
DDDDDDDDDDDDDDDD
`, WS_PAL);

const workshopShelf = createSprite(`
SSSSSSSSSSSSSSSS
SssssssssssssssSd
S..............Sd
S..............Sd
SSSSSSSSSSSSSSSS
SssssssssssssssSd
S..............Sd
S..............Sd
SSSSSSSSSSSSSSSS
SssssssssssssssSd
S..............Sd
S..............Sd
SSSSSSSSSSSSSSSS
S..............S
S..............S
SSSSSSSSSSSSSSSS
`, WS_PAL);

const workshopChain = createSprite(`
....cccc........
...cCCCc........
...cCCCc........
....cccc........
.....cccc.......
....cCCCc.......
....cCCCc.......
.....cccc.......
....cccc........
...cCCCc........
...cCCCc........
....cccc........
.....cccc.......
....cCCCc.......
....cCCCc.......
.....cccc.......
`, WS_PAL);

const workshopEmpty = createSprite(`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
`, WS_PAL);

export const workshopTileset: Tileset = [
  workshopFloor,    // 0
  workshopWall,     // 1
  workshopBeam,     // 2
  workshopWindow,   // 3
  workshopBench,    // 4
  workshopShelf,    // 5
  workshopChain,    // 6
  workshopEmpty,    // 7
];

// ============================================
// Firelink Shrine Tileset — Ancient stone ruins
// Index: 0=stone floor, 1=stone wall, 2=pillar, 3=stair, 4=broken wall, 5=ash floor, 6=bonfire base, 7=empty
// ============================================

const FL_PAL: Record<string, string> = {
  'S': '#555550',  // stone
  's': '#666660',  // stone highlight
  'W': '#444440',  // wall dark
  'w': '#555550',  // wall highlight
  'P': '#5a5a55',  // pillar
  'p': '#6a6a65',  // pillar highlight
  'T': '#4a4a42',  // stair step
  't': '#5a5a52',  // stair highlight
  'B': '#3a3a32',  // broken
  'b': '#4a4a42',  // broken highlight
  'A': '#3a3428',  // ash
  'a': '#4a4438',  // ash highlight
  'F': '#666655',  // bonfire stone
  'f': '#777766',  // bonfire stone highlight
  'M': '#334422',  // moss
  'G': '#2a2820',  // grout
  'C': '#3a3832',  // crack
};

const firelinkFloor = createSprite(`
SSsSSSSSsSSSsSSS
sSSSsSSSSSSSSSsS
SSSSSsSSSsSSSSSS
SSsSSSSSSSSSsSsS
sSSSSSSSSSsSSSCS
SSSSSsSSSSSSSSSS
SSCSSSSSSSSsCSSS
SSSSsSSSsSSSSSsS
sSSSSSSSSSsSSSsS
SSSSSSsSSSSSSSCS
SSsSSSSSsSSSSSsS
SSSSSSSSSSsSSSsS
sSSSCSSSSSSSSSSS
SSSSSSSSSSsSSSsS
sSSSsSSSsSSSSSCS
GGGGGGGGGGGGGGGG
`, FL_PAL);

const firelinkWall = createSprite(`
WWWWWWWWWWWWWWwW
WWWWwWWWWWWWWWWW
WWWWWWWWWWwWWWWW
WWwWWWWWWWWWWWwW
WWWWWWWWWWWWWWWW
WWWWWwWWWWWWWWWW
WWWWWWWWWWWWwWWW
WWwWWWWWWWWWWWWW
WWWWWWWWWWWWWWWW
WWWWWWWwWWWWWWwW
WWwWWWWWWWWWWWWW
WWWWWWWWWWWWWWWW
WWWWwWWWWWWwWWWW
WWWWWWWWWWWWWWwW
WWwWWWWwWWWWWWWW
GGGGGGGGGGGGGGGG
`, FL_PAL);

const firelinkPillar = createSprite(`
.ppPPPPPPPPpp...
.pPPPPPPPPPPp...
..PPPPPPPPPP....
..PPPPPPPPPP....
..PPPpPPpPPP....
..PPPPPPPPPP....
..PPPPPPPPPP....
..PPpPPPPpPP....
..PPPPPPPPPP....
..PPPPPPPPPP....
..PPPPpPPPPP....
..PPPPPPPPPP....
..PPpPPPPpPP....
..PPPPPPPPPP....
..PPPPPPPPPP....
..PPPPPPPPPP....
`, FL_PAL);

const firelinkStair = createSprite(`
................
................
................
................
tttttttttttttttt
TTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
TTTTTTTTtTTTTTTT
................
................
tttttttttttttttt
TTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
TTTTtTTTTTTTTTTT
TTTTTTTTTTTTTTTT
TTTTTTTTTTTTTTTT
`, FL_PAL);

const firelinkBroken = createSprite(`
BBbBBBBBBb......
BBBBBBBBbb......
BBbBBBBb........
BBBBBBB.........
BBbBBb..........
BBBBb...........
BBBb............
BBb.............
Bb..............
B...............
................
................
................
................
................
................
`, FL_PAL);

const firelinkAsh = createSprite(`
AAaAAAAaAAaAAAAA
aAAAaAAAAAAAAaAA
AAAAAAAAaAAAaAAA
AaAAAAaAAAAAAAAA
AAAAaAAAAaAAAAAA
AAAAAAAAAAaAAAAa
AaAAAAAAAAAAaAAA
AAAAaAAAAAAAAaAA
AAAAAAaAAAAAAAAAa
AaAAAAAAAAaAAAAA
AAAAAAAAaAAAAAaA
AAaAAAAAAAAAaAAA
AAAAAaAAAAAAAAaA
AAAAAAAAaAAAAAAA
AaAAAAAAAAaAAAAA
GGGGGGGGGGGGGGGG
`, FL_PAL);

const firelinkBonfireBase = createSprite(`
................
................
................
................
................
................
................
................
......ffff......
....ffFFFFff....
...fFFFFFFFf....
..fFFFFFFFFFF...
..FFFFFFFFFFFF..
.FFFFFFFFFFFFF.
.FFFFFFFFFFFFF.
FFFFFFFFFFFFFFFF
`, FL_PAL);

const firelinkEmpty = createSprite(`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
`, FL_PAL);

export const firelinkTileset: Tileset = [
  firelinkFloor,       // 0
  firelinkWall,        // 1
  firelinkPillar,      // 2
  firelinkStair,       // 3
  firelinkBroken,      // 4
  firelinkAsh,         // 5
  firelinkBonfireBase, // 6
  firelinkEmpty,       // 7
];

// ============================================
// Site of Grace Tileset — Open ruins in nature
// Index: 0=grass, 1=stone path, 2=ruined column base, 3=crumbled wall, 4=dirt, 5=golden grass, 6=stone platform, 7=empty
// ============================================

const GR_PAL: Record<string, string> = {
  'G': '#2a4420',  // grass dark
  'g': '#3a5530',  // grass light
  'R': '#456630',  // grass rustle
  'S': '#6a6a5a',  // stone
  's': '#7a7a6a',  // stone highlight
  'C': '#5a5a4a',  // column stone
  'c': '#6a6a5a',  // column highlight
  'W': '#555548',  // wall stone
  'w': '#656558',  // wall highlight
  'D': '#4a4030',  // dirt
  'd': '#5a5040',  // dirt highlight
  'L': '#8a8040',  // golden grass
  'l': '#9a9050',  // golden grass highlight
  'P': '#6a6a5a',  // platform stone
  'p': '#7a7a6a',  // platform highlight
  'M': '#334422',  // moss
  'E': '#1a2a20',  // earth dark
};

const graceGrass = createSprite(`
GgGGgGGgGGgGGGgG
gGGGgGGGgGGGGgGG
GGgGGGRGGGgGGGGG
gGGGgGGGGGGgGGgG
GGGGGGgGGGGGGGGG
GgGGgGGGgGRGGGgG
gGGGgGGGGGGGGgGG
GGgGGGGGgGGGGGGG
GgGGGgGGGGGgGGGG
gGGGGGGGGgGGGGgG
GGRGGgGGGGGGgGGG
GgGGgGGGGGGGGGgG
gGGGGGGGgGGgGGGG
GGgGGRGGGGGGGgGG
GgGGGGGGGgGGGGGG
EEEEEEEEEEEEEEEE
`, GR_PAL);

const graceStonePath = createSprite(`
SSsSSSSSSSSSSsSS
sSSSsSSSsSSSSSsS
SSSSSSSSSSSSSsSS
SSsSSSSSSSSSSSsS
sSSSSSsSSSSSSSSS
SSSSSSSSSSsSsSSS
SSSsSSSSSSSSSSsS
sSSSSSSSsSSSSSsS
SSSSsSSSSSSSSSsS
sSSSSSSSSSsSSSSS
SSSSSSSSSSSSsSsS
SSsSSSsSSSSSSSSS
sSSSSSSSSSSSSSsS
SSSSSSSSsSSSSSSS
SSsSSSSSSSSsSSSS
EEEEEEEEEEEEEEEE
`, GR_PAL);

const graceColumnBase = createSprite(`
..ccCCCCCCcc....
.cCCCCCCCCCc....
.CCCCCCCCCCCC...
.CCCCCCCCCCCC...
.CCCCcCCcCCCC...
.CCCCCCCCCCCC...
.CCCCCCCCCCCC...
.CCcCCCCCcCCC...
.CCCCCCCCCCCC...
.CCCCCCCCCCCC...
.cCCCCCCCCCc....
..ccCCCCCCcc....
....CCCCCC......
....CCCCCC......
...CCCCCCCC.....
..CCCCCCCCCC....
`, GR_PAL);

const graceCrumbledWall = createSprite(`
WWwWWWWw........
WWWWWWWWw.......
WWwWWWWWW.......
WWWWWWWW........
WWwWWWw.........
WWWWWW..........
WWwWw...........
WWWw............
WWw.............
Ww..............
W...............
................
................
................
................
................
`, GR_PAL);

const graceDirt = createSprite(`
DDdDDDdDDDdDDDDD
dDDDdDDDDDDDdDDd
DDDDDDDdDDDdDDDD
DdDDDdDDDDDDDDdD
DDDDDDDDDdDDDDDD
DDdDDDDDDDDDdDDd
dDDDdDDDDdDDDDDD
DDDDDDdDDDDDDDdD
DdDDDDDDDDDdDDDD
DDDDdDDDDDDDDDdD
DDDDDDDDDdDDDDDD
DdDDDdDDDDDDdDDD
DDDDDDDDdDDDDDDd
DDdDDDDDDDDDDDDD
dDDDdDDDdDDDdDDD
EEEEEEEEEEEEEEEE
`, GR_PAL);

const graceGoldenGrass = createSprite(`
LlLLlLLLlLLlLLLL
lLLLlLLLLLLLlLLl
LLlLLLLLLLlLLLLL
lLLLlLLgLLLLLlLL
LLLLLLlLLLLLLLLL
LlLLlLLLLLLlLLgL
lLLLlLLLLlLLLLLL
LLlLLLLLLLLLlLLL
LlLLLlLLLLLLLLLL
lLLLLLLLLlLLLLlL
LLLLLlLLLLLlLLLL
LlLLlLLLLLLLLlLL
lLLLLLLLlLLlLLLL
LLlLLLLLLLLLLlLL
LlLLLLLLLlLLLLLL
EEEEEEEEEEEEEEEE
`, GR_PAL);

const graceStonePlatform = createSprite(`
ppPPPPPPPPPPPPpp
PPPPPPPPPPPPPPPP
PPPPpPPPPPPpPPPP
PPPPPPPPPPPPPPPP
PPpPPPPPPPPPPpPP
PPPPPPPPPPPPPPPP
PPPPPPpPPPpPPPPP
PPPPPPPPPPPPPPPP
PPpPPPPPPPPPpPPP
PPPPPPPPPPPPPPPP
PPPPpPPPPPPpPPPP
PPPPPPPPPPPPPPPP
PPPPPPPPPpPPPPPP
PPPPPPPPPPPPPPPP
PPpPPPPPPPPPPpPP
PPPPPPPPPPPPPPPP
`, GR_PAL);

const graceEmpty = createSprite(`
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
................
`, GR_PAL);

export const graceTileset: Tileset = [
  graceGrass,         // 0
  graceStonePath,     // 1
  graceColumnBase,    // 2
  graceCrumbledWall,  // 3
  graceDirt,          // 4
  graceGoldenGrass,   // 5
  graceStonePlatform, // 6
  graceEmpty,         // 7
];
