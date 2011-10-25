// pre-installation
;(function(callback) {
	var srcs = [
		"http://code.jquery.com/jquery-latest.min.js",
	];
	for (var i in srcs) {
		var elem = document.createElement("script");
		elem.setAttribute("src", srcs[i]);
		elem.setAttribute("type", "text/javascript");
		document.head.appendChild(elem);
	}

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
	var audioClick = function(e) {
		// get info
		var artist = $(this).find('.info > :eq(1) a:first').html();
		var titleSpan = $(this).find('.info > :eq(1) span:first');
		var title = titleSpan.children().html() || titleSpan.html();
		var src = $(this).find('input:first').attr('value').split(',')[0];

		var filename = artist + ' - ' + title + '.mp3';

		// insert hyperlink
		var region = $(this).find('.duration:first');
		if (!(region.parent('a').size())) {
			region.wrap('<a href="' + 'http://localhost/vkach/' + filename + '?src=' + src + '"/>');
			region.css('color', 'green');
		}
	};

	var durationClick = function(e) {
		var target = $(e.target);
		if (target.is('.duration')) {
			var audio = target.closest('.audio').get(0);
			if (audio) {
				return audioClick.apply(audio, arguments);
			}
		}
	};

	var contextmenu_enabled = false;
	$(document).bind('mousedown', function(e) {
		if (e.which == 3 && contextmenu_enabled) {
			return;
		}
		return durationClick.apply(this, arguments);
	})
	.bind('contextmenu', function() {
		contextmenu_enabled = true;
		return durationClick.apply(this, arguments);
	});
});

