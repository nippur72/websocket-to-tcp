#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const http = require('http');
const https = require('https');
const WebSocketServer = require("websocket").server;

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

function handle_http_request(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
}

// create a listening HTTP or HTTPS server on the port wsport
//
function createHTTPxServer(wsport,key,cert) {
	let server;

	if(key === undefined || cert === undefined) {
		// HTTP server
		console.log("Creating HTTP server...");
		server = http.createServer(handle_http_request);
	}
	else {
		const config = {
			key: fs.readFileSync(key),
			cert: fs.readFileSync(cert)
		};
		console.log("Creating HTTPS server...");
		server = https.createServer(config, handle_http_request);
	}

	server.listen(wsport, function() {
		console.log(`${new Date()} Server is listening on port ${wsport}`);
	});

	return server;
}

// handles a WebSocket connection request
//

function createWsTunnel(tcpaddress,port,wsport,name,key,cert) {
	let server = createHTTPxServer(wsport,key,cert);
	wsServer = new WebSocketServer({httpServer: server, autoAcceptConnections: false});

	wsServer.on('request', function(request) {
		function originIsAllowed(origin) {
			// put logic here to detect whether the specified origin is allowed.
			return true;
		}

		if(!originIsAllowed(request.origin)) {
			// Make sure we only accept requests from an allowed origin
			request.reject();
			console.log(`${new Date()} Connection from origin ${request.origin} rejected.`);
			return;
		}

		let ws_connection;

		try {
			ws_connection = request.accept(name === undefined ? null : name, request.origin);
		}
		catch(err) {
			// wrong protocol or other error
			console.log(`${new Date()} ${err.message}`);
			return;
		}

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
		socket.connect(port, tcpaddress);

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
				socket.destroy();
			}
			console.log(`${new Date()} peer ${ws_connection.remoteAddress} disconnected`);
		});
	});
}

module.exports = createWsTunnel;
