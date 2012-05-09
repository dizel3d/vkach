// Copyright (C) Valentin Sarychev <dizel3d@gmail.com>, 2011

// pre-installation
;(function(callback) {
	var loading = {src: undefined, timeout: 0};
	var load = function(src) {
		if (loading.src !== src) {
			loading = {src: src, timeout: 0};
			var elem = document.createElement("script");
			elem.setAttribute("src", src);
			elem.setAttribute("type", "text/javascript");
			document.head.appendChild(elem);
		}
	}
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
		return setTimeout(wait, Math.min(1000, ++loading.timeout));
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

	// apply dragout files feature if the browser is Google Chrome
	if (/chrome/.test(navigator.userAgent.toLowerCase()))
	{
		// info message
		$('#left_blocks').before('<div style="background-color: rgb(62, 93, 129); margin: 0px 8px 10px 0px;'
			+ 'color: rgb(255, 255, 255); padding: 5px; text-align: center;">'
			+ 'Интерфейс vk4 изменен для пользователей Google Chrome. '
			+ 'Теперь закачивать музыку можно перетаскиванием треков со страницы.<br/>'
			+ 'Подробности на <a style="color: rgb(255, 255, 255)"'
			+ 'href="http://userscripts.org/scripts/show/117252">userscripts.org</a>.<br/>'
			+ '<a style="color: rgb(255, 255, 255)"'
			+ 'onclick="$(this).parent().hide(\'slow\');return false">Скрыть уведомление</a>.</div>');

		$(document).delegate('.audio', 'mouseover', function() {
			if ($(this).attr('draggable')) {
				return;
			}
			$(this).css('background-color', '#ffffff');
			$(this).attr('draggable', 'true');
			$(this).bind('dragstart', function() {
				var info = getAudioInfo.apply(this);
				event.dataTransfer.setData('DownloadURL', 'audio/mpeg:'
					+ info.artist + ' - ' + info.title + '.mp3:' + info.src);
			});
			$(this).bind('dragend', function() {
				$(this).css('background-color', '#f7f7f7');
			});
		});
		return;
	}

	// overload style class .duration
	$(document.head).append('<style>.duration {cursor: default;}</style>');

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
		else {
			var flash = getFlash();
			if (flash && e.target !== flash && flash.captured) {
				flash.release();
			}
		}
	});

	$(document).mousedown(function(e) {
		if (e.which != 1 || e.target !== getFlash() || !e.target.captured) {
			return;
		}

		// download captured audio
		var flash = e.target;
		if (flash.ext_download) {
			var info = getAudioInfo.apply(flash.captured);
			flash.ext_download(info.src, info.artist + ' - ' + info.title + '.mp3');

			// restore old output HTML-element and capture new
			if (flash.output) {
				$(flash.output.elem).html(flash.output.html);
			}
			var elem = $(flash.captured).find('.duration').get(0);
			flash.output = {elem: elem, html: $(elem).html()};
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
			  src: 'http://cs957.vkontakte.ru/u2822701/e04129806922cf.zip',
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
		window.vkachflash_output = function(percent) { // used in Flash movie
			if (flash.output) {
				if (!flash.output.enabled) {
					if (percent === "enable") {
						flash.output.enabled = true;
					}
					return;
				}
				if (percent === undefined) {
					$(flash.output.elem).html('&nbsp;&nbsp;OK');
					flash.output = undefined;
				}
				else if (percent === null) {
					$(flash.output.elem).html('FAIL');
					flash.output = undefined;
				}
				else {
					var s = parseInt(percent) + '%';
					$(flash.output.elem).html((new Array(Math.max(1, 5 - s.length))).join('&nbsp;') + s);
				}
			}
		}

		return flash;
	};
	getFlash();
});

