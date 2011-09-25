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
	var createDock = function(default_dock_height, expanded_dock_height) {
		// create dock
		$('body').append('<div id="vkach"></div>');
		var body = $('#page_wrap');
		var dock = $('#vkach');
		var easing_type = 'linear';
		var body_height = $(window).height() - default_dock_height;
		body.css({'height': body_height, "overflow": "auto"});
		dock.css({'height': default_dock_height, 'position':'absolute', 'top': body_height, "background": "#ccc", "z-index": 100, "width": "100%"});

		// window resize event
		$(window).resize(function () {
			updated_height = $(window).height() - default_dock_height;
			body.css('height', updated_height); 
			dock.css({'top': updated_height});
		});

		// dock mouse events
		dock.mouseover(function () {
			expanded_height = $(window).height() - expanded_dock_height;
			$(this).animate({'height':expanded_dock_height,'top': expanded_height}, {queue:false, duration:'fast', easing: easing_type});
		}).mouseout(function () {
			body_height = $(window).height() - default_dock_height;
			$(this).animate({'height':default_dock_height,'top': body_height}, {queue:false, duration:'fast', easing: easing_type});
		});

		return dock;
	}

	$(document).ready(function() {
		dock = createDock(40, 200);
		dock.append('<a href="https://github.com/dizel3d/">https://github.com/dizel3d/</a>');
	});
});

