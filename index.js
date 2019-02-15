'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');

// load lib
const ui5Router = require('./lib/ui5-router');

// config
const PORT = parseInt(process.env.npm_package_config_port);
const ROOT_URI = "/sap/opu/odata/sap/MEETUP_SRV/";

// create new app
let app = express();

// log incoming requests
app.use(morgan('dev'));

// forward requests to mockserver
app.use(ROOT_URI, ui5Router({
	cwd: __dirname,
	port: PORT + 1, // port for ui5 server (only used internally)
	rootUri: ROOT_URI
}));

// start server
let server = app.listen(PORT, () => console.log(`app is listening at http://localhost:${PORT}`));
server.on('error', error => console.error(`${error.message}`));