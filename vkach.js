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
	/* Parameters of constructor is a sequence of selectors
	in which areas audio elements are searched. */
	var Audio = function() {
		var self = this;
		this.searchAreas = arguments;
		this.clickListeners = [];

		$(document).click(function(e) {
			var elem = self.getFromPoint(e.pageX, e.pageY);
			if (elem !== null) {
				for (var i in self.clickListeners) {
					self.clickListeners[i].apply(elem, arguments);
				}
			}
		});
	}
	Audio.prototype = {
		click: function(listener) {
			this.clickListeners.push(listener);
			return this;
		},

		debug: function(on) {
			if (!on) {
				delete this.getFromPoint;
				return this;
			}

			var count = 0;
			var sumTime = 0;
			this.getFromPoint = function() {
				if (arguments.length > 2) {
					return Audio.prototype.getFromPoint.apply(this, arguments);
				}
				var start = $.now();
				var res = Audio.prototype.getFromPoint.apply(this, arguments);
				sumTime += $.now() - start;
				$('#stl_text').css('opacity', '1')
					          .html('Avg search time: ' + Math.round(sumTime / ++count) + 'ms (' + count + ')');
				return res;
			}

			return this;
		},

		getFromPoint: function(x, y, selector) {
			if (selector === undefined) {
				/* Call aggregate function for search of audio element
				into search areas by mouse cursor position. */
				return (function() {
					for (var i in this.searchAreas) {
						var elem = this.getFromPoint(x, y, this.searchAreas[i]);
						if (elem !== null) {
							return elem;
						}
					}
					return null;
				}).apply(this, arguments);
			}

			// get mouse cursor position relative to the element,
			// -2 - left, -1 - above, 0 - inside, 1 - below, 2 - right.
			var getRelPos = function(elem) {
				// skip preloaded elements
				if (!$(elem).filter(':visible').size()) {
					return -1;
				}

				var offset = $(elem).offset();
				if (y < offset.top)
					return -1;
				else if (y > offset.top + $(elem).outerHeight())
					return 1;
				else if (x < offset.left)
					return -2;
				else if (x > offset.left + $(elem).outerWidth())
					return 2;
				return 0;
			}

			// target elements
			elements = $(selector).find('.audio');

			// find element on mouse cursor position by dichotomy method
			var b = 0, e = elements.size();
			while (b != e) {
				var i = parseInt((b + e) / 2);
				var res = getRelPos(elements.get(i));
				if (res > 0) {
					b = i + 1;
				}
				else if (res < 0) {
					e = i;
				}
				else {
					return elements.get(i);
				}
			}
			return null;
		}
	};

	var audio = (new Audio(
		'#profile_audios',
		'#page_wall_posts',
		'#page_body'
	)).click(function(e) {
		// ignore clicks on elements except '.duration' element
		if ((function() {
			var area = $(this).find('.duration');
			if (!area.size()) {
				return true;
			}
			var offset = area.offset();
			if (e.pageY < offset.top ||
				e.pageY > offset.top + area.outerHeight() ||
				e.pageX < offset.left ||
				e.pageX > offset.left + area.outerWidth()) {
				return true;
			}
			return false;
		}).apply(this, arguments)) {
			return;
		}

		alert(this.id);
	});

	audio.debug(true);
});

