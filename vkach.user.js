// ==UserScript==
// @name          vkach
// @namespace     https://github.com/dizel3d/
// @description   vkach
// @include http://vkontakte.ru/*
// @include http://vk.com/*
// ==/UserScript==

(function() {
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

	script_load("https://raw.github.com/dizel3d/vkach/build/vkach.js");
})();

