// ==UserScript==
// @name          vkach
// @namespace     https://github.com/dizel3d/
// @description   vkontakte.ru content downloader
// @include http://vkontakte.ru/*
// @include http://vk.com/*
// ==/UserScript==

(function() {
	// for browsers without @include directive supporting
	if (!document.location.hostname.match("^(vkontakte\.ru|vk\.com)$")) {
		return;
	}

	/**
	 * Function for injection of javascript file to the document.
	 * @param src script source
	 */
	var script_load = function(src) {
		if (!document || !document.head) {
			return setTimeout(function(){script_load(src)}, 1);
		}
		var elem = document.createElement("script");
		elem.setAttribute("src", src);
		elem.setAttribute("type", "text/javascript");
		document.head.appendChild(elem);
	}

	// loading scripts
	script_load((window.GM_getValue && GM_getValue("path") || "https://raw.github.com/dizel3d/vkach/build") + "/vkach.js");

	// GM command to apply the new configuration
	window.GM_registerMenuCommand && GM_registerMenuCommand("Apply", function() {
		// get new configuration
		var elem = document.getElementById("post_field");
		if (!elem) {
			alert("There is no configuration");
			return;
		}
		var config = elem.value;

		// this fucntion sets GM variable
		var setValue = function(key, value) {
			if (!value.length) {
				return GM_deleteValue(key);
			}
			GM_setValue(key, value);
		}

		setValue("path", config);
		location.reload();
	});
})();

