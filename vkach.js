// pre-installation
;(function(callback) {
	var loading;
	var load = function(src) {
		if (loading !== src) {
			loading = src;
			var elem = document.createElement("script");
			elem.setAttribute("src", src);
			elem.setAttribute("type", "text/javascript");
			document.head.appendChild(elem);
		}
	}

	var cnt = 0;
	var wait = function() {
		if (!window.jQuery) {
			load("http://code.jquery.com/jquery-latest.min.js");
		}
		else if (!jQuery.fn.flash) {
			load("http://jquery.lukelutman.com/plugins/flash/jquery.flash.js");
		}
		else {
			return callback();
		}
		return setTimeout(wait, Math.min(1000, ++cnt));
	}
	wait();
})

(function() {
	var toFilename = function(str) {
		return String(str)
			.replace(/(&#?\w+;|<[^>]+>)/g, "") // remove HTML entities
			.replace(/^\s*/, "").replace(/\s*$/, "") // trim
			.replace(/\s+/g, " ") // fix spaces
			.replace(/[/\\:\*\?\"\|%]/g, ""); // remove forbidden characters
	};

	var getAudioInfo = function() {
		var artist = $(this).find('.info > :eq(1) a:first').html();
		var title = $(this).find('.info .title').html() || $(this).find('.info [id^="title"]').html();
		var src = $(this).find('input:first').attr('value').split(',')[0];

		return {
			src: src,
			artist: toFilename(artist),
			title: toFilename(title)
		};
	};

	$(document).mouseover(function(e) {
		var target = $(e.target);
		if (target.is('.duration')) {
			var audio = target.closest('.audio');
			if (!audio.size()) {
				return;
			}

			// insert hyperlink once if Flash isn't supported
			if (!(target.parent('a').size())) {
				info = getAudioInfo.apply(audio);
				audio.wrap('<a onclick="return false;" href="' + info.src + '"/>');
			}

			// capture audio
			var flash = getFlash();
			if (flash) {
				flash.capture(audio.get(0), target);
			}
		}
	});

	$(document).mousedown(function(e) {
		if (e.which != 1 || e.target !== getFlash() || !e.target.captured) {
			return getFlash().release();
		}

		// download captured audio
		var flash = e.target;
		if (flash.ext_download) {
			info = getAudioInfo.apply(flash.captured);
			flash.ext_download(info.src, info.artist + ' - ' + info.title + '.mp3');
		}
	});

	var getFlash = function() {
		// return Flash movie if vkach-panel exists
		if (($('#vkach').get(0))) {
			return $('#vkachflash').get(0);
		}

		// add vkach-panel
		$(document.body).prepend('<div id="vkach" style="position: absolute;"></div>');

		// try to add Flash movie to vkach-panel
		$('#vkach').flash(
			{ id: 'vkachflash',
			  src: String($('head > script[src$="vkach.js"]').attr('src')).replace(/\.js$/, '.swf'),
			  width: 0,
			  height: 0,
			  style: 'position: absolute; z-index: 100',
			  allowscriptaccess: 'always',
			  allownetworking: 'all',
			  wmode: "transparent" },
			{ version: 8 }
		);
		var flash = $('#vkachflash').get(0);
		if (!flash) {
			return;
		}

		// add additional functional to the Flash movie
		flash.capture = function(target, region) {
			if (this.captured === target) {
				return;
			}
			this.captured = target;
			$(this).offset($(region).offset());
			$(this).attr('width', $(region).outerWidth());
			$(this).attr('height', $(region).outerHeight());
		};
		flash.release = function() {
			this.captured = null;
			$(this).attr('height', 0);
		};

		return flash;
	};
	$(document).ready(getFlash);
});

