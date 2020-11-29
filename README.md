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

# Notes

This utility is part of a larger project that allows a browser-emulated
Commodore 64 to connect to a BBS over the internet.

# License

Written by Antonino Porcino - MIT License

