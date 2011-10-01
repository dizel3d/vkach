// pre-installation
(function(callback) {
	var elem = document.createElement("script");
	elem.setAttribute("src", "http://code.jquery.com/jquery-latest.min.js");
	elem.setAttribute("type", "text/javascript");
	document.head.appendChild(elem);

	var wait = function() {
		if (!window.jQuery) {
			return setTimeout(wait, 1);
		}
		callback();
	}
	wait();
})

(function() {
	// class for detecting new audio HTML elements
	var Audio = function(searchAudioFunction) {
		this.getAll = searchAudioFunction;
		this.removingCount = 0;
	}
	Audio.prototype = {
		update: function(newAudioCallback) {
			var t = this;
			var auAll = t.getAll();

			// if some elements are being removed now
			if (t.removingCount) {
				return;
			}

			// if audio list was refreshed
			if (t.first !== auAll.get(0)) {
				//alert("refresh " + auAll.size());
				t.first = auAll.get(0);
				t.index = 0;
			}

			// try to get new audios
			var auNew = auAll.filter(function(i){return(i>=t.index)});
			if (auNew.size()) {

				// on "remove audio" event
				auNew.children('.remove_wrap').one('click', function() {
					++t.removingCount;
					var removing = $(this).parent();
					var parent = removing.parent();

					// wait while the element is being removed
					var wait = function() {
						if (parent.find(removing).size()) {
							return setTimeout(wait, 1);
						}

						// fix fields after removing
						if (removing.get(0) === t.first) {
							t.first = parent.children().get(0);
						}
						--t.index;
						--t.removingCount;
					}
					wait();
				});

				// add new audios
				t.index += auNew.size();
				newAudioCallback(auNew);
			}
		},
	}

	var audioDetectors = [
		new Audio(function() {
			// get element from all except the audio edit page
			return $('#audio_create_album').size() ? $() :
				$('#audios_list #initial_list').children();
		}),
		new Audio(function() {
			// get element from all except the audio edit page
			return $('#audio_create_album').size() ? $() :
				$('#audios_list #search_list').children();
		})
	];

	var newAudiosProcessor = function(audios) {
		// test for duplicates
		var au = audios.filter('[metka="true"]');
		if (au.size()) {
			alert('dup ' + au.size());
		}
		audios.attr('metka', 'true');

		audios.hover(function() {
			$(this).find('.duration').css('color', '#cc0000');
		}, function() {
			$(this).find('.duration').css('color', '');
		});
	};

	setInterval(function() {
		var start = new Date();
		for (i in audioDetectors) {
			audioDetectors[i].update(newAudiosProcessor);
		}
		var end = new Date();
		$('#stl_text').css('opacity', '1').html('Speed ' + (end.getTime()-start.getTime()) + ' ms');
	}, 200);
});

