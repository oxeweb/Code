'use strict';

(function($, lg) {

	lg.initMap = function() {
		$('div.map').each(function() {
			var map, opt, info, markers, canvas = $(this);

			opt = {
				type: "HYBRID",
				width: "300px",
				height: "200px",
				lat: -36.37632505501232,
				lon: 175.08773803710938,
				zoom: 10
			};
			canvas.html('').css('background','none');

			// Initialise some of the options
			opt.canvas = canvas;
			opt.center = new google.maps.LatLng(opt.lat, opt.lon);
			opt.mapTypeId = google.maps.MapTypeId[opt.type.toUpperCase()];
			map = new google.maps.Map(this, opt);

			// Popup an infobox with position and scale when map clicked
			map.addListener('click', function(e) {
				if(info) info.close();
				info = new google.maps.InfoWindow({ content: e.latLng.toString() + ', zoom=' + map.zoom, position: e.latLng });
				info.open(map);
			});

			// Update the markers whenever the scale changes
			map.addListener('zoom_changed', function() {
				updateMarkers();
			});

			// Update infowindow content whenever global objects change
			lg.ligminchaGlobal.on('add', updateMarkers, this);
			lg.ligminchaGlobal.on('remove', updateMarkers, this);

			// Render the markers for the servers
			markers = {};
			updateMarkers();

			/**
			 * Update the markers (dependent on zoom level)
			 */
			function updateMarkers() {
				var view, marker, server, atts;
				var servers = lg.select({type: LG_SERVER});
				for(var i in servers) {
					server = servers[i];
					atts = server.attributes;

					// If marker already exists, update content
					if(server.id in markers) {
						marker = markers[server.id];
						view = new lg.ServerView({model: server});
						marker.infow.setContent(view.render().el);
					}

					// Marker doesn't currently exist, create it now
					else {
						marker = markers[server.id] = new google.maps.Marker({
							position: tempPosition(atts.tag),
							title: atts.name,
							map: map,
						});

						// Make the marker popup
						view = new lg.ServerView({model: server});
						marker.infow = new google.maps.InfoWindow({ maxWidth: 300, content: view.render().el });
						marker.infow.open(map, marker);
						google.maps.event.addListener(marker, 'click', function() {
							//if(info) info.close(); // only allow one popup at a time
							info = this.infow;
							console.log(this.infow);
							info.open(map, this);
						});
					}
				}
			}

			/**
			 * Temporarily hard-wire the map position based on the domain
			 */
			function tempPosition(domain) {
				console.log('Creating map marker for ' + domain);
				if(domain == 'ligmincha.organicdesign.co.nz') return new google.maps.LatLng(-36.888408043138206, 174.69085693359375);
				else if(domain == 'ligmincha.organicdesign.tv') return new google.maps.LatLng(-37.13732976724878, 175.60134887695312);
				else if(domain == 'ligmincha.organicdesign.wiki') return new google.maps.LatLng(-36.82137828938331, 175.15228271484375);
				else return new google.maps.LatLng(opt.lat, opt.lon);
			}
		});
	};

}(jQuery, window.lg));
