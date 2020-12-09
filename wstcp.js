#!/usr/bin/env node

const getOptions = require("./options");
const createWsTunnel = require("./maketunnel");

options = getOptions();

createWsTunnel(options.tcpaddress,options.port,options.wsport,options.name,options.key,options.cert);
