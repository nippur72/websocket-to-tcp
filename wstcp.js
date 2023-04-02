#!/usr/bin/env node

const getOptions = require("./options");
const createWsTunnel = require("./maketunnel");

let { tcpaddress,port,wsport,usestrings,name,key,cert } = getOptions();

createWsTunnel(tcpaddress,port,wsport,usestrings,name,key,cert);
