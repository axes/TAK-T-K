import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { UNIT_ORDER, UNIT_TEMPLATES, SETUP_ROWS } from '../../tactical-neon/src/config.js';
import { Unit } from '../../tactical-neon/src/entities/Unit.js';
import { RoomManager } from './RoomManager.js';
import { GameValidator } from './GameValidator.js';

const PORT = Number(process.env.PORT || 3000);
const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

const envOrigins = [process.env.CLIENT_URL, process.env.PRODUCTION_CLIENT_URL]
  .filter(Boolean)
  .map((origin) => origin.trim());

const allowedOrigins = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins])];

const app = express();
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('CORS BLOQUEADO'));
  }
}));
app.get('/health', (_, res) => {
  res.status(200).json({ ok: true, service: 'tak-t-k-server' });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('CORS BLOQUEADO'));
    },
    methods: ['GET', 'POST']
  }
});

const roomManager = new RoomManager();
const gameValidator = new GameValidator();

function sanitizeNickname(nickname) {
  const base = String(nickname || '').trim();
  if (!base) {
    return 'JUGADOR';
  }

  return base.slice(0, 24);
}

function normalizeSetupPlacements(placements, owner) {
  if (!placements) {
    return null;
  }

  const byKey = new Map();
  const rows = new Set(SETUP_ROWS[owner]);

  if (Array.isArray(placements)) {
    for (const item of placements) {
      const unitKey = item?.unitKey || item?.key || item?.type;
      const x = item?.x;
      const y = item?.y;
      if (!UNIT_ORDER.includes(unitKey) || typeof x !== 'number' || typeof y !== 'number') {
        return null;
      }
      byKey.set(unitKey, { x, y });
    }
  } else {
    for (const unitKey of UNIT_ORDER) {
      const item = placements[unitKey];
      const x = item?.x;
      const y = item?.y;
      if (typeof x !== 'number' || typeof y !== 'number') {
        return null;
      }
      byKey.set(unitKey, { x, y });
    }
  }

  if (byKey.size !== UNIT_ORDER.length) {
    return null;
  }

  const occupied = new Set();
  for (const key of UNIT_ORDER) {
    const position = byKey.get(key);
    if (position.x < 0 || position.x > 7 || position.y < 0 || position.y > 7) {
      return null;
    }

    if (!rows.has(position.y)) {
      return null;
    }

    const cell = `${position.x},${position.y}`;
    if (occupied.has(cell)) {
      return null;
    }
    occupied.add(cell);
  }

  return Object.fromEntries(byKey.entries());
}

function startTurn(gameState, owner) {
  gameState.currentPlayer = owner;
  gameState.turnNumber += 1;
  gameState.selectedUnitId = null;
  gameState.selectedAction = 'preview';

  for (const unit of gameState.units) {
    if (unit.owner === owner && unit.isAlive()) {
      unit.startTurn();
    }
  }
}

function buildInitialGameState(room) {
  const units = [];

  for (const [playerId, owner] of [['p1', 1], ['p2', 2]]) {
    const placements = room.players[playerId].setup;
    for (const unitKey of UNIT_ORDER) {
      const unit = new Unit(UNIT_TEMPLATES[unitKey], owner);
      const placement = placements[unitKey];
      unit.position = { x: placement.x, y: placement.y };
      units.push(unit);
    }
  }

  const startingOwner = Math.random() < 0.5 ? 1 : 2;
  const gameState = {
    phase: 'battle',
    mode: 'remote',
    inputLocked: false,
    setupPlayer: 1,
    currentPlayer: startingOwner,
    turnNumber: 0,
    winner: null,
    selectedUnitId: null,
    selectedAction: 'preview',
    setupPlacedByPlayer: {
      1: units.filter((unit) => unit.owner === 1).map((unit) => unit.id),
      2: units.filter((unit) => unit.owner === 2).map((unit) => unit.id)
    },
    units,
    log: ['BATALLA INICIADA']
  };

  startTurn(gameState, startingOwner);
  return gameState;
}

function toPublicGameState(gameState) {
  return {
    ...gameState,
    units: gameState.units.map((unit) => ({
      id: unit.id,
      key: unit.key,
      type: unit.type,
      name: unit.name,
      symbol: unit.symbol,
      owner: unit.owner,
      maxHp: unit.maxHp,
      hp: unit.hp,
      maxAp: unit.maxAp,
      ap: unit.ap,
      position: unit.position ? { ...unit.position } : null,
      basicAttack: { ...unit.basicAttack },
      specialAttack: { ...unit.specialAttack },
      nextTurnApPenalty: unit.nextTurnApPenalty,
      specialLockedMove: unit.specialLockedMove,
      movedThisTurn: unit.movedThisTurn
    }))
  };
}

function getPlayerIdBySocket(room, socketId) {
  if (room.players.p1?.socketId === socketId) {
    return 'p1';
  }

  if (room.players.p2?.socketId === socketId) {
    return 'p2';
  }

  return null;
}

function emitWinnerIfAny(room) {
  const winner = gameValidator.checkVictory(room.gameState) || room.gameState.winner || null;
  if (!winner) {
    return;
  }

  room.gameState.winner = winner;
  room.status = 'finished';
  io.to(room.id).emit('game:over', { winner });
}

io.on('connection', (socket) => {
  console.log(`[SOCKET] CONECTADO ${socket.id}`);

  socket.on('room:create', (payload = {}) => {
    const nickname = sanitizeNickname(payload.nickname);
    const room = roomManager.createRoom(socket.id, nickname);
    socket.join(room.id);

    socket.emit('room:created', { roomId: room.id, playerId: 'p1' });
    socket.emit('room:waiting');
  });

  socket.on('room:join', (payload = {}) => {
    const roomId = String(payload.roomId || '').trim().toUpperCase();
    const nickname = sanitizeNickname(payload.nickname);
    const result = roomManager.joinRoom(roomId, socket.id, nickname);

    if (!result.ok) {
      socket.emit('room:error', { msg: result.error });
      return;
    }

    const room = result.room;
    socket.join(room.id);
    socket.emit('room:joined', { playerId: 'p2' });

    io.to(room.players.p1.socketId).emit('room:ready', { opponent: room.players.p2.nickname });
    socket.emit('room:ready', { opponent: room.players.p1.nickname });
  });

  socket.on('game:setup', (payload = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) {
      socket.emit('room:error', { msg: 'SALA NO ENCONTRADA' });
      return;
    }

    const playerId = payload.playerId;
    const socketPlayerId = getPlayerIdBySocket(room, socket.id);
    if (!playerId || playerId !== socketPlayerId) {
      socket.emit('game:invalid', { reason: 'JUGADOR INVALIDO' });
      return;
    }

    const owner = playerId === 'p1' ? 1 : 2;
    const normalizedPlacements = normalizeSetupPlacements(payload.placements, owner);
    if (!normalizedPlacements) {
      socket.emit('game:invalid', { reason: 'SETUP INVALIDO' });
      return;
    }

    room.players[playerId].setup = normalizedPlacements;
    room.players[playerId].ready = true;
    room.status = 'setup';

    if (!room.players.p1.ready || !room.players.p2?.ready) {
      return;
    }

    room.gameState = buildInitialGameState(room);
    room.status = 'playing';
    io.to(room.id).emit('game:start', {
      startingPlayer: room.gameState.currentPlayer === 1 ? 'p1' : 'p2',
      gameState: toPublicGameState(room.gameState)
    });
  });

  socket.on('game:action', (payload = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) {
      socket.emit('room:error', { msg: 'SALA NO ENCONTRADA' });
      return;
    }

    const socketPlayerId = getPlayerIdBySocket(room, socket.id);
    if (!socketPlayerId || payload.playerId !== socketPlayerId) {
      socket.emit('game:invalid', { reason: 'JUGADOR INVALIDO' });
      return;
    }

    const validation = gameValidator.validateAction(room.gameState, payload);
    if (!validation.valid) {
      socket.emit('game:invalid', { reason: validation.reason });
      return;
    }

    const applied = gameValidator.applyAction(room.gameState, payload);
    if (applied.error) {
      socket.emit('game:invalid', { reason: applied.error });
      return;
    }

    room.gameState = applied.gameState;
    io.to(room.id).emit('game:update', {
      gameState: toPublicGameState(room.gameState),
      lastAction: applied.lastAction
    });
    emitWinnerIfAny(room);
  });

  socket.on('game:endturn', (payload = {}) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || !room.gameState) {
      socket.emit('room:error', { msg: 'SALA NO ENCONTRADA' });
      return;
    }

    const socketPlayerId = getPlayerIdBySocket(room, socket.id);
    if (!socketPlayerId || payload.playerId !== socketPlayerId) {
      socket.emit('game:invalid', { reason: 'JUGADOR INVALIDO' });
      return;
    }

    const action = { playerId: payload.playerId, type: 'endturn' };
    const validation = gameValidator.validateAction(room.gameState, action);
    if (!validation.valid) {
      socket.emit('game:invalid', { reason: validation.reason });
      return;
    }

    const applied = gameValidator.applyAction(room.gameState, action);
    if (applied.error) {
      socket.emit('game:invalid', { reason: applied.error });
      return;
    }

    room.gameState = applied.gameState;
    io.to(room.id).emit('game:update', {
      gameState: toPublicGameState(room.gameState),
      lastAction: 'endturn'
    });
    emitWinnerIfAny(room);
  });

  socket.on('disconnect', () => {
    const removal = roomManager.removeSocket(socket.id);
    console.log(`[SOCKET] DESCONECTADO ${socket.id}`);
    if (!removal?.opponentSocketId) {
      return;
    }

    io.to(removal.opponentSocketId).emit('room:opponent_disconnected');
  });
});

httpServer.listen(PORT, () => {
  console.log(`[SERVER] TAK-T-K ONLINE EN PUERTO ${PORT}`);
});
