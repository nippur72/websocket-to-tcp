# WebSocket-to-TCP

This utility creates a server that accepts WebSocket connections
and forwards them to a TCP socket.

# Installation

```
npm i -g websocket-to-tcp
```

This installs the utility in the global register that
can be called from the command line interface with `wstcp`.

# Usage

```
wstcp -t tcpaddress -p tcpport -w wsport -n name
```

tcpaddress is the address of the remote TCP connection
tcpport    is the port number of the remote TCP connection
wsport     the websocket listening local port number
name       the name of the listening websocket connection

# Example

```
wstcp -t bbs.sblendorio.eu -p 6510 -w 8080 -n bbs
```

Creates a local server that accepts WebSocket connections on the port `8080`
and forwards them to `bbs.sblendorio.eu:6510`. The name of the WebSocket
connection is `bbs`.

# Multiple forward

It is possibile to create two or more "tunnels" per time, with `wstcpm`:

```
wstcpm -l \
   host1.com,6510,8080,bbs,privkey.pem,cert.pem \
   host2.com,6510,8081,bbs,privkey.pem,cert.pem
```
Each line represents a "tunnel", and has 5 parameters, separated by a comma:

* The destination host (e.g. **host1.com**)
* The destination "classic socket" port (e.g. **6510**)
* The local "web socket" port (e.g. **8080**)
* SSL private key (e.g. **privkey.pem**)
* SSL certificate (e.g. **cert.pem**)

# Notes

This utility is part of a larger project that allows a browser-emulated
Commodore 64 to connect to a BBS over the internet.

# License

Written by Antonino Porcino - MIT License

