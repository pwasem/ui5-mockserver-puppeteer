'use strict';

// load modules
const puppeteer = require('puppeteer');

// load lib
const ui5Serve = require('./ui5-serve');

module.exports = class UI5Page {

	constructor(options) {
		this._cwd = options.cwd;
		this._port = options.port;
		this._rootUri = options.rootUri;
		this._page = null;
	}

	async _loadPage() {
		// start server & launch browser
		let [server, browser] = await Promise.all([
			ui5Serve({
				cwd: this._cwd,
				port: this._port
			}),
			puppeteer.launch()
		]);

		// open new page
		let page = await browser.newPage();

		// inject root uri
		page.evaluateOnNewDocument(rootUri => {
			Object.assign(window, {
				__ROOT_URI: rootUri
			});
		}, this._rootUri);

		// go to page
		await page.goto(`http://localhost:${server.port}/index.html`, {
			waitUntil: 'networkidle0' // ensure page has been fully loaded
		});

		return page;
	}

	async _evaluate() {
		// lazily load page
		if (!this._page) {
			this._page = await this._loadPage();
		}
		return this._page.evaluate.apply(this._page, [].slice.call(arguments));
	}

	ajax(reqMethod, reqUrl, reqBody) {
		return this._evaluate((method, url, body) => {
			// will be evaluated in the page's context
			return new Promise((resolve, reject) => {
				// trigger ajax request which will be intercepted by mockserver
				$.ajax({
						method: method,
						url: url,
						data: body,
						dataType: 'text'
					})
					.done((data, textStatus, jqXHR) => resolve({
						data: data,
						contentType: jqXHR.getResponseHeader('Content-Type')
					}))
					.fail((jqXHR, textStatus, errorThrown) => reject(new Error(errorThrown)));
			});
		}, reqMethod, reqUrl, reqBody);
	}
}