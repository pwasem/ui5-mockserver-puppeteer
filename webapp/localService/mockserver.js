sap.ui.define([
	'sap/ui/core/util/MockServer'
], (MockServer) => {
	'use strict';

	let oMockServer = new MockServer({
		rootUri: window.__ROOT_URI // will be injected by puppeteer
	});

	let sMetadataString = sap.ui.require.toUrl("localService/metadata.xml");
	var sMockdataBaseUrl = sap.ui.require.toUrl("localService/mockdata");
	oMockServer.simulate(sMetadataString, {
		sMockdataBaseUrl: sMockdataBaseUrl
	});

	oMockServer.start();
});