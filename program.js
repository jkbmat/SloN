// povinne premenne
var enableDebug = false;

var _posun = 1;
var _fpsLimit = 35;
var _drawFps = 40;
var _scale = 1;
var _cleanDraw = true;

var _plocha_width = 600;
var _plocha_height = 400;

var _plocha_px_width = _plocha_width * _posun;
var _plocha_px_height = _plocha_height * _posun;

var _okno_width = _plocha_width;
var _okno_height = _plocha_height;

var _kamera_x = 0;
var _kamera_y = 0;

var _okno_px_width = _okno_width * _posun;
var _okno_px_height = _okno_height * _posun;

var _PovoleneEfekty = {'flash': true, 'earthquake': true, 'sound': true, 'overlay': true};

var _pauseKey = 27;
var _paused = 0;

var _Background;


// funkcie

function init()
{
	document.getElementsByTagName("h1")[0].innerHTML = "Title";
	
	plocha = document.getElementById('plocha');
	plocha.width = _plocha_px_width;
	plocha.height = _plocha_px_height;
	plocha.style.width = '100%';
	plocha.style.height = '100%';
	plocha.style.marginBottom = "-15px";
	plocha.style.margin = "auto";
	plocha.style.position = 'relative';
	plocha.style.border = '1px solid grey';
	
	ctx = plocha.getContext('2d');
	
	overlayer = document.getElementById('overlayer'); // canvas for overlay effect
	overlayer.width = 0;
	overlayer.height = 0;
	overlayer.style.display = "none";
	octx = overlayer.getContext('2d');
	
	var okno = document.getElementById("okno");
	okno.style.position = 'relative';
	okno.style.width = _plocha_px_width + "px";
	okno.style.height = _plocha_px_height + "px";
	
	debug = document.createElement('div');
	debug.style.width = '500 px';
	debug.style.height = '200 px';
	debug.style.overflow = "auto";
	okno.appendChild(debug);
	
	plocha = document.getElementById('plocha');
	
	_plocha_left = _plocha_top = 0;
	
	do {
		_plocha_left += plocha.offsetLeft;
		_plocha_top += plocha.offsetTop;
	} while (plocha = plocha.offsetParent)

	plocha = document.getElementById('plocha');
	
	drawloop();
	novaHra();
}

function pause(bool)
{
	if(bool && _paused !== 0) // zapauzuj
	{
	}
	else if(_paused == true) // odpauzuj
	{
	}
}

function novaHra()
{
	if(_paused)
	{
		return 0;
	}
	_allObjects = new Array;
		
	_paused = false;
	
	_Key['code'] = new Array;
	_Key['up'] = new Array;
	_Key['last'] = 0;
					
	mainInterval = setInterval('main();', 1000/_fpsLimit);
}