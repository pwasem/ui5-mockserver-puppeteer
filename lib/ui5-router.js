'use strict';

// load modules
const express = require('express');
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer');

// load lib
const UI5Page = require('./UI5Page');

module.exports = options => {

	// create new page (incl. mock server)
	let ui5Page = new UI5Page(options);

	// a router object is an isolated instance of middleware and routes
	let router = express.Router();

	// parse any request body as text for forwarding
	router.use(bodyParser.text({
		type: '*/*'
	}));

	// handle all incoming requests
	router.all('/*', async (req, res, next) => {
		try {
			// forward request to page
			let result = await ui5Page.ajax(req.method, req.originalUrl, req.body);
			// send response with result returned by page
			res.set('Content-Type', result.contentType)
			res.end(result.data);
		} catch (error) {
			next(error);
		}
	});

	return router;
};