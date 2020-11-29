#!/usr/bin/env node

let net = require('net');
let http = require('http');
let WebSocketServer = require("websocket").server;
let getOptions = require("./options");

options = getOptions();

const DISCONNECTED = 0;
const CONNECTED = 1;

function createTcpSocket(ondata, onerror, ontimeout, onclose, onconnect, onready) {
	let socket = new net.Socket();
	socket.on('data', ondata);
	socket.on('error', onerror);
	socket.on('timeout', ontimeout);
	socket.on('close', onclose);
	socket.on('connect', onconnect);
	socket.on('ready', onready);
	return socket;
}

let server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(options.wsport, function() {
    console.log(`${new Date()} Server is listening on port ${options.wsport} protocol "${options.name}"`);
});

wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});

function originIsAllowed(origin) {
	// put logic here to detect whether the specified origin is allowed.
	return true;
}

wsServer.on('request', function(request) {

	if(!originIsAllowed(request.origin)) {
	    // Make sure we only accept requests from an allowed origin
		request.reject();
		console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
		return;
	}

	let ws_connection = request.accept(options.name, request.origin);
	console.log(`${new Date()} connection accepted from ${request.origin}`);

	let TCP_state = DISCONNECTED;

	let ondata = (data) => ws_connection.sendBytes(data);

	let onerror = (error)=> console.log(`${new Date()} TCP error: ${error}`);

	let ontimeout = ()=> console.log(`${new Date()} TCP timeout`);

	let onclose = () => {
		TCP_state = DISCONNECTED;
		ws_connection.close();
		console.log(`${new Date()} TCP connection closed`);
	};

	let onconnect = () => console.log(`${new Date()} TCP connection established`);

	let onready = () => {
		TCP_state = CONNECTED;
		console.log(`${new Date()} TCP ready`);
	};

	let socket = new createTcpSocket(ondata, onerror, ontimeout, onclose, onconnect, onready);
	socket.connect(options.port, options.tcpaddress);

	ws_connection.on('message', function(message) {
		if(message.type === 'binary') {
			if(TCP_state == CONNECTED) {
				socket.write(message.binaryData);
			}
			else {
				console.log(`${new Date()} can't send to TCP: not yet connected`);
			}
		}
		else console.log(`${new Date()} invalid message type "${message.type}"`);
	});

	ws_connection.on('close', function(reasonCode, description) {
		if(TCP_state == CONNECTED) {
			socket.end();
		}
		console.log(`${new Date()} peer ${ws_connection.remoteAddress} disconnected`);
	});
});

