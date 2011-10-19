// pre-installation
(function(callback) {
	var elem = document.createElement("script");
	elem.setAttribute("src", "http://code.jquery.com/jquery-latest.min.js");
	elem.setAttribute("type", "text/javascript");
	document.head.appendChild(elem);

	var cnt = 0;
	var wait = function() {
		if (!window.jQuery) {
			return setTimeout(wait, Math.min(1000, ++cnt));
		}
		callback();
	}
	wait();
})

(function() {
	panel = {
		get: function() {
			var panel = $('#vkach');
			if (!panel.size()) {
				$('#header').append('<div id="vkach" style="display: none; border-top: 1px dashed #D9E0E7; padding: 8px 0px 0px; margin: 8px 0px 0px;"></div>');
			}
			return $('#vkach');
		}
	};

	$(document).delegate('#header', 'click', function(e) {
		if ($(e.target).closest('#vkach').size()) {
			return;
		}

		panel.get().toggle();

	}).delegate('.duration', 'click', function(e) {
		var audio = $(this).closest('.audio');
		if (!audio.size()) {
			return;
		}

		panel.get().append(audio.clone());
	});
});

