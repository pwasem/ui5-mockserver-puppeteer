'use strict';

// load modules
const express = require('express');
const bodyParser = require('body-parser')
const puppeteer = require('puppeteer');

// load lib
const ui5Serve = require('./ui5-serve');

async function _loadPage(options) {

	// start server & launch browser
	let [server, browser] = await Promise.all([
		ui5Serve({
			cwd: options.cwd,
			port: options.port
		}),
		puppeteer.launch()
	]);

	// open new page
	let page = await browser.newPage();

	// inject root uri
	page.evaluateOnNewDocument(rootUri => {
		Object.assign(window, {
			ROOT_URI: rootUri
		});
	}, options.rootUri);

	// go to page
	await page.goto(`http://localhost:${server.port}/index.html`, {
		waitUntil: 'networkidle0' // ensure page has been loaded
	});

	return page;
}

function _ajax(method, url, body) { 
	// will be evaluated in the page context
	return new Promise((resolve, reject) => {
		// trigger ajax request which will be intercepted by mockserver
		$.ajax({
				method: method,
				url: url,
				data: body
			})
			.done((data, textStatus, jqXHR) => resolve(data))
			.fail((jqXHR, textStatus, errorThrown) => reject(new Error(errorThrown)));
	});
}

module.exports = options => {

	// a router object is an isolated instance of middleware and routes
	let router = express.Router();

	// parse any request body as text for forwarding
	router.use(bodyParser.text({
		type: '*/*'
	}));

	// lazily load page on first request
	let page = null;

	// handle all incoming requests
	router.all('/*', async (req, res, next) => {
		try {
			if (!page) {
				page = await _loadPage(options);
			}
			// forward request to page
			let data = await page.evaluate(_ajax, req.method, req.originalUrl, req.body);
			// send response with data returned by page
			res.json(data);
		} catch (error) {
			next(error);
		}
	});

	return router;
};