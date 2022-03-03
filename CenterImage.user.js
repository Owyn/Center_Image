// ==UserScript==
// @name          Center Image
// @namespace     CenterImage
// @author        Owyn
// @version       1.98
// @description   Improved controls for images directly opened with your browser - hotkeys & resizing & visuals
// @updateURL     https://github.com/Owyn/Center_Image/raw/master/CenterImage.user.js
// @downloadURL   https://github.com/Owyn/Center_Image/raw/master/CenterImage.user.js
// @supportURL    https://github.com/Owyn/Center_Image/issues
// @homepage      https://github.com/Owyn/Center_Image
// @run-at        document-end
// @noframes
// @grant         GM.getValue
// @grant         GM.setValue
// @grant         GM_registerMenuCommand
// @match         http://*/*
// @match         https://*/*
// @match         file:///*/*
// ==/UserScript==

"use strict";

var images = document.images;
if (!images || images.length !== 1 || images[0].src !== location.href  || document.images[0].getAttribute("src") === "") 
{
	return false;
}

if (typeof GM_registerMenuCommand !== "undefined")
{
	GM_registerMenuCommand("Center Image Configuration", cfg, "n");
}

var rescaled = 0;
var iot = 0, iol = 0;
var i = images[0];

var theStyle;
function makeimage()
{
	if(typeof cfg_js !== "string") {setTimeout(function() { makeimage(); }, 11); return false;} // lets wait for async
	if(cfg_bgclr)
	{
		document.body.bgColor = cfg_bgclr;
		if(document.head){document.head.innerHTML = "";} // remove FireFox background
	}
	document.body.innerHTML = "<style id=img_style>img { position: absolute; top: 0; right: 0; bottom: 0; left: 0; background-color: "+cfg_bgclr+" !important}</style>"; // center image & change loading image color from white in Chrome
	theStyle = document.body.querySelector("#img_style");
	i.style = ""; // chrome has lots of crap there
	document.body.style = "";
	theStyle.sheet.rules[0].style.margin = "auto"; // center image
	document.body.style.margin = "0px";
	document.body.appendChild(i);
	i.addEventListener("mousedown", onmousedown, true);
	i.addEventListener("click", rescale, true);
	i.addEventListener("auxclick", rescale, true);
	window.addEventListener("keydown", onkeydown, true);
	window.addEventListener("scroll", onscroll, false);
	window.addEventListener("resize", onresize, true);
	onVisibilityChange();
}

function onVisibilityChange()
{
	if (document.visibilityState === 'visible')
	{
		if(i)
		{
			autoresize();
			document.removeEventListener('visibilitychange', onVisibilityChange);
		}
	}
}
document.addEventListener("visibilitychange", onVisibilityChange);

var scrolledY, scrolledX;
function onscroll()
{
	scrolledY = window.pageYOffset;
	scrolledX = window.pageXOffset;
}

var FireFox = ((navigator.userAgent.indexOf('Firefox') != -1) ? true : false);
function onresize() // doesn't let image change back to "fit to window" in chrome & in both helps keep scroll progress
{
	if(rescaled != 1)
	{
		let wasFilled = (rescaled === 2 ? true : false);
		rescaled = 1;
		let chromeplsstopX, chromeplsstopY;
		if(!FireFox){ chromeplsstopX = window.pageXOffset; chromeplsstopY = window.pageYOffset;}
		rescale(null, wasFilled);
		if(!FireFox){ window.scrollTo(chromeplsstopX,chromeplsstopY);}
	}
}

function changeCursor()
{
	//i.style.margin = "auto";
	if(rescaled === 0) // original
	{
		if(orgImgWidth == window.innerWidth || orgImgHeight == window.innerHeight) // perfect fit, can't resize
		{
			i.style.cursor = "";
		}
		else if (orgImgWidth > window.innerWidth || orgImgHeight > window.innerHeight)
		{
			i.style.cursor = "zoom-out";
		}
		else
		{
			i.style.cursor = "zoom-in";
		}
	}
	else if(rescaled === 2) // fill
	{
		if(orgImgWidth == window.innerWidth && orgImgHeight == window.innerHeight) // perfect fit, can't resize
		{
			i.style.cursor = "";
		}
		else if (orgImgWidth > i.width)
		{
			i.style.cursor = "zoom-in";
		}
		else
		{
			i.style.cursor = "zoom-out";
		}
	}
	else // if(rescaled === 1) // fit
	{
		if(orgImgWidth == window.innerWidth || orgImgHeight == window.innerHeight) // perfect fit, can't resize
		{
			i.style.cursor = "";
		}
		else if (orgImgWidth > i.width)
		{
			i.style.cursor = "zoom-in";
		}
		else
		{
			i.style.cursor = "zoom-out";
		}
	}

	if(i.height > window.innerHeight) // image pushing out-of-screen browser bug fix
	{
		theStyle.sheet.rules[0].style.margin = "0px auto";
	}
	else
	{
		theStyle.sheet.rules[0].style.margin = "auto";
	}
	i.style.margin = ""; // chrome pls stop
}

function onmousedown()
{
	if(i.offsetLeft > 0){iol = i.offsetLeft;}
	if(i.offsetTop > 0){iot = i.offsetTop;}

	if(event.which === 2) // middle mouse Chrome fix
	{
		event.preventDefault();
		event.stopPropagation();
		return;
	}
}

function rescale(event, fill)
{
	let ex,ey;
	if(event) // mouse click
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
		if(event.which === 2) // middle mouse
		{
			fill = true;
		}
		else if(event.which === 3) // right mouse
		{
			return;
		}
		event.preventDefault();
		event.stopPropagation();
	}

	document.body.style.overflowX = '';
	document.body.style.overflowY = '';

	let scrollMax_Y = window.scrollMaxY || ((document.body.scrollHeight || document.documentElement.scrollHeight)- document.documentElement.clientHeight);
	let scrollMax_X = window.scrollMaxX || ((document.body.scrollWidth || document.documentElement.scrollWidth)- document.documentElement.clientWidth);

	let scrollProgressY = scrolledY / scrollMax_Y;
	let scrollProgressX = scrolledX / scrollMax_X;

	let unFilling = false;

	let sidesCMP;
	if(fill)
	{
		if(rescaled === 2) // to original
		{
			rescaled = 0;
			theStyle.sheet.rules[0].style.width = orgImgWidth + "px";
			theStyle.sheet.rules[0].style.height = orgImgHeight + "px";
		}
		else // fill
		{
			sidesCMP = (orgImgWidth / orgImgHeight) < (window.innerWidth / window.innerHeight);
			rescaled = 2;
		}
	}
	else
	{
		if(rescaled != 0) // to original
		{
			if(rescaled === 2) {unFilling = true;}
			rescaled = 0;
			theStyle.sheet.rules[0].style.width = orgImgWidth + "px";
			theStyle.sheet.rules[0].style.height = orgImgHeight + "px";
		}
		else // fit
		{
			sidesCMP = (orgImgWidth / orgImgHeight) > (window.innerWidth / window.innerHeight);
			rescaled = 1;
		}
	}

	if(rescaled != 0)
	{
		if(sidesCMP)
		{
			theStyle.sheet.rules[0].style.width = "100%";
			theStyle.sheet.rules[0].style.height = "auto";
			document.body.style.overflowX = 'hidden'; // we don't need unscrollable scrollbars if they appear
		}
		else
		{
			theStyle.sheet.rules[0].style.height = "100%";
			theStyle.sheet.rules[0].style.width = "auto";
			document.body.style.overflowY = 'hidden'; // we don't need unscrollable scrollbars if they appear
		}
	}

	changeCursor();

	if(event && (!unFilling && (!fill || (fill && (scrollMax_Y <= 0 && scrollMax_X <= 0))))) // left mouse click (fill-click with no scrollbars and not left click after middle click - else preserve scroll percentage)
	{
		let scale = Math.min((window.innerWidth / i.width), (window.innerHeight / i.height));
		window.scrollTo((ex / scale) - (window.innerWidth / 2), (ey / scale) - (window.innerHeight / 2));
	}
	else // keep percentage scroll progress for KB hotkeys
	{
		
		scrollMax_Y = window.scrollMaxY || ((document.body.scrollHeight || document.documentElement.scrollHeight)- document.documentElement.clientHeight);
		scrollMax_X = window.scrollMaxX || ((document.body.scrollWidth || document.documentElement.scrollWidth)- document.documentElement.clientWidth);

		window.scrollTo(Math.round(scrollProgressX * scrollMax_X), Math.round(scrollProgressY * scrollMax_Y));

		scrolledY = window.pageYOffset;
		scrolledX = window.pageXOffset;
	}
}

var orgImgWidth;
var orgImgHeight;

function autoresize()
{
	if(!document.head) // old fix for old chrome - let it be
	{
		document.lastChild.insertBefore(document.createElement("head"), document.body);
	}
	/*var link = document.createElement('link');
	link.type = 'image/x-icon';
	link.rel = 'shortcut icon';
	link.href = i.src;
	document.head.appendChild(link);*/ // favicon
	if(FireFox) // chrome already does ~this
	{
		var title = i.src.substr(i.src.lastIndexOf("/")+1);
		if(title.indexOf("?") != -1)
		{
			title = title.substr(0, title.indexOf("?"));
		}
		document.title = title + " (" + i.naturalWidth + "x" + i.naturalHeight + ")"; // title
	}
	
	orgImgWidth = Math.round(i.naturalWidth / window.devicePixelRatio);
	orgImgHeight = Math.round(i.naturalHeight / window.devicePixelRatio);

	let InitRescale = false; // directly opened image is already fit to window if it is bigger by the browser
	if(cfg_fitWH && orgImgHeight > window.innerHeight && orgImgWidth > window.innerWidth) // both scrollbars
	{
		InitRescale = false;
	}
	else if(cfg_fitB && (orgImgHeight > window.innerHeight || orgImgWidth > window.innerWidth)) // one scrollbar
	{
		InitRescale = false;
	}
	else if(cfg_fitS && orgImgHeight <= window.innerHeight && orgImgWidth <= window.innerWidth) // no scrollbars
	{
		InitRescale = true;
	}
	else
	{
		theStyle.sheet.rules[0].style.width = orgImgWidth + "px";
		theStyle.sheet.rules[0].style.height = orgImgHeight + "px";
	}
	if(InitRescale)
	{
		rescale(null, cfg_fill ? true : false);
	}
	else
	{
		changeCursor();
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
		DOM_VK_NUMPAD8: 104,
		DOM_VK_F5: 116,
		DOM_VK_TAB: 9,
		DOM_VK_ENTER: 13
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
	case KeyEvent.DOM_VK_TAB:
	case KeyEvent.DOM_VK_ENTER:
		rescale(null, true);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_Q:
	case KeyEvent.DOM_VK_NUMPAD5:
		rescale(null, false);
		cancelEvent(b);
		break;
	case KeyEvent.DOM_VK_P:
		cfg();
		cancelEvent(b);
	}
}

var cfg_bgclr = "grey";
var cfg_fitWH = true;
var cfg_fitB = false;
var cfg_fitS = true;
var cfg_fill = false;
var cfg_js;

function cfg(){}

if (typeof GM !== "undefined" && typeof GM.getValue !== "undefined")
{
	async function loadCfg()
	{
			cfg_bgclr = await GM.getValue("bgColor", "grey");
			cfg_fitWH = await GM.getValue("fitWH", true);
			cfg_fitB = await GM.getValue("fitB", false);
			cfg_fitS = await GM.getValue("fitS", true);
			cfg_fill = await GM.getValue("fill", false);
			cfg_js = await GM.getValue("js", "");
		makeimage();
	}
	loadCfg();

	function $(id) {return document.getElementById(id);}

	cfg = function ()
	{
		function saveCfg()
		{
			GM.setValue("bgColor", $("ci_cfg_2_bgclr").value);
			GM.setValue("fitWH", $("ci_cfg_3_fitWH").checked);
			GM.setValue("fitB", $("ci_cfg_4_fitB").checked);
			GM.setValue("fitS", $("ci_cfg_5_fitS").checked);
			GM.setValue("fill", $("ci_cfg_7_fill").checked);
			GM.setValue("js", $("ci_cfg_6_js").value);
			alert("Configuration Saved");
			if($("ci_cfg_2_bgclr").value){document.body.bgColor = $("ci_cfg_2_bgclr").value;}else{document.body.removeAttribute("bgColor");}
		}
		if(i){
			i.removeEventListener("click", rescale, true);
			i.removeEventListener("auxclick", rescale, true);
			i.removeEventListener("mousedown", onmousedown, true);
		}
		window.removeEventListener("keydown", onkeydown, true);
		if(document.head){document.head.innerHTML = "";}
		document.body.innerHTML = "";
		var div = document.createElement("div");
		div.style.margin = "11% auto";
		div.style.width = "444px";
		div.style.border = "solid 1px black";
		div.style.color = "black";
		div.style.background = "silver";
		div.innerHTML = "<b><center>Configuration</center></b>"
		+ "<br><input id='ci_cfg_2_bgclr' type='text' size='6'> Background color (empty = default)"
		+ "<br><br>Fit to window images:" + " ( Fill to window instead <input id='ci_cfg_7_fill' type='checkbox'> )"
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
		$("ci_cfg_7_fill").checked = cfg_fill;
		$("ci_cfg_6_js").value = cfg_js;
		$("ci_cfg_save").addEventListener("click", saveCfg, true);
	}
}
else
{
	cfg_js = "";
	cfg = function ()
	{
		alert("Sorry, Chrome userscripts in native mode can't have configurations! You need to install TamperMonkey userscript manager extension. (it's very good)");
	}
	
}
