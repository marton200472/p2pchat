import { createConsoleLogger } from "./lib/logger";
import { createServer } from "./websockets";

const express = require("express");
const cors = require("cors");
const { ExpressPeerServer } = require("peer");

const app = express();
app.use(cors());

const port = 9000;

const server = app.listen(port);

const peerServ = ExpressPeerServer(server, {
	path: "",
});

app.use("/peerjs", peerServ);
const logger = createConsoleLogger();
createServer(logger).listen(server);

logger.info(`Server listening on port ${port}`);

//import { Express } from "express";

/*const WS_PORT = 8080;
const PJS_PORT= 9000;

const logger = createConsoleLogger();

const eserv=require("http").createServer(require("express")());
const server = createServer(logger).listen(eserv);

server.listen(WS_PORT);
logger.info(`Websocket server listening on ${WS_PORT}`);



const peerServer = PeerServer({ path: "/kek" });
logger.info(`Websocket server listening on ${PJS_PORT}`);*/