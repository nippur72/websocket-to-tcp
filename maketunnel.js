#!/usr/bin/env node

const fs = require('fs');
const net = require('net');
const http = require('http');
const https = require('https');
const WebSocketServer = require("websocket").server;
const sleep = require("./sleep");

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

/**
 *  Cancels all HTTP requests by returning 404
 *  @param {http.IncomingMessage} request the HTTP request
 *  @param {http.ServerResponse} response the HTTP response
 *  @returns {void}
 */
function handle_http_request(request, response) {
    console.log(`${new Date().toUTCString()} [${request.socket.remoteAddress}] requested ${request.url}`);
    response.writeHead(404);
    response.end();
}

// create a listening HTTP or HTTPS server on the port wsport
//
function createHTTPxServer(wsport,key,cert) {
	let server;

	if(key === undefined || cert === undefined) {
		// HTTP server
		console.log(`${new Date().toUTCString()} Creating HTTP server...`);
		server = http.createServer(handle_http_request);
	}
	else {
		function readCertsSync() {
			return {
				 key: fs.readFileSync(key),
				 cert: fs.readFileSync(cert)
			}
	   }
		console.log(`${new Date().toUTCString()} Creating HTTPS server...`);
		server = https.createServer(readCertsSync, handle_http_request);

		// watches for changes in the certificate updating server's context
		fs.watch(cert, async () => {
			await sleep(1000);
		   server.setSecureContext(readCertsSync());
			console.log(`${new Date().toUTCString()} New SSL certificate file acquired`);
  	   });
	}

	server.listen(wsport, function() {
		console.log(`${new Date().toUTCString()} Server is listening on port ${wsport}`);
	});

	return server;
}

// handles a WebSocket connection request
//

function createWsTunnel(tcpaddress,port,wsport,usestrings,name,key,cert) {

	// make name parameter optional (null when optional)
	if(name === undefined || name === "") name = null;

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
			console.log(`${new Date().toUTCString()} Connection from origin ${request.origin} rejected.`);
			return;
		}

		let ws_connection;

		try {
			ws_connection = request.accept(name, request.origin);
		}
		catch(err) {
			// wrong protocol or other error
			console.log(`${new Date()} ${err.message}`);
			return;
		}

		console.log(`${new Date().toUTCString()} connection accepted from ${request.origin}`);

		let TCP_state = DISCONNECTED;

		let ondata = (data) => {
         if(usestrings) ws_connection.send(data.toString());  
         else ws_connection.sendBytes(data);
      }

		let onerror = (error)=> console.log(`${new Date().toUTCString()} TCP error: ${error}`);

		let ontimeout = ()=> console.log(`${new Date().toUTCString()} TCP timeout`);

		let onclose = () => {
			TCP_state = DISCONNECTED;
			ws_connection.close();
			console.log(`${new Date().toUTCString()} TCP connection closed`);
		};

		let onconnect = () => console.log(`${new Date().toUTCString()} TCP connection established`);

		let onready = () => {
			TCP_state = CONNECTED;
			console.log(`${new Date().toUTCString()} TCP ready`);
		};

		let socket = new createTcpSocket(ondata, onerror, ontimeout, onclose, onconnect, onready);
		socket.connect(port, tcpaddress);

		ws_connection.on('message', function(message) {
         if(TCP_state == CONNECTED) {
            if(message.type === 'binary') socket.write(message.binaryData);                           
            else                          socket.write(message.utf8Data);     // defaults to UTF-8       
         }
         else {
            console.log(`${new Date().toUTCString()} can't send to TCP: not yet connected`);
         }
   });

		ws_connection.on('close', function(reasonCode, description) {
			if(TCP_state == CONNECTED) {
				socket.destroy();
			}
			console.log(`${new Date().toUTCString()} peer ${ws_connection.remoteAddress} disconnected`);
		});
	});
}

module.exports = createWsTunnel;
