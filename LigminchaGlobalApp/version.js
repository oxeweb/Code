'use strict';

lg.Version = lg.GlobalObject.extend({
	constructor: function(attributes, options) {
		attributes.type = LG_VERSION;
		Backbone.Model.apply( this, arguments );
	}
});

// This is a "static" method for opening a dialog to create a new LG_VERSION global object
lg.Version.createNew = function() {
	$('<div>test</div>').dialog({
		modal: true,
		resizable: false,
		width: 400,
		title: 'Create a new version',
		buttons: {
			'save': function() {
				var ver = new lg.Version({
					tag: '0.0.1'
				});
				lg.sendObject(ver);
			},
			'cancel': function() {
				$(this).dialog('close');
				this.remove();
			},
		}
	});
};
