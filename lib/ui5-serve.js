'use strict'

// load modules
const normalizer = require('@ui5/project').normalizer;
const server = require('@ui5/server').server;

module.exports = async options => {
	
	let tree = await normalizer.generateProjectTree({
		cwd: options.cwd
	});

	return server.serve(tree, {
		port: options.port,
		changePortIfInUse: true,
		acceptRemoteConnections: false
	});

};