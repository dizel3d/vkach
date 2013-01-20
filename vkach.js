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
			load("http://code.jquery.com/jquery-1.8.3.min.js");
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
		var artist = $(this).find('.info b:eq(0) a:first').html();
		var title = $(this).find('.info .title').html() || $(this).find('.info [id^="title"]').html();
		var src = $(this).find('input:first').attr('value').split(',')[0];

		return {
			src: src,
			artist: toFilename(artist),
			title: toFilename(title)
		};
	};

	// info message
	$('#left_blocks').before('<div style="background-color: rgb(62, 93, 129); margin: 0px 8px 10px 0px;'
		+ 'color: rgb(255, 255, 255); padding: 5px; text-align: center;">'
		+ 'Работоспособность плагина vk4 восстановлена. Скачивание в Google Chrome происходит путем перетаскивания кнопки воспроизведения аудиозаписи.<br/>'
		+ 'Подробности на <a style="color: rgb(255, 255, 255)"'
		+ 'href="http://userscripts.org/scripts/show/117252">userscripts.org</a>.<br/>'
		+ '<a style="color: rgb(255, 255, 255)"'
		+ 'onclick="$(this).parent().hide(\'slow\');return false">Скрыть уведомление</a>.</div>');

	// apply dragout files feature if the browser is Google Chrome
	if (/chrome/.test(navigator.userAgent.toLowerCase()))
	{
		$(document).delegate('.play_new', 'mouseover', function() {
			if ($(this).attr('draggable')) {
				return;
			}
			$(this).attr('draggable', 'true');

			var audio = $(this).closest('.audio');
			var area = $(audio).children('.area');
			var children = $(audio).children();
			var clone;
			var cloneAudio = function() {
				clone = audio.clone();
				clone.children().remove();
				return clone;
			};

			console.log('1');
			audio.replaceWith(cloneAudio().append(children));

			$(this)
			.mouseenter(function() {
				console.log('1');
				audio.replaceWith(cloneAudio().append(children));
			})
			.mouseleave(function() {
				console.log('2');
				clone.replaceWith(audio.append(children));
			});

			$(this).bind('dragstart', function() {
				console.log('3');
				var info = getAudioInfo.apply($(this).closest('.audio'));
				event.dataTransfer.setData('DownloadURL', 'audio/mpeg:'
					+ info.artist + ' - ' + info.title + '.mp3:' + info.src);
			})
			.bind('dragend', function() {
				console.log('4');
				area.css('background-color', '#f7f7f7');
			});
		});
		return;
	}

	// overload style class .duration
	$(document.head).append('<style>.duration {cursor: default;}</style>');

	var captured_audio = undefined;
	var capture_audio = function(audio)
	{
		// capture new audio
		if (captured_audio === audio)
		{
			return;
		}
		release_audio();
		captured_audio = audio;

		var button_width = 25;
		var button_height = 15;
		var button_padding = ($(captured_audio).height() - button_height) / 2;
		var title_wrap = $(captured_audio).find('.info .title_wrap');
		title_wrap.css('width', title_wrap.width() - button_width);
		return $('<div style="width: 100%; height: 100%;">')
			.click(function() { return false; })
			.mousedown(function(e) {
				if (e.which != 1 || e.target !== getFlash() || !e.target.captured) {
					return false;
				}

				// download captured audio
				var flash = e.target;
				if (flash.ext_download) {
					var info = getAudioInfo.apply(flash.captured);
					console.log(info.src)
					flash.ext_download(info.src, info.artist + ' - ' + info.title + '.mp3');

					// restore old output HTML-element and capture new
					if (flash.output) {
						$(flash.output.elem).html(flash.output.html);
					}
					var elem = $(flash.captured).find('.duration').get(0);
					flash.output = {elem: elem, html: $(elem).html()};
				}
				return false;
			})
			.appendTo($('<div>')
				.attr('id', 'vkach_download_button')
				.css('width', button_width)
				.css('height', button_height)
				.css('float', 'left')
				.css('padding-top', button_padding)
				.css('padding-bottom', button_padding)
				.insertAfter(title_wrap));
	}
	var release_audio = function()
	{
		if (captured_audio)
		{
			var title_wrap = $(captured_audio).find('.info .title_wrap');
			title_wrap.css('width', '');
			$('#vkach_download_button').remove();
			captured_audio = undefined;
		}
	}

	$(document).mouseover(function(e) {
		var target = $(e.target);
		var audio = target.closest('.audio');
		if (audio.size()) {
			var region = capture_audio(audio.get(0));

			// capture audio
			var flash = getFlash();
			if (flash) {
				return flash.capture(audio.get(0), region);
			}

			// insert hyperlink once if Flash isn't supported
			if (!(region.find('a').size())) {
				var info = getAudioInfo.apply(audio);
				region.wrapInner('<a onclick="return false;" href="' + info.src + '"/>');
			}
		}
		else {
			release_audio();

			var flash = getFlash();
			if (flash && e.target !== flash && flash.captured) {
				flash.release();
			}
		}
	});

	var _flashMovie = true;
	var getFlash = function() {
		// return Flash movie if it was created
		if (_flashMovie !== true) {
			return _flashMovie;
		}

		// disable flash for Google Chrome users
		if (/chrome/.test(navigator.userAgent.toLowerCase()))
		{
			_flashMovie = undefined;
			return;
		}

		// try to add Flash movie to vkach-panel
		var panel = $('<div style="width: 100%; height: 100%;">')
		.flash(
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
		var flash = panel.find('#vkachflash').get(0);
		_flashMovie = flash;
		if (!flash) {
			return;
		}

		// default flash movie place
		var nobody = $('<div>').css('position', 'absolute').css('top', -500).appendTo(document.body);
		$(panel).appendTo(nobody);

		// add additional functional to the Flash movie
		flash.capture = function(target, region) {
			if (this.captured === target) {
				return;
			}
			this.captured = target;

			$(this).attr('width', $(region).outerWidth());
			$(this).attr('height', $(region).outerHeight());
			$(panel).appendTo(region);
		};
		flash.release = function() {
			this.captured = null;
			$(panel).appendTo(nobody);
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

