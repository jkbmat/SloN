// objekty

var bg_obj = object.extend({
	constructor: function()
	{
		this.base('_Background');
				
		this.frames = {
			'default': {'type': 'blank', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		this.alpha = 1;
		
		_allObjects.splice(_allObjects.indexOf(this), 1);
		
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
		
		this.setX(0);
		this.setY(0);
	},
});

var flash_obj = object.extend({
	constructor: function()
	{
		this.base('_Flash');
		_allObjects.splice(_allObjects.indexOf(this), 1);
				
		this.frames = {
			'default': {'type': 'blank', 'color': 'ffffff', 'width': _plocha_px_width, 'height': _plocha_px_height},
		};
		
		this.alpha = 1;
				
		this.animations = {
			'default': [['default', 1]]
		};
		
		this.frame = 'default';
				
		this.setX(0);
		this.setY(0);
	},
});

var _Flash = new flash_obj;
var _Background = new bg_obj();


