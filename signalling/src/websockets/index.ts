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
import { log } from "winston";

const onJoinRoom = (logger: Logger, socket: Socket) => (room: string, callback: CallableFunction) => {
  logger.info(`join room=${room} sid=${socket.id}`);

  socket.join(room);
  
  /*const clients = await socket.in(room).fetchSockets();
  clients.forEach(element => {
    logger.info(element.id);
  });*/

  socket.broadcast.to(room).emit("peerConnect", socket.data.peerjsid);
  callback();
};

const onSetPeerJsId = (logger: Logger, socket: Socket) => (id: string) => {
  socket.data.peerjsid = id;
  socket.emit("peerJsIdSet");
}

const onDisconnect = (logger: Logger, socket: Socket) => (reason: string) => {
  logger.info(`disconnecting reason=${reason} sid=${socket.id}`);

  socket.rooms.forEach((room) => {
    socket.broadcast.to(room).emit("peerDisconnect", socket.data.peerjsid);
  });
  
};

const onConnection = (logger: Logger, server: Server) => (socket: Socket) => {
  logger.info(`connection sid=${socket.id}`);
  
  socket.on("joinRoom", onJoinRoom(logger, socket));
  socket.on("disconnecting", onDisconnect(logger, socket));
  socket.on("setPeerJsId", onSetPeerJsId(logger, socket));

  socket.emit("connected");
};

export const createServer = (logger: Logger): Server => {
  const server = new IOServer<ClientEvents, ServerEvents>({
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : "*",
      //methods: ["GET", "POST"],
    },
  });

  server.on("connection", onConnection(logger, server));

  return server;
};
