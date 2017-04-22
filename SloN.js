//***************************************************
//*                                                 *
//*             SloN engine v. 0.85                  *
//*                                                 *
//*       by Jakub Matuska, kexo007@gmail.com       *
//*                                                 *
//*                                                 *
//*        using BSD license (./license.txt)        *
//*                                                 *
//*                     (c)2010                     *
//*                                                 *
//***************************************************


_Key = new Array;
_Key['code'] = new Array;
_Key['up'] = new Array;
_Key['last'] = 0;
_Mouse = new Array;
_allObjects = new Array;
_allSounds = new Array;
_plocha_left = _plocha_top = 0;
_cursor = '';
_oldscale = 1;

// preload

var loadedImages = 0;
var loadedSounds = 0;
var loadedPercent = 0;
var Images = new Array;

function preloadF()
{
	_cursor = document.getElementById('plocha').style.cursor;
	
	if(preload_images.length == 0)
	{
		init();
		return 0;
	}
	
	for(var i = 0; i < preload_fonts.length; i++)
	{
		var node = document.createElement('span');
		node.style.fontFamily = preload_fonts[i];
		node.innerHTML = preload_fonts[i];
		node.style.position = 'absolute';
		node.style.visibility = 'hidden';
		document.body.insertBefore(node, document.getElementsByTagName('h1')[0].nextSibling);
	}
	
	var loadstatus = document.createElement('h2');
	loadstatus.id = "loadstatus";
	loadstatus.innerHTML = "0%";
	document.body.insertBefore(loadstatus, document.getElementsByTagName('h1')[0].nextSibling);
	for(i = 0; i < preload_images.length; i++)
	{
		Images[Images.length] = {'obj': '', 'name': preload_images[i][0]};
		Images[Images.length - 1]['obj'] = new Image();
		Images[Images.length - 1]['obj'].src = preload_images[i][1];
		Images[Images.length - 1]['obj'].addEventListener("load", function(){increasePreloadImg();}, false);
	}
}

function increasePreloadImg()
{
	var loadstatus = document.getElementById('loadstatus');
	loadedPercent = Math.min(loadedPercent + Math.floor(100 * preload_images[loadedImages][2] / preload_images_loadtotal), 100);
	
	loadstatus.innerHTML = loadedPercent + "%";

	loadedImages ++;
	if(loadedImages == preload_images.length)
	{
		loadstatus.innerHTML = "100%";
		setTimeout("document.getElementById('loadstatus').parentNode.removeChild(document.getElementById('loadstatus')); init();", 500);
	}
}

document.onkeydown = KeyDown;
document.onkeyup = KeyUp;
document.onmousedown = MouseDown;
document.onmouseup = MouseUp;
document.onmousemove = SaveMouse;

function KeyUp(e)
{
	if(typeof(_pauseKey) != 'undefined')
	{
		if(e.keyCode == _pauseKey && _paused == false)
		{
			pause(true);
		}
		else if(e.keyCode == _pauseKey)
		{
			pause(false);
		}
	}

	while(_Key['code'].indexOf(e.keyCode) >= 0)
		_Key['code'].splice(_Key['code'].indexOf(e.keyCode), 1);
		
	_Key['up'].push(e.keyCode);
}

function KeyDown(e)
{
	if(_Key['code'].indexOf(e.keyCode) == -1)
	{
		_Key['code'].push(e.keyCode);
		_Key['last'] = e.keyCode;
	}
}

function MouseUp()
{
	while(_Key['code'].indexOf(1000) >= 0)
		_Key['code'].splice(_Key['code'].indexOf(1000), 1);
				
	_Key['up'].push(1000);
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].mouseInside())
		{
			_allObjects[i].mouseUp();
		}
	}
}

function MouseDown()
{
	if(_Key['code'].indexOf(1000) == -1)
	{
		_Key['code'].push(1000);
		_Key['last'] = 1000;
	}
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].mouseInside())
		{
			_allObjects[i].mouseDown();
		}
	}
}
function SaveMouse(e)
{
	if(typeof(_plocha_left) != 'undefined')
	{
		_Mouse.x = Math.floor((e.pageX - _plocha_left) / _oldscale);
		_Mouse.y = Math.floor((e.pageY - _plocha_top) / _oldscale);
	}
}

function isDown(key)
{
	return _Key['code'].indexOf(key) + 1;
}

var object = Base.extend
({
	constructor: function(id)
	{
		this.id = id; // id
	
		this.x_speed = 0.0; // rychlosti
		this.y_speed = 0.0;
		this.x_speed_helper = 0.0;
		this.y_speed_helper = 0.0;

		this.boundsAction = {'top': 0, 'right': 0, 'bottom': 0, 'left': 0, 'run': ''}; // co sa stane pri prechode za okraj
					//		0: nic, chod aj za okraj
					//		1: prechod na druhu stranu obrazovky
					//		2: die()
					//		3: odrazenie
					//		4: nic, prjedi iba po okraj a ostan stat
		
		this.frame = "";
		
		this.centerPoint = [0, 0]; // center point used for animations; [0]: 0 - left, 1 - center, 2 - right [1]: 0 - top, 1 - center, 2 - bottom.
		this.rotCenter = [0, 0]; // center of rotation relative to the center of the object
		
		this.x = 0; // poloha
		this.y = 0;
	
		this.max_x = _okno_px_width; // okraje plochy
		this.max_y = _okno_px_height;
		this.min_x = 0;
		this.min_y = 0;
	
		this.scale_x = 1;
		this.scale_y = 1;
		
		this.visibility = 1; // 0 - neviditelny, 1 - normalny (posuva sa s kamerou), 2 - pripnuty (pinned)
		this.zindex = 1;
		
		this.alpha = 1;
		this.rotation = 0; // v stupnoch
		this.flip = 0; // 0 - do not flip, 1 - flip vertically, 2 - flip horizontally, 3 - flip both axes
		
		this.overlay = ['000000', 0];
		
		this.sliced = false; // Whether to draw only a slice of image. This is false when the image shouldn't be cut and [sx, sy, sWidth, sHeight] as in "slicing" part of https://developer.mozilla.org/en/Canvas_tutorial/Using_images if it should be cut
		
		this.cursor = 'default';

		this.pinned = false;
		
		this.events = new Array;
		this.frames = new Array;
		this.class = new Array;
		this.sounds = new Array;
		this.animations = new Array;
		this.runningAnim = "";

		_allObjects.push(this);	// zaregistruj objekt do pola vsetkych objektov
		sortAllObj();
	},
	registerSound: function(name, opts, dofinish)
	{
		autoload = typeof(autoload) == 'undefined' ? true : autoload;
		
		var date = new Date;
		do
		{
			objid = date.getTime() + "-" + random(0, 10000);
		} while (soundManager.getSoundById(objid))
		
		var id = this.getId();
		
		var opts_use = {
			id: objid,
			url: preload_sounds[name],
			volume: 100,
			autoload: autoload,
			onfinish: function(){
				var thisobj = id == 'Background' ? _Background : getObjectById(id);
				
				for(var i = 0; i < thisobj.sounds.length; i ++)
				{
					if(thisobj.sounds[i].name == name)
					{
						thisobj.sounds[i].playStart = 0;
					}
				}
				eval(dofinish);
			},
		}
		
		for(i in opts)
		{
			opts_use[i] = opts[i];
		}
		
		var soundObj = soundManager.createSound(opts_use);
		
		var newSound = {
			'playStart': 0,
			'sound': soundObj,
			'name': name,
		};
		
		this.sounds.push(newSound);

	},
	playSound: function(name)
	{
		if(_PovoleneEfekty['sound'])
		{
			for(var i = 0; i < this.sounds.length; i ++)
			{
				if(this.sounds[i].name == name)
				{
					this.sounds[i].sound.play();
					var date = new Date;
					this.sounds[i].playStart = date.getTime();
				}
			}
		}
	},
	deleteSounds: function()
	{
		for(i in this.sounds)
		{
			this.sounds[i].sound.destruct();
		}
		this.sounds = new Array();
	},
	setZindex: function(na)
	{
		this.zindex = na;
		sortAllObj();
	},
	addClass: function(class)
	{
		if(!this.hasClass(class))
		{
			this.class.push(class);
		}
	},
	removeClass: function(class)
	{
		var i = this.hasClass(class);
		if(i > 0)
		{
			this.class.splice(i - 1, 1);
		}
	},
	hasClass: function(class)
	{
		return this.class.indexOf(class) + 1;
	},
	getRunningAnim: function()
	{
		return this.runningAnim;
	},
	getAnimLength: function(anim)
	{
		var vrat = 0;
		for(var i = 0; i < this.animations[anim].length; i++)
		{
			vrat += this.animations[anim][i][1];
		}
		return vrat;
	},
	runAnim: function(co, times, callback)
	{
		if(!this.animations[co] && co)
		{
			addDebug("There is no such animation '"+co+"'");
			return 0;
		}
		
		if(!times)
			times = 0;
		
		if(co || this.animations[co])
		{
			this.runningAnim = co;
			this.animFrame = -1;
			this.animRunTimes = [0, times];
			this.animNextFrame = 0;
			this.animCallback = callback;
		}
		else
			this.runningAnim = "";
	},
	mouseDown: function()
	{
	},
	mouseUp: function()
	{
	},
	mouseInside: function(calcZ, inBounds)
	{
		var Mx = _Mouse.x - 1;
		var My = _Mouse.y - 1;
		
		if(inBounds && (Mx < 0 || Mx > _plocha_px_width || My < 0 || My > _plocha_px_height))
			return false;			
		
		if(!calcZ)
			return objectsInRect(Mx + _kamera_x, My + _kamera_y, 1, 1).indexOf(this) >= 0;
		else
		{
			var objects = objectsInRect(Mx + _kamera_x, My + _kamera_y, 1, 1);
			if(objects.length)
			{
				var toreturn = objects[0];
				for(var i = 0; i < objects.length; i++)
				{
					if(objects[i].zindex > toreturn.zindex || objects[i].zindex == toreturn.zindex && objects[i] == this)
						toreturn = objects[i];
				}
				return toreturn == this;
			}
			else
				return false;
		}
	},
	registerEvent: function(oMs, co, opakuj, keyword)
	{
		var date = new Date;
		if(opakuj)
			this.events.push({'registered': date.getTime(), 'spust': oMs, 'keyword': keyword, 'function': co + 'this.registerEvent('+oMs+', \''+co+'\', '+opakuj+', \''+keyword+'\');'});
		else
			this.events.push({'registered': date.getTime(), 'spust': oMs, 'function': co, 'keyword': keyword});
	},
	removeEvents: function(keyword, withkeyword)
	{
		if(keyword && withkeyword)
		{
			for(var i = this.events.length - 1; i > 0; i --)
			{
				if(this.events[i]['keyword'] == keyword)
					this.events.splice(i, 1);
			}
		}
		else if(keyword && !withkeyword)
		{
			for(var i = this.events.length - 1; i > 0; i --)
			{
				if(this.events[i]['keyword'] != keyword)
					this.events.splice(i, 1);
			}
		}
		else
			this.events = new Array;
	},
	getNumEvents: function(keyword)
	{
		if(keyword)
		{
			var counter;
			
			for(var i = 0; i > this.events.length; i --)
			{
				if(this.events[i]['keyword'] == keyword)
					counter ++;
			}
			
			return counter;
		}
		else
			return this.events.length;
	},
	inRect: function(x, y, width, height)
	{
		if(Math.abs((this.getX() + this.getWidth() / 2) - (x + width / 2)) <= this.getWidth() / 2 + width / 2 && Math.abs((this.getY() + this.getHeight() / 2) - (y + height / 2)) <= this.getHeight() / 2 + height / 2)
			return true;
		else
			return false;
	},
	pohyb: function()
	{
		// animacie
			
		if(this.getRunningAnim())
		{
			if(this.animRunTimes[0] == this.animRunTimes[1] && this.animRunTimes[1] > 0)
			{
				this.runAnim();
				eval(this.animCallback);
			}
			else
			{
				var date = new Date;
				if(this.animNextFrame == 0)
				{
					this.animNextFrame = date.getTime();
				}
				if(this.animNextFrame <= date.getTime()) // preskoc na dalsi snimok
				{
					this.animFrame ++;
										
					if(this.animFrame == this.animations[this.getRunningAnim()].length)
					{
						this.animFrame = 0;
						this.animRunTimes[0] ++;
					}
					
					var x = 0;
					var y = 0;
					
					if(this.centerPoint[0] == 1)
						x = this.getCenX();
					if(this.centerPoint[0] == 2)
						x = this.getX() + this.getWidth();
						
					if(this.centerPoint[1] == 1)
						y = this.getCenY();
					if(this.centerPoint[1] == 2)
						y = this.getY() + this.getHeight();
					
					this.frame = this.animations[this.getRunningAnim()][this.animFrame][0];
					
					if(this.centerPoint[0] == 1)
						this.setCenX(x);
					if(this.centerPoint[0] == 2)
						this.setX(x - this.getWidth());
						
					if(this.centerPoint[1] == 1)
						this.setCenY(y);
					if(this.centerPoint[1] == 2)
						this.setY(y - this.getHeight());
					
					this.animNextFrame = date.getTime() + this.animations[this.getRunningAnim()][this.animFrame][1];
				}
			}
		}

		
		// eventy
			
		var date = new Date;
		for(var i = 0; i < this.events.length; i++)
		{
			if(date.getTime() >= (this.events[i]['spust'] + this.events[i]['registered']))
			{
				eval(this.events[i]['function']);
				this.events.splice(i, 1);
			}
		}
		
		// boundsActions:
			
		var triggered = new Array;
		if((this.getX() + this.getSpeedX()) > this.max_x - this.getWidth())
		{
			triggered.push("right");
		}
		if((this.getX() + this.getSpeedX()) < this.min_x)
		{
			triggered.push("left");
		}
		if((this.getY() + this.getSpeedY()) > this.max_y - this.getHeight())
		{
			triggered.push("bottom");
		}
		if((this.getY() + this.getSpeedY()) < this.min_y)
		{
			triggered.push("top");
		}
		
		for(var i = 0; i < triggered.length; i++)
		{
			if(this.boundsAction[triggered[i]] === 0) // nic, chod aj za okraj
			{
			}
			
			else if(this.boundsAction[triggered[i]] === 1) // prechod na druhu stranu obrazovky
			{
				switch(triggered[i])
				{
					case "top":
						this.setY(this.max_y - this.getHeight());
						break;
					case "right":
						this.setX(this.min_x);
						break;
					case "bottom":
						this.setY(this.min_y);
						break;
					case "left":
						this.setX(this.max_x - this.getWidth());
						break;
				}
			}
			
			else if(this.boundsAction[triggered[i]] === 2) // die()
			{
				this.die();
			}
			
			else if(this.boundsAction[triggered[i]] === 3) // bounce
			{
				switch(triggered[i])
				{
				case "bottom":
						this.setY(this.max_y - this.getHeight());
						this.setSpeedY(this.getSpeedY() * -1);
						break;
					case "top":
						this.setY(this.min_y);
						this.setSpeedY(this.getSpeedY() * -1);
						break;
					case "left":
						this.setX(this.min_x);
						this.setSpeedX(this.getSpeedX() * -1);
						break;
					case "right":
						this.setX(this.max_x - this.getWidth());
						this.setSpeedX(this.getSpeedX() * -1);
						break;
				}
			}
			
			if(this.boundsAction[triggered[i]] === 4) // prejdi iba po okraj a ostan stat
			{
				switch(triggered[i])
				{
					case "top":
						this.setY(this.min_y);
						this.setSpeedY(0);
						break;
					case "right":
						this.setX(this.max_x - this.getWidth());
						this.setSpeedX(0);
						break;
					case "bottom":
						this.setY(this.max_y - this.getHeight());
						this.setSpeedY(0);
						break;
					case "left":
						this.setX(this.min_x);
						this.setSpeedX(0);
						break;
				}
			}

			eval(this.boundsAction['run']);
		}
		
		if(!this.pinned)
		{
			this.x_speed_helper += this.x_speed % _posun;
			this.y_speed_helper += this.y_speed % _posun;
			
			this.x = this.getSpeedX() - (this.getSpeedX() % _posun) + (this.x_speed_helper - this.x_speed_helper % _posun) + this.getX();
			this.y = this.getSpeedY() - (this.getSpeedY() % _posun) + (this.y_speed_helper - this.y_speed_helper % _posun) + this.getY();
			
			if(Math.abs(this.x_speed_helper / _posun) > 0 && Math.abs(this.x_speed_helper) > Math.abs(this.x_speed_helper % _posun))
			{
				this.x_speed_helper %= _posun;
			}
			if(Math.abs(this.y_speed_helper / _posun) > 0 && Math.abs(this.y_speed_helper) > Math.abs(this.y_speed_helper % _posun))
			{
				this.y_speed_helper %= _posun;
			}
		}
		
		this.rotation = this.rotation < 0 ? (360 - Math.abs(this.rotation % 360)) : this.rotation % 360;
	},
	die: function()
	{
		this.removeEvents()
		
		
		for(var i = 0; i < this.sounds.length; i++)
		{
			this.sounds[i].sound.destruct();
		}
		
		this.sounds = [];
		
		for(var i = 0; i < _allObjects.length; i++)
		{
			if(_allObjects[i] == this)
			{
				inarray = i;
				break;
			}
		}
		_allObjects.splice(inarray, 1);
	},
	getId: function()
	{
		return this.id;
	},
	getWidth: function()
	{
		return this.frames[this.frame].width * this.scale_x;
	},
	setWidth: function(width)
	{
		this.frames[this.frame].width = width;
	},
	getHeight: function()
	{
		return this.frames[this.frame].height * this.scale_y;
	},
	setHeight: function(height)
	{
		this.frames[this.frame].height = height;
	},
	setX: function(x)
	{
		this.x = x;
	},
	setY: function(y)
	{
		this.y = y;
	},
	getX: function()
	{
		return this.x;
	},
	getY: function()
	{
		return this.y;
	},

	setCenX: function(x)
	{
		this.x = x - this.getWidth() / 2;
	},
	setCenY: function(y)
	{
		this.y = y - this.getHeight() / 2;
	},
	getCenX: function()
	{
		return this.x + this.getWidth() / 2;
	},
	getCenY: function()
	{
		return this.y + this.getHeight() / 2;
	},
	setSpeedX: function(speed)
	{
		this.x_speed = speed;
		this.x_speed_helper = 0;
	},
	setSpeedY: function(speed)
	{
		this.y_speed = speed;
		this.y_speed_helper = 0;
	},
	getSpeedX: function()
	{
		return this.x_speed;
	},
	getSpeedY: function()
	{
		return this.y_speed;
	},
});

function deleteSounds(classes, withclass)
{
	if(typeof(classes) == 'object') // if an object is passed to delete its sounds. It's better to use object's function deleteSounds in this case !!
	{
		for(i in classes.sounds)
		{
			classes.sounds[i].sound.destruct();
		}
		classes.sounds = new Array();
	}
	for(i in _allObjects) // else it loops all the objects
	{
		var deleteInThis = typeof(classes) == 'undefined' ? true : false;
		withclass = typeof(withclass) == 'undefined' ? true : withclass;
		if(!deleteInThis)
		{
			for(j in classes)
			{
				if(_allObjects[i].hasClass(j) && withclass == true || !_allObjects[i].hasClass(j) && withclass == false)
					deleteInThis = true;
			}
		}
		if(deleteInThis)
		{
			for(j in _allObjects[i].sounds)
			{
				_allObjects[i].sounds[j].sound.destruct();
			}
			_allObjects[i].sounds = new Array();
		}
	}
}

function setCursor(what)
{
	_cursor = what;
}

function getCursor(what)
{
	return _cursor;
}

function trigon(kolko, co)
{
	if(typeof(co) == 'undefined')
		return false;
	if(co[0] == 'a')
		return eval('Math.'+co+'('+kolko+') * 180 / Math.PI');
	else
		return eval('Math.'+co+'('+kolko+' * Math.PI / 180)');
}


function numClass(class)
{
	var num = 0;
	for(var i = 0; i < _allObjects.length; i ++)
	{
		if(_allObjects[i].hasClass(class))
			num ++;
	}
	
	return num;
}

function addDebug(co)
{
	if(enableDebug)
		debug.innerHTML = debug.innerHTML + "<br />\n" + co;
}

function random(min, max, zakazaneCisla)
{
	do
	{
		var randomNum = (Math.random()*10000);
		randomNum = Math.floor(randomNum);
	    randomNum = min + (randomNum % ((max + 1) - min));
	} while (zakazaneCisla && zakazaneCisla.indexOf(randomNum) >= 0)
	
	return randomNum;
}

function main()
{
	setCursor('default');
	
	if(_scale != _oldscale)
	{
		document.getElementById('plocha').style.width = _plocha_px_width * _scale + "px";
		document.getElementById('plocha').style.height = _plocha_px_height * _scale + "px";
		
		document.getElementById('okno').style.width = _plocha_px_width * _scale + "px";
		document.getElementById('okno').style.height = _plocha_px_height * _scale + "px";

		_oldscale = _scale;
	}
	
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].mouseInside(true))
			setCursor(_allObjects[i].cursor);
			
		_allObjects[i].pohyb();
	}
	_Flash.pohyb();_Background.pohyb();
	
	document.getElementById('plocha').style.cursor = getCursor();

	_Key['up'] = new Array;
}

function draw(obj, context, tempdraw, source)
{
	if(obj.getX() > (_kamera_x - obj.getWidth()) && obj.getX() < _kamera_x + _plocha_px_width && obj.getY() > (_kamera_y - obj.getHeight()) && obj.getY() < _kamera_y + _plocha_px_height)
	{	
		if(tempdraw)
		{
			var x = 0;
			var y = 0;
		}
		else
		{
			var x = obj.getX() - _kamera_x;
			var y = obj.getY() - _kamera_y;
		}
		
		context.save();
		context.globalAlpha = obj.alpha;

		if(obj.flip)
		{
			if(obj.flip == 1)
				context.setTransform(-1, 0, 0, 1, (obj.getCenX() - _kamera_x)*2, 0);
			if(obj.flip == 2)
				context.setTransform(1, 0, 0, -1, 0, (obj.getCenY() - _kamera_y)*2);
			
			if(obj.flip == 3)
			{
				context.setTransform(-1, 0, 0, 1, (obj.getCenX() - _kamera_x)*2, 0);
				context.transform(1, 0, 0, -1, 0, (obj.getCenY() - _kamera_y)*2);
			}
		}

		if(obj.rotation)
		{
			context.translate(x + obj.getWidth() / 2 + obj.rotCenter[0], y + obj.getHeight() / 2 + obj.rotCenter[1]);
			context.rotate((obj.flip == 0 ? obj.rotation : obj.rotation * -1) * (Math.PI / 180));
			context.translate(-1 *(x + obj.getWidth() / 2 + obj.rotCenter[0]), -1 *(y + obj.getHeight() / 2 + obj.rotCenter[1]));
		}

		if(obj.frames[obj.frame]['type'] == 'image' || source)
		{
			if(source)
			{
				if(obj.sliced !== false)
					context.drawImage(source, obj.sliced[0], obj.sliced[1], obj.sliced[2] == 0 ? 1 : obj.sliced[2], obj.sliced[3] == 0 ? 1 : obj.sliced[3], x + obj.sliced[0], y + obj.sliced[1], obj.sliced[2], obj.sliced[3])
				else
					context.drawImage(source, x, y, obj.getWidth(), obj.getHeight());
			}
			else
			{
				if(obj.sliced !== false)
					context.drawImage(getImage(obj.frames[obj.frame]['name']), obj.sliced[0], obj.sliced[1], obj.sliced[2] == 0 ? 1 : obj.sliced[2], obj.sliced[3] == 0 ? 1 : obj.sliced[3], x + obj.sliced[0], y + obj.sliced[1], obj.sliced[2], obj.sliced[3])
				else
					context.drawImage(getImage(obj.frames[obj.frame]['name']), x, y, obj.getWidth(), obj.getHeight());
			}
		}
		
		else if(obj.frames[obj.frame]['type'] == 'circle')
		{
			context.fillStyle = "#" + obj.frames[obj.frame]['color'];
			context.beginPath();
			context.arc(x + (obj.getWidth() / 2), y + (obj.getHeight() / 2), obj.getWidth() / 2, 0, 2*Math.PI, true);
			context.fill();
			context.closePath();
		}
			
		else if(obj.frames[obj.frame]['type'] == 'rect')
		{
			context.fillStyle = "#" + obj.frames[obj.frame]['color'];
			context.fillRect(x, y, obj.getWidth(), obj.getHeight());
		}
			
		else if(obj.frames[obj.frame]['type'] == 'text')
		{
			context.fillStyle = "#" + obj.frames[obj.frame]['color'];
			context.font = obj.frames[obj.frame]['font'];
			context.fillText(obj.frames[obj.frame]['text'], x, y + obj.getHeight());
		}
			
		else if(obj.frames[obj.frame]['type'] == 'blank')
		{
		}
			
		
		if(tempdraw)
		{
			context.globalCompositeOperation = 'source-atop';
			context.globalAlpha = obj.overlay[1];
			
			context.fillStyle = "#" + obj.overlay[0];
			context.fillRect(0, 0, obj.getWidth(), obj.getHeight());
		}
			
		context.restore();
	}
}

function decideoverlay(obj)
{
	if(obj.overlay[1] > 0 && obj.frames[obj.frame].type != 'blank' && obj.alpha > 0 && _PovoleneEfekty['overlay']) // needs to draw overlaying color?
	{
		var overlayer = document.getElementById('overlayer');
		if(overlayer.width != obj.getWidth())
			overlayer.width = obj.getWidth();
		if(overlayer.height != obj.getHeight())
			overlayer.height = obj.getHeight();
		octx.clearRect(0, 0, obj.getWidth, obj.getHeight());
		
		draw(obj, octx, true); // prepare the object on the temporary canvas
		draw(obj, ctx, false, overlayer); // paste it back on main canvas
	}
	else
	{
		draw(obj, ctx);
	}
}

function drawloop()
{
	var date = new Date;
	var zacalo = date.getTime();
	
	if(_cleanDraw)
		ctx.clearRect(0, 0, _plocha_px_width, _plocha_px_height);
	
	decideoverlay(_Background);
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		decideoverlay(_allObjects[i]);
	}
	
	if(_PovoleneEfekty['flash'])
	{
		decideoverlay(_Flash);
	}
		
	date = new Date;
	var skoncilo = date.getTime();
	
	var zakolko = 1000 / _drawFps - (skoncilo - zacalo);
	if(zakolko < 0)
		zakolko = 0;
	
	//document.getElementsByTagName('h1')[0].innerHTML = Math.round((1000 / (zakolko + (skoncilo - zacalo)))) + " fps ("+Math.round(zakolko) + " ms), min "+(skoncilo - zacalo)+" ms";
	setTimeout('drawloop()', zakolko);
}

function earthquake(snimkov, delay, minShake, maxShake)
{
	if(_PovoleneEfekty['earthquake'])
	{
		var plocha = document.getElementById("plocha");	
		var delayed = 0;
		
		for(var i = 0; i < snimkov; i++)
		{
			shake = random(minShake, maxShake) * random(-1,1, [0]);
			
			
			if(i % 2) // shake X
			{
				setTimeout('document.getElementById("plocha").style.left = "'+shake+'px";', delay + delayed);
				delayed += 20;
			}
			else // shake Y
			{
				setTimeout('document.getElementById("plocha").style.top = "'+shake+'px";', delay + delayed);
				delayed += 20;
			}
		}
		setTimeout('document.getElementById("plocha").style.top = "0";document.getElementById("plocha").style.left = "0";', delay + delayed);
	}
}

function flash(snimkov, delay, farby, override)
{
	var colors = {
		'black': '000000',
		'aqua': '00ffff',
		'fuchsia': 'ff00ff',
		'gray': '808080',
		'white': 'ffffff',
		'red': 'ff0000',
		'lime': '00ff00',
		'yellow': 'ffff00',
		'teal': '008080',
		'silver': 'c0c0c0',
		'purple': '800080',
		'olive': '808000',
		'navy': '000080',
		'maroon': '800000',
		'green': '008000',
		'blue': '0000ff',
	}
	if(_PovoleneEfekty['flash'] && _paused !== true || _PovoleneEfekty['flash'] && override === true)
	{
		var delayed = 0;
		var poradie = 0;
		_Flash.removeEvents();
		
		for(var i = 0; i < snimkov; i++)
		{
			var farba = typeof(colors[farby[poradie]]) != 'undefined' ? colors[farby[poradie]] : farby[poradie];
			if(typeof(colors[farby[poradie]]) == 'undefined' && farby[poradie].length != 6 && farby[poradie] != 'blank')
				alert('neznama farba: '+ farby[poradie]);
			
			if(farby[poradie] == 'blank')
				_Flash.registerEvent(delay + delayed, "this.frames['default'].type = 'blank';", false, 'flash');
			else
				_Flash.registerEvent(delay + delayed, "this.frames['default'] = {'type': 'rect', 'color': '"+farba+"', 'width': _plocha_px_width, 'height': _plocha_px_height};", false, 'flash');
			poradie = poradie == farby.length - 1 ? 0 : poradie + 1; delayed += delay;
		}
		_Flash.registerEvent(delay + delayed, "this.frames['default'].type = 'blank';", false, 'flash');
		
	}
}

function znictext()
{
	var text = getObjectsByClass('_text');
	for(var i = 0; i < text.length; i++)
	{
		text[i].die();
	}
}

function measureText(co, font)
{
	ctx.save();
	ctx.font = font;
	var width = ctx.measureText(co).width;
	ctx.restore();
	
	return width;
}

function vypisFontom(co, x, y, font, farba, zIndex)
{
	co = co + "";
	
	var nove = new object('text'+numClass('_text'));
	nove.addClass('_text');
	
	nove.frames = [{'type': 'text', 'text': co, 'font': font, 'color': farba, 'width': measureText(co, font), 'height': font.substr(0, font.indexOf('px')) * 1}];
	nove.frame = 0;

	nove.changeText = function(text)
	{
		this.frames[this.frame].text = text;
		this.setWidth(measureText(text, this.frames[this.frame].font));
	}

	switch(x)
	{
		case 'center': x = (_plocha_px_width - nove.getWidth()) / 2; break;
		case 'left': x = 0; break;
		case 'right': x = _plocha_px_width - nove.getWidth(); break;
	}
	nove.setX(x);
	nove.setY(y);
	if(zIndex)
		nove.setZindex(zIndex);
		
	return nove;
}

function objectsInRect(x, y, width, height, vykresli)
{
	width -= 2;
	height -= 2;
	x++;
	y++;
	
	vrat = new Array;
	
	for(var i = 0; i < _allObjects.length; i++)
	{
		obj = _allObjects[i];
		if(Math.abs((obj.getX() + obj.getWidth() / 2) - (x + width / 2)) <= obj.getWidth() / 2 + width / 2 && Math.abs((obj.getY() + obj.getHeight() / 2) - (y + height / 2)) <= obj.getHeight() / 2 + height / 2)
			vrat.push(_allObjects[i]);
	}
	
	return vrat;
}


function getObjectById(id)
{
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].id == id)
			return _allObjects[i];
	}
	
	return false;
}

function getObjectsByClass(class)
{
	var vrat = new Array;
	for(var i = 0; i < _allObjects.length; i++)
	{
		if(_allObjects[i].hasClass(class))
			vrat.push(_allObjects[i]);
	}
	
	return vrat;
}

function getImage(what)
{
	for(var i = 0; i < Images.length; i++)
	{
		if(Images[i]['name'] == what)
			return Images[i]['obj'];
	}
	alert('Unknown Image: '+ what);
	return false;
}

function _zindexSortFunction(a, b)
{
	return (a.zindex * 1) - (b.zindex * 1);
}

function sortAllObj()
{
	_allObjects.sort(_zindexSortFunction);
}