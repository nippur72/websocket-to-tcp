#!/usr/bin/env node

//
// example program that makes multiple tunnels on the same instance
//

const commandLineArgs = require('command-line-args');
const createWsTunnel = require("./maketunnel");

function parseOptions(optionDefinitions) {
	try {
	   return commandLineArgs(optionDefinitions);
	} catch(ex) {
	   console.log(ex.message);
	   process.exit(-1);
	}
 }

function getOptions() {
    const options = parseOptions([
        { name: 'connlist'  , alias: 'l', type: String, multiple: true }
    ]);

    if(options.connlist === undefined) {
        console.log("Usage: wstcpm -l tcpaddress,tcpport,wsport,name,key,cert [...]");
        process.exit(0);
    }

    return options;
}

options = getOptions();

options.connlist.forEach(conn=>{
    let [tcpaddress,port,wsport,name,key,cert] = conn.split(",");
    console.log(`Creating multiple connection: ${conn}`);
    createWsTunnel(tcpaddress,port,wsport,name,key,cert);
});

