// ==UserScript==
// @name          vkach.dev
// @namespace     https://github.com/dizel3d/
// @description   Development version of userscript
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

	// GM command to apply the new configuration
	GM_registerMenuCommand("Apply", function() {
		// get new configuration
		var elem = document.getElementById("post_field");
		if (elem === undefined) {
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

	// loading scripts
	var path = GM_getValue("path");
	if (path === undefined) {
		path = "https://raw.github.com/dizel3d/vkach/build";
	}
	script_load(path + "/vkach.js");
})();

