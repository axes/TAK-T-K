import { io } from 'https://cdn.socket.io/4.7.2/socket.io.esm.min.js';
import { SERVER_URL } from './config.js';

let singletonInstance = null;

export class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  static getInstance() {
    if (!singletonInstance) {
      singletonInstance = new SocketManager();
    }

    return singletonInstance;
  }

  connect(serverUrl = SERVER_URL) {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    for (const [event, handlers] of this.listeners.entries()) {
      for (const handler of handlers) {
        this.socket.on(event, handler);
      }
    }

    return this.socket;
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  emit(event, data = {}) {
    if (!this.socket) {
      throw new Error('SOCKET DESCONECTADO');
    }

    this.socket.emit(event, data);
  }

  on(event, fn) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event).add(fn);

    if (this.socket) {
      this.socket.on(event, fn);
    }
  }

  off(event, fn) {
    const handlers = this.listeners.get(event);
    if (!handlers) {
      return;
    }

    handlers.delete(fn);
    if (handlers.size === 0) {
      this.listeners.delete(event);
    }

    if (this.socket) {
      this.socket.off(event, fn);
    }
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }
}
