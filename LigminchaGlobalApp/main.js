'use strict';

/**
 * Preload images
 */
(new Image()).src = '/images/loader.gif';

/**
 * App initialisation
 */

// Remove automatic data synchronisation with the back-end
Backbone.sync = function(method, model, options) { };

// When a new object is added to the collection, upgrade it to the proper model sub-class and re-render the list
lg.ligminchaGlobal.on('add', lg.upgradeObject, lg);

// Populate the ligminchaGlobal collection with the initial objects sent from the backend
var objects = lg.getConfig('GlobalObjects');
for(var i in objects) lg.ligminchaGlobal.create(objects[i]);

// Get the session is there is one
lg.session = lg.getConfig('session');
lg.user = false;
if(lg.session) {
	console.log('Session ID sent from server: ' + lg.session.short());
	lg.session = lg.getObject(lg.session);
	lg.user = lg.getObject(lg.session.owner);
} else console.log('No session ID sent from server')

// Connect the WebSocket if there's an active session
if(lg.session && typeof webSocket === 'object') {

	// The wsClientID is the SSO session id + a unique ID for this socket
	// TODO: we won't need the second socket ID later because there will be only one socket per session
	lg.setConfig('wsClientID', mw.data.session + ':' + lg.hash(lg.uuid()));

	// Creation the connection
	lg.ws = webSocket.connect();

	// Subscribe to the LigminchaGlobal messages and send them to the recvQueue function
	webSocket.subscribe( 'LigminchaGlobal', function(data) { lg.recvQueue(data.msg) });

	// Reconnect if disconnected
	webSocket.disconnected(function() {
		//setTimeout(function() { lg.ws = webSocket.connect(); }, 1000);
	});

	// Initialise the per-second ticker
	lg.ticker();
}

// Render the toolbar
lg.template('global-toolbar', {}, function(html) {
	$('#lg-toolbar').html(html);
	$('#g_tb').animate({top: 0}, 500);
});

