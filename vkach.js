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
	var Audio = function() {
		this.clickListeners = [];

		// override for debug
		this.getFromPoint = function() {
			var start = $.now();
			var res = Audio.prototype.getFromPoint.apply(this, arguments);
			$('#stl_text').css('opacity', '1')
			              .html('Speed ' + ($.now() - start) + ' ms');
			return res;
		}
	}
	Audio.prototype = {
		applyTo: function(selector) {
			var self = this;
			$(selector).click(function(e) {
				var elem = self.getFromPoint(this, e.pageX, e.pageY);
				if (elem !== null) {
					for (var i in self.clickListeners) {
						self.clickListeners[i].apply(elem, arguments);
					}
				}
			});
			return this;
		},

		click: function(listener) {
			this.clickListeners.push(listener);
			return this;
		},

		getFromPoint: function(selector, x, y) {
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

			// find element by position
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

	var audio = (new Audio()).click(function(e) {
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

	var setUp = function() {
		var container = $('#page_body');
		if (!container.size()) {
			return setTimeout(setUp, 1);
		}
		audio.applyTo(container);
	}
	setUp();
});

