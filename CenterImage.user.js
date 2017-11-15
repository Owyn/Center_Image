// ==UserScript==
// @name          Center Image
// @namespace     CenterImage
// @author        Owyn
// @version       1.91
// @description   Centers images (directly opened with browser)(firefox-like) with hotkeys (to resize or scroll)
// @updateURL     https://greasyfork.org/scripts/110-center-image/code/Center%20Image.user.js
// @downloadURL   https://greasyfork.org/scripts/110-center-image/code/Center%20Image.user.js
// @homepage      https://greasyfork.org/scripts/110-center-image
// @run-at        document-end
// @noframes
// @grant         GM.getValue
// @grant         GM.setValue
// @grant         GM_registerMenuCommand
// @match         http://*/*
// @match         https://*/*
// @match         file://*/*
// ==/UserScript==

if (typeof GM_registerMenuCommand !== "undefined")
{
	GM_registerMenuCommand("Center Image Configuration", cfg, "n");
}

var images = document.images;
if (!images || images.length !== 1 || images[0].src !== location.href) 
{
	return false;
}

var rescaled = false;
var iot = 0, iol = 0;
var i = images[0];

var FireFox = ((navigator.userAgent.indexOf('Firefox') != -1) ? true : false);

function makeimage()
{
	if(cfg_bgclr)
	{
		document.body.bgColor = cfg_bgclr;
		if(document.head){document.head.innerHTML = "";} // remove FireFox background
	}
	document.body.innerHTML = "<style>img { position: absolute; top: 0; right: 0; bottom: 0; left: 0; }</style>"; // center image
	i.style = ""; // chrome has lots of crap there
	document.body.style = "";
	i.style.margin = "auto"; // center image
	document.body.style.margin = "0px";
	document.body.appendChild(i);
	i.addEventListener("mousedown", onmousedown, true);
	i.addEventListener("click", rescale, true);
	window.addEventListener("keydown", onkeydown, true);
	window.addEventListener("resize", onresize, true);
	autoresize();
}

function onresize()
{
	if(rescaled)
	{
		rescaled = false;
		rescale();
	}
}

function changecursor()
{
	i.style.margin = "auto";
	if(!rescaled && (((i.naturalHeight / window.devicePixelRatio).toFixed() == window.innerHeight && (i.naturalWidth / window.devicePixelRatio).toFixed() <= window.innerWidth) || ((i.naturalHeight / window.devicePixelRatio).toFixed() <= window.innerHeight && (i.naturalWidth / window.devicePixelRatio).toFixed() == window.innerWidth))) // one img dimension is equal to screen and other is the same or less than the screen
	{
		i.style.cursor = "";
	}
	else if((i.naturalHeight / window.devicePixelRatio).toFixed() > window.innerHeight || (i.naturalWidth / window.devicePixelRatio).toFixed() > window.innerWidth) // at least one img dimenion is bigger than the screen
	{
		if(rescaled)
		{
			i.style.cursor = "-moz-zoom-in";
			i.style.cursor = "-webkit-zoom-in";
		}
		else
		{
			i.style.cursor = "-moz-zoom-out";
			i.style.cursor = "-webkit-zoom-out";
			if((i.naturalHeight / window.devicePixelRatio).toFixed() > window.innerHeight) // image pushing out-of-screen fix
			{
				i.style.margin = "0px auto";
			}
		}
	}
	else
	{
		if(rescaled)
		{
			i.style.cursor = "-moz-zoom-out";
			i.style.cursor = "-webkit-zoom-out";
		}
		else
		{
			i.style.cursor = "-moz-zoom-in";
			i.style.cursor = "-webkit-zoom-in";
		}
	}
}

function onmousedown(event)
{
	if(i.offsetLeft > 0){iol = i.offsetLeft;}
	if(i.offsetTop > 0){iot = i.offsetTop;}
}

function rescale(event)
{
	if(rescaled)
	{
		rescaled = false;
		var scale;
		if(event)
		{
			if (typeof event.y === "undefined") // Firefox
			{
				ex = event.clientX;
				ey = event.clientY;
			}
			else
			{
				ex = event.x;
				ey = event.y;
			}
			ex -= iol;
			ey -= iot;
			scale = Math.min((window.innerWidth / (i.naturalWidth / window.devicePixelRatio).toFixed()), (window.innerHeight / (i.naturalHeight / window.devicePixelRatio).toFixed()));
		}
		i.removeAttribute("width");
		i.removeAttribute("height");
		i.style.width = (i.naturalWidth / window.devicePixelRatio).toFixed() + "px";
		i.style.height = (i.naturalHeight / window.devicePixelRatio).toFixed() + "px";
		changecursor();
		if(event)
		{
			window.scrollTo(ex / scale - window.innerWidth / 2, ey / scale - window.innerHeight / 2);
		}
	}
	else
	{
		i.removeAttribute("width");
		i.removeAttribute("height");
		i.style.width = (i.naturalWidth / window.devicePixelRatio).toFixed() + "px";
		i.style.height = (i.naturalHeight / window.devicePixelRatio).toFixed() + "px";
		if((i.naturalWidth / window.devicePixelRatio).toFixed() != window.innerWidth)
		{
			i.style.width = window.innerWidth + "px";
			i.style.height = "";
			rescaled = true;
		}
		
		if((i.height > window.innerHeight) || (i.width > window.innerWidth))
		{
			i.style.width = (i.naturalWidth / window.devicePixelRatio).toFixed() + "px";
			i.style.height = (i.naturalHeight / window.devicePixelRatio).toFixed() + "px";
			if((i.naturalHeight / window.devicePixelRatio).toFixed() != window.innerHeight)
			{
				i.style.height = window.innerHeight + "px";
				i.style.width = "";
				rescaled = true;
			}
		}
		changecursor();
	}
}

function autoresize()
{
	if(!document.head) // old fix for old chrome - let it be
	{
		document.lastChild.insertBefore(document.createElement("head"), document.body);
	}
	var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = i.src;
	document.head.appendChild(link); // favicon
	var title = i.src.substr(i.src.lastIndexOf("/")+1);
	if(title.indexOf("?") != -1)
	{
		title = title.substr(0, title.indexOf("?"));
	}
	document.title = title + " (" + i.naturalWidth + "x" + i.naturalHeight + ")"; // title
	
	rescaled = true;rescale(0); // to original size in pixels
	if(cfg_fitWH && i.height > window.innerHeight && i.width > window.innerWidth) // both scrollbars
	{
		rescale(0);
	}
	else if(cfg_fitB && (i.height > window.innerHeight || i.width > window.innerWidth)) // one scrollbar
	{
		rescale(0);
	}
	else if(cfg_fitS && i.height <= window.innerHeight && i.width <= window.innerWidth) // no scrollbars
	{
		rescale(0);
	}
	if(cfg_js){eval(cfg_js);}
}

// hotkeys
if (typeof KeyEvent === "undefined")
{
	var KeyEvent = {
		DOM_VK_SPACE: 32,
		DOM_VK_LEFT: 37,
		DOM_VK_UP: 38,
		DOM_VK_RIGHT: 39,
		DOM_VK_DOWN: 40,
		DOM_VK_A: 65,
		DOM_VK_D: 68,
		DOM_VK_P: 80,
		DOM_VK_Q: 81,
		DOM_VK_S: 83,
		DOM_VK_W: 87,
		DOM_VK_NUMPAD2: 98,
		DOM_VK_NUMPAD4: 100,
		DOM_VK_NUMPAD5: 101,
		DOM_VK_NUMPAD6: 102,
		DOM_VK_NUMPAD8: 104
	};
}

function cancelEvent(a)
{
	a = a ? a : window.event;
	if (a.stopPropagation)
	{
		a.stopPropagation();
	}
	if (a.preventDefault)
	{
		a.preventDefault();
	}
	a.cancelBubble = true;
	a.cancel = true;
	a.returnValue = false;
	return false;
}

function scroll_space(a, b)
{
	var by = Math.round((b ? window.innerHeight : window.innerWidth) * 0.50 * (a ? -1 : 1));
	if(!b)
	{
		window.scrollBy(0, by);
	}
	else
	{
		window.scrollBy(by, 0);
	}
}

function onkeydown (b)
{
	var a = (window.event) ? b.keyCode : b.which;
	
	if (a != KeyEvent.DOM_VK_SPACE && (b.altKey || b.ctrlKey || b.metaKey))
	{
		return;
	}
	
	var by = Math.round(window.innerHeight * 0.10);
	
	switch (a)
	{
	case KeyEvent.DOM_VK_RIGHT:
	case KeyEvent.DOM_VK_D:
	case KeyEvent.DOM_VK_NUMPAD6:
		window.scrollBy(by, 0);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_LEFT:
	case KeyEvent.DOM_VK_A:
	case KeyEvent.DOM_VK_NUMPAD4:
		window.scrollBy(by * -1, 0);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_W:
	case KeyEvent.DOM_VK_NUMPAD8:
		window.scrollBy(0, by * -1);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_S:
	case KeyEvent.DOM_VK_NUMPAD2:
		window.scrollBy(0, by);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_SPACE:
		scroll_space(b.shiftKey, b.ctrlKey);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_Q:
	case KeyEvent.DOM_VK_NUMPAD5:
		rescale(0);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_P:
		cfg();
		cancelEvent(b);
	}
}

var cfg_bgclr;
var cfg_fitWH;
var cfg_fitB;
var cfg_fitS;
var cfg_js;

async function loadCfg()
{
	if (typeof GM.getValue !== "undefined")
	{
		cfg_bgclr = await GM.getValue("bgColor", "grey");
		cfg_fitWH = await GM.getValue("fitWH", true);
		cfg_fitB = await GM.getValue("fitB", false);
		cfg_fitS = await GM.getValue("fitS", true);
		cfg_js = await GM.getValue("js");
	}
	makeimage();
}
loadCfg();

function $(id) {return document.getElementById(id);}

function cfg()
{
	if (typeof GM.setValue !== "undefined")
	{
		function saveCfg()
		{
			GM.setValue("bgColor", $("ci_cfg_2_bgclr").value);
			GM.setValue("fitWH", $("ci_cfg_3_fitWH").checked);
			GM.setValue("fitB", $("ci_cfg_4_fitB").checked);
			GM.setValue("fitS", $("ci_cfg_5_fitS").checked);
			GM.setValue("js", $("ci_cfg_6_js").value);
			alert("Configuration Saved");
			if($("ci_cfg_2_bgclr").value){document.body.bgColor = $("ci_cfg_2_bgclr").value;}else{document.body.removeAttribute("bgColor");}
		}
		if(i){i.removeEventListener("click", rescale, true);}
		window.removeEventListener("keydown", onkeydown, true);
		if(document.head){document.head.innerHTML = "";}
		document.body.innerHTML = "";
		var div = document.createElement("div");
		div.style.margin = "11% auto";
		div.style.width = "444px";
		div.style.border = "solid 1px black";
		div.style.background = "silver";
		div.innerHTML = "<b><center>Configuration</center></b>"
		+ "<br><input id='ci_cfg_2_bgclr' type='text' size='6'> Background color (empty = default)"
		+ "<br><br>Fit to window images:"
		+ "<br><br><input id='ci_cfg_3_fitWH' type='checkbox'> Larger than window both vertically and horizontally"
		+ "<br><br><input id='ci_cfg_4_fitB' type='checkbox'> Larger than window either vertically or horizontally"
		+ "<br><br><input id='ci_cfg_5_fitS' type='checkbox'> Smaller than window"
		+ "<br><br><center>Custom JS Action:<textarea id='ci_cfg_6_js' style='margin: 0px; width: 400px; height: 50px;'></textarea>"
		+ "<br><input id='ci_cfg_save' type='button' value='Save configuration'></center>";
		document.body.appendChild(div);
		$("ci_cfg_2_bgclr").value = cfg_bgclr;
		$("ci_cfg_3_fitWH").checked = cfg_fitWH;
		$("ci_cfg_4_fitB").checked = cfg_fitB;
		$("ci_cfg_5_fitS").checked = cfg_fitS;
		$("ci_cfg_6_js").value = cfg_js;
		$("ci_cfg_save").addEventListener("click", saveCfg, true);
	}
	else
	{
		alert("Sorry, Chrome userscripts in native mode can't have configurations! Install TamperMonkey (Beta) extension. (it's very good)");
	}
}
