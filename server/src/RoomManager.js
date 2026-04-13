const ROOM_ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const ROOM_ID_LENGTH = 6;

export class RoomManager {
  constructor() {
    this.rooms = new Map();
    this.socketToRoom = new Map();
  }

  createRoom(socketId, nickname) {
    const roomId = this.generateRoomId();
    const room = {
      id: roomId,
      players: {
        p1: { socketId, nickname, ready: false, setup: null },
        p2: null
      },
      gameState: null,
      status: 'waiting',
      lastStartingOwner: null,
      nextStartingOwner: null,
      rematch: null
    };

    this.rooms.set(roomId, room);
    this.socketToRoom.set(socketId, roomId);
    return room;
  }

  joinRoom(roomId, socketId, nickname) {
    const normalizedRoomId = String(roomId || '').trim().toUpperCase();
    const room = this.rooms.get(normalizedRoomId);
    if (!room) {
      return { ok: false, error: 'SALA NO ENCONTRADA' };
    }

    if (room.players.p2) {
      return { ok: false, error: 'SALA LLENA' };
    }

    room.players.p2 = { socketId, nickname, ready: false, setup: null };
    room.status = 'setup';
    this.socketToRoom.set(socketId, normalizedRoomId);
    return { ok: true, room, playerId: 'p2' };
  }

  getRoom(roomId) {
    const normalizedRoomId = String(roomId || '').trim().toUpperCase();
    return this.rooms.get(normalizedRoomId) || null;
  }

  getRoomBySocket(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) {
      return null;
    }

    return this.rooms.get(roomId) || null;
  }

  removeSocket(socketId) {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) {
      return null;
    }

    const room = this.rooms.get(roomId);
    this.socketToRoom.delete(socketId);
    if (!room) {
      return { roomId, disconnectedPlayerId: null, opponentSocketId: null, deletedRoom: false };
    }

    const p1 = room.players.p1;
    const p2 = room.players.p2;

    if (p1?.socketId === socketId) {
      const opponentSocketId = p2?.socketId || null;
      if (opponentSocketId) {
        this.socketToRoom.delete(opponentSocketId);
      }
      this.rooms.delete(roomId);
      return { roomId, disconnectedPlayerId: 'p1', opponentSocketId, deletedRoom: true };
    }

    if (p2?.socketId === socketId) {
      room.players.p2 = null;
      room.status = 'waiting';
      room.gameState = null;
      room.players.p1.ready = false;
      room.players.p1.setup = null;
      return { roomId, disconnectedPlayerId: 'p2', opponentSocketId: p1?.socketId || null, deletedRoom: false };
    }

    return { roomId, disconnectedPlayerId: null, opponentSocketId: null, deletedRoom: false };
  }

  resetRoomForRematch(roomId) {
    const room = this.getRoom(roomId);
    if (!room || !room.players.p1 || !room.players.p2) {
      return null;
    }

    room.status = 'setup';
    room.gameState = null;
    room.rematch = null;
    room.players.p1.ready = false;
    room.players.p1.setup = null;
    room.players.p2.ready = false;
    room.players.p2.setup = null;
    return room;
  }

  closeRoom(roomId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return false;
    }

    const sockets = [room.players.p1?.socketId, room.players.p2?.socketId];
    for (const socketId of sockets) {
      if (socketId) {
        this.socketToRoom.delete(socketId);
      }
    }

    this.rooms.delete(room.id);
    return true;
  }

  generateRoomId() {
    let roomId = '';
    do {
      roomId = '';
      for (let i = 0; i < ROOM_ID_LENGTH; i += 1) {
        const randomIndex = Math.floor(Math.random() * ROOM_ID_CHARS.length);
        roomId += ROOM_ID_CHARS[randomIndex];
      }
    } while (this.rooms.has(roomId));

    return roomId;
  }
}
