// Copyright (C) Valentin Sarychev <dizel3d@gmail.com>, 2011

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
			.replace(/&amp;/g, "&")
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

	// overload style class .duration
	$(document.head).append('<style>.duration {cursor: pointer;}</style>');

	$(document).mouseover(function(e) {
		var target = $(e.target);
		if (target.is('.duration') && !target.attr('id')) {
			var audio = target.closest('.audio');
			if (!audio.size()) {
				return;
			}

			// capture audio
			var flash = getFlash();
			if (flash) {
				return flash.capture(audio.get(0), target);
			}

			// insert hyperlink once if Flash isn't supported
			if (!(target.find('a').size())) {
				var info = getAudioInfo.apply(audio);
				target.wrapInner('<a onclick="return false;" href="' + info.src + '"/>');
			}
		}
	}).mouseout(function(e) {
		if (e.target == getFlash()) {
			return e.target.release();
		}
	});

	$(document).mousedown(function(e) {
		if (e.which != 1 || e.target !== getFlash() || !e.target.captured) {
			var flash = getFlash();
			return flash && flash.release();
		}

		// download captured audio
		var flash = e.target;
		if (flash.ext_download) {
			var info = getAudioInfo.apply(flash.captured);
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
			  src: 'http://cs957.vkontakte.ru/u2822701/3f9d8c3ca83647.zip',
			  width: 0,
			  height: 0,
			  style: 'outline-style: none; position: absolute; z-index: 100',
			  allowscriptaccess: 'always',
			  allownetworking: 'all',
			  wmode: "opaque" },
			{ version: 8 },
			undefined,
			$.noop
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
			$(this).offset({top: -500, left: 0});
		};

		return flash;
	};
	getFlash();
});

