import { Server as IOServer } from "socket.io";
import {
  ClientEvents,
  ServerEvents,
  WebRtcAnswer,
  WebRtcIceCandidate,
  WebRtcOffer,
} from "../../../lib/src/types/websockets";
import { Logger } from "../lib/logger";
import { Server, Socket } from "./types";

const onJoinRoom = (logger: Logger, socket: Socket) => (room: string) => {
  logger.info(`join room=${room} sid=${socket.id}`);

  socket.join(room);
  
  /*const clients = await socket.in(room).fetchSockets();
  clients.forEach(element => {
    logger.info(element.id);
  });*/

  socket.broadcast.to(room).emit("peerConnect", socket.id);
};

const onDisconnect = (logger: Logger, socket: Socket) => (reason: string) => {
  logger.info(`disconnecting reason=${reason} sid=${socket.id}`);

  socket.rooms.forEach((room) => {
    socket.broadcast.to(room).emit("peerDisconnect", socket.id);
  });
  
};

const onConnection = (logger: Logger, server: Server) => (socket: Socket) => {
  logger.info(`connection sid=${socket.id}`);

  socket.emit("connected");
  socket.on("joinRoom", onJoinRoom(logger, socket));
  socket.on("disconnecting", onDisconnect(logger, socket));
};

export const createServer = (logger: Logger): Server => {
  const server = new IOServer<ClientEvents, ServerEvents>({
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : "*",
      methods: ["GET", "POST"],
    },
  });

  server.on("connection", onConnection(logger, server));

  return server;
};
