const commandLineArgs = require('command-line-args')

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
      { name: 'tcpaddress' , alias: 't', type: String },
      { name: 'port'       , alias: 'p', type: Number },
      { name: 'wsport'     , alias: 'w', type: Number },
      { name: 'name'       , alias: 'n', type: String },
      { name: 'usestrings' , alias: 'u', type: Boolean, defaultValue: false },
      { name: 'key'  , type: String },
      { name: 'cert' , type: String }
   ]);

   if(options.tcpaddress === undefined ||
      options.port === undefined ||
      options.wsport === undefined) {
         console.log("Usage: wstcp -t tcpaddress -p tcpport -w wsport [-n name] [--usestrings] [--key key.pem --cert cert.pem]");
         process.exit(0);
   }

   return options;
}

module.exports = getOptions;
