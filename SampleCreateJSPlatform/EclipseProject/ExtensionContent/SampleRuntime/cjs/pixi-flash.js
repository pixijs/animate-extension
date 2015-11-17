/*! Pixi Flash 0.2.6 */
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(window)
{
	//Set up namespaces, and check that PIXI and CreateJS have been set up
	//any failures will likely cause other failures in the library set up, but that's okay
	if (!window.PIXI)
	{
		if (true)
		{
			throw "Pixi Flash requires PIXI to be loaded before Pixi Flash is loaded!";
		}
		else
		{
			throw "Requires PIXI";
		}
	}

	// Check for TweenJS
	if (!window.createjs || !createjs.Tween)
	{
		if (true)
		{
			throw "PIXI Flash requires TweenJS to be loaded before Pixi Flash is loaded!";
		}
		else
		{
			throw "Requires TweenJS";
		}
	}

	// Add the pixiflash namespace
	if (!window.pixiflash)
	{
		window.pixiflash = {
			Rectangle: PIXI.Rectangle,
			Tween: createjs.Tween,
			Ease: createjs.Ease
		};
	}

	// Add namespace for symbols from Flash
	if(!window.pixiflash_lib)
	{
		window.pixiflash_lib = {};
	}

	// Add namespace for images from Flash
	if(!window.pixiflash_images)
	{
		window.pixiflash_images = {};
	}

}(window));
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(window)
{
	/**
	 * Utilities for converting 
	 * @class utils
	 */
	var utils = {};

	/**
	 * Convert the loaded texture atlas to images
	 * @method addImages
	 * @static
	 * @param {PIXI.Texture} atlas The atlas to convert images
	 */
	utils.addImages = function(atlas)
	{
		var id;

		// This needs to happen before we create the character
		// so that the textures exist for the movieclip
		for(var frame in atlas.textures)
		{
			// Remove the file extension from the image name
			id = frame.substring(0, frame.indexOf("."));
			window.pixiflash_images[id] = atlas.textures[frame];
		}
	};

	/**
	 * Convert a string color "#ffffff" to int 0xffffff
	 * @method colorToHex
	 * @private
	 * @param {String} color
	 * @return {int} The hex color
	 */
	utils.colorToHex = function(color)
	{
		if (/^rgba\(/.test(color))
		{
			// Remove "rgba(" and ")" and turn into array
			color = color.substring(5, color.length - 1).split(',');
			color = 65536 * parseInt(color[0]) +
				256 * parseInt(color[1]) +
				parseInt(color[2]);
		}
		else
		{
			color = parseInt(color.replace(/^#/, ''), 16);
		}
		return color;
	};

	// Assign to namespace
	pixiflash.utils = utils;

}(window));
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	
	/**
	 * The class to emulate some of the functionality of createjs.ColorFilter (multiplicative values only -Advanced Color option in Flash)
	 * (acts only as a container for multiplicative values, to be  used by DisplayObject)
	 * @class ColorFilter
	 * @param {Number} r red multiplier
	 * @param {Number} g green multiplier
	 * @param {Number} b blue multiplier
	 */
	var ColorFilter = function(r, g, b)
	{
		if(r < 0)
			r = 0;
		if(g < 0)
			g = 0;
		if(b < 0)
			b = 0;
		
		var max = 255;
		this.tint = (Math.round(r * max) << 16) | (Math.round(g * max) << 8) | Math.round(b * max);
	};
	
	
	pixiflash.ColorFilter = ColorFilter;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Point = PIXI.Point;
	var ColorFilter = pixiflash.ColorFilter;
	var uniqueId = 0;
	
	/**
	*  Mixins for the display objects used for bridging CreateJS over to PIXI.
	*  @class DisplayObject
	*/
	var DisplayObject = function()
	{
		this.id = ++uniqueId;
		
		//mark these objects so that we can recognize them internally.
		this._isPixiFlash = true;
		/**
		 * x and y skew of the display object, with values in radians.
		 * @property {PIXI.Point} skew
		 */
		this.skew = new Point();
		
		/**
		 * Rotation of the display object, with values in radians.
		 * @property {Number} rotation
		 */
		this._rotation = 0;
		
		this._srB = 0;
		this._srC = 0;
		this._crA = 1;
		this._crD = 1;
		
		this._cachedRotY = 0;
		this._cachedRotX = 0;
		
		/**
		 * If false, the tick will not run on this display object (or its children). This can provide some performance benefits.
		 * In addition to preventing the "tick" event from being dispatched, it will also prevent tick related updates
		 * on some display objects (ex. Sprite & MovieClip frame advancing, DOMElement visibility handling).
		 * @property tickEnabled
		 * @type Boolean
		 * @default true
		 **/
		this.tickEnabled = true;
		
		//remove all listeners on this instance, because the CreateJS published files from flash
		//makes prototypes in a way that breaks normal PIXI listener usage.
		this.removeAllListeners();

		// Bound functions need to be bound later
		this.boundMaskChanged = false;

		//initialize tint variables:
		this._lastComputedTint = this._lastSelfTint = this._lastParentTint = this._selfTint = 0xFFFFFF;
		this.__filters = null;
	};

	var p = DisplayObject.prototype;
	
	var DEG_TO_RAD = Math.PI / 180;
	var RAD_TO_DEG = 180 / Math.PI;
	var PI_2 = Math.PI * 2;
	
	Object.defineProperties(p,
	{
		/**
		 * Private array of filters - for interpretation of CJS ColorFilters as PIXI tint
		 * @property {Array} _filters
		 */
		_filters:
		{
			enumerable: true,
			get: function() { return this.__filters; },
			set: function(value)
			{
				if(value.length == 1 && value[0] instanceof ColorFilter)
				{
					//ColorFilter added by CJS exporter - convert to PIXI tint
					this.tint = value[0].tint;
					this.__filters = null;
				}
				else
				{
					this.__filters = value;
				}
			}
		},
		/**
		 * Tint to apply to this display object - Interpreted from CJS ColorFilter (multiplicative only)
		 * @property {UInt} tint
		 */
		tint:
		{
			enumerable: true,
			get: function() {
				if(this.parent && this.parent._isPixiFlash)
				{
					var selfTint = this._selfTint;
					var parentTint = this.parent.tint;

					if(selfTint == 0xFFFFFF)
						this._lastComputedTint = parentTint;
					else if(parentTint == 0xFFFFFF)
						this._lastComputedTint = selfTint;
					if(this._selfTint != this._lastSelfTint || this.parent.tint != this._lastParentTint)
					{
						//calculate tint first time
						var max = 255;
						var parentR = (parentTint >> 16) & 0xff;
						var parentG = (parentTint >> 8) & 0xff;
						var parentB = parentTint & 0xff;
						var selfR = (selfTint >> 16) & 0xff;
						var selfG = (selfTint >> 8) & 0xff;
						var selfB = selfTint & 0xff;

						this._lastComputedTint = (Math.round((parentR * selfR) / max) << 16) | (Math.round((parentG * selfG) / max) << 8) | Math.round((parentB * selfB) / max);
					}

					this._lastSelfTint = selfTint;
					this._lastParentTint = parentTint;

					return this._lastComputedTint;
				}
				else
				{
					return this._selfTint;
				}
			},
			set: function(value)
			{
				this._selfTint = value;
			}
		},
		/**
		 * The x skew value of the display object, in degrees.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} skewX
		 */
		skewX:
		{
			enumerable: true,
			get: function() { return this.skew.x * RAD_TO_DEG; },
			set: function(value)
			{
				this.skew.x = value * DEG_TO_RAD;
			}
		},
		/**
		 * The y skew value of the display object, in degrees.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} skewY
		 */
		skewY:
		{
			enumerable: true,
			get: function() { return this.skew.y * RAD_TO_DEG; },
			set: function(value)
			{
				this.skew.y = value * DEG_TO_RAD;
			}
		},
		/**
		 * The rotation of the display object, in degrees.
		 * This overrides the radian degrees of the PIXI display objects so that
		 * tweening exported from Flash will work correctly.
		 * @property {Number} rotation
		 */
		rotation:
		{
			enumerable: true,
			get: function() { return this._rotation * RAD_TO_DEG; },
			set: function(value)
			{
				this._rotation = value * DEG_TO_RAD;
			}
		},
		/**
		 * The x scale value of the display object.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} scaleX
		 */
		scaleX:
		{
			enumerable: true,
			get: function() { return this.scale.x; },
			set: function(value)
			{
				this.scale.x = value;
			}
		},
		/**
		 * The y scale value of the display object.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} scaleY
		 */
		scaleY:
		{
			enumerable: true,
			get: function() { return this.scale.y; },
			set: function(value)
			{
				this.scale.y = value;
			}
		},
		/**
		 * The x value of the registration, or pivot, point.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} regX
		 */
		regX:
		{
			enumerable: true,
			get: function() { return this.pivot.x; },
			set: function(value)
			{
				this.pivot.x = value;
			}
		},
		/**
		 * The y value of the registration, or pivot, point.
		 * This property provides parity with CreateJS display objects.
		 * @property {Number} regY
		 */
		regY:
		{
			enumerable: true,
			get: function() { return this.pivot.y; },
			set: function(value)
			{
				this.pivot.y = value;
			}
		},

		/**
		 * The drawing graphics, these are necessary
		 * for the compability with EaselJS Flash exports.
		 * @property {pixiflash.Shape|pixiflash.Sprite} mask
		 */
		mask: {
			enumerable: true,
			get: function()
			{
				return this._mask;
			},
			set: function (mask)
			{
				if (this._mask)
				{
					// Remove the old mask if we're a shape
					if (this._mask.__parentShape)
					{
						var parentShape = this._mask.__parentShape;
						if (parentShape.parent)
							parentShape.parent.removeChild(parentShape);
						parentShape.off('graphicsChanged', this.onShapeChanged);
						delete this._mask.__parentShape;
					}
					this._mask.renderable = true;
				}
				// If the mask is a shape apply the graphics as the shape
				if (mask && mask instanceof pixiflash.Shape)
				{
					this._mask = mask.graphics;
					this._mask.__parentShape = mask;
					if(!this.boundMaskChanged)
					{
						this.boundMaskChanged = true;
						this.onShapeChanged = this.onShapeChanged.bind(this);
					}
					mask.once('graphicsChanged', this.onShapeChanged);
				}
				else
				{
					this._mask = mask;
				}
				if (this._mask)
				{
					// Wait until we're add and then add the mask
					// on the same container as this display object
					if (!this.parent)
					{
						this.once("added", function()
						{
							if(!this._mask) return;
							this.parent.addChild(this._mask.__parentShape || this._mask);
						});
					}
					else
					{
						this.parent.addChild(this._mask.__parentShape || this._mask);
					}
					this._mask.renderable = false;
				}
			}
		}
	});

	
	/**
	 * Dummy function for CJS export compatibility
	 * @method cache
	 */
	p.cache = function()
	{
		//don't do anything!
	};

	/**
	 * Graphics object was updated on the shape dynamically, update the mask
	 * @method onShapeChanged
	 * @private
	 * @param {pixiflash.Shape} shape
	 */
	p.onShapeChanged = function(shape)
	{
		// reset the shape mask
		this.mask = shape;
	};
	
	p.displayObjectUpdateTransform = function()
	{
		// create some matrix refs for easy access
		var pt = this.parent.worldTransform;
		var wt = this.worldTransform;

		// temporary matrix variables
		var a, b, c, d, tx, ty,
			rotY = this._rotation + this.skew.y,
			rotX = this._rotation + this.skew.x;

		// so if rotation is between 0 then we can simplify the multiplication process...
		if (rotY % PI_2 || rotX % PI_2)
		{
			// check to see if the rotation is the same as the previous render. This means we only need to use sin and cos when rotation actually changes
			if (rotX !== this._cachedRotX || rotY !== this._cachedRotY)
			{
				// cache new values
				this._cachedRotX = rotX;
				this._cachedRotY = rotY;
				
				// recalculate expensive ops
				this._crA = Math.cos(rotY);
				this._srB = Math.sin(rotY);
				
				this._srC = Math.sin(-rotX);
				this._crD = Math.cos(rotX);
			}

			// get the matrix values of the displayobject based on its transform properties..
			a  = this._crA * this.scale.x;
			b  = this._srB * this.scale.x;
			c  = this._srC * this.scale.y;
			d  = this._crD * this.scale.y;
			tx =  this.position.x;
			ty =  this.position.y;

			// check for pivot.. not often used so geared towards that fact!
			if (this.pivot.x || this.pivot.y)
			{
				tx -= this.pivot.x * a + this.pivot.y * c;
				ty -= this.pivot.x * b + this.pivot.y * d;
			}

			// concat the parent matrix with the objects transform.
			wt.a  = a  * pt.a + b  * pt.c;
			wt.b  = a  * pt.b + b  * pt.d;
			wt.c  = c  * pt.a + d  * pt.c;
			wt.d  = c  * pt.b + d  * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}
		else
		{
			// lets do the fast version as we know there is no rotation..
			a  = this.scale.x;
			d  = this.scale.y;

			tx = this.position.x - this.pivot.x * a;
			ty = this.position.y - this.pivot.y * d;

			wt.a  = a  * pt.a;
			wt.b  = a  * pt.b;
			wt.c  = d  * pt.c;
			wt.d  = d  * pt.d;
			wt.tx = tx * pt.a + ty * pt.c + pt.tx;
			wt.ty = tx * pt.b + ty * pt.d + pt.ty;
		}

		// multiply the alphas..
		this.worldAlpha = this.alpha * this.parent.worldAlpha;

		// reset the bounds each time this is called!
		this._currentBounds = null;
	};
	
	p.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY)
	{
		this.position.x = x || 0;
		this.position.y = y || 0;
		this.scale.x = !scaleX ? 1 : scaleX;
		this.scale.y = !scaleY ? 1 : scaleY;
		this.rotation = rotation || 0;
		this.skewX = skewX || 0;
		this.skewY = skewY || 0;
		this.pivot.x = regX || 0;
		this.pivot.y = regY || 0;
		return this;
	};
	
	DisplayObject.mixin = function(targetPrototype)
	{
		for(var prop in p)
		{
			// For things that we set using Object.defineProperty
			// very important that enumerable:true for the
			// defineProperty options
			var propDesc = Object.getOwnPropertyDescriptor(p, prop);
			if(propDesc)
			{
				Object.defineProperty(targetPrototype, prop, propDesc);
			}
			else
			{
				// Should cover all other prototype methods/properties
				targetPrototype[prop] = p[prop];
			}
		}
	};
	
	pixiflash.DisplayObject = DisplayObject;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiContainer = PIXI.Container,
		DisplayObject = pixiflash.DisplayObject,
		SharedTicker = PIXI.ticker.shared;
	
	/**
	 * The class to emulate createjs.Container
	 * @class Container
	 * @extends PIXI.Container
	 */
	var Container = function()
	{
		PixiContainer.call(this);
		DisplayObject.call(this);
		
		/**
		 * If false, the tick will not be propagated to children of this Container. This can provide some performance benefits.
		 * In addition to preventing the "tick" event from being dispatched, it will also prevent tick related updates
		 * on some display objects (ex. Sprite & MovieClip frame advancing, DOMElement visibility handling).
		 * @property tickChildren
		 * @type Boolean
		 * @default true
		 **/
		this.tickChildren = true;
		
		//add a listener for the first time the object is added, to get around
		//using new instances for prototypes that the CreateJS exporting does.
		this.once("added", function()
		{
			this._tickListener = this._tickListener.bind(this);
			this._onAdded();
			this._onAdded = this._onAdded.bind(this);
			this._onRemoved = this._onRemoved.bind(this);
			this.on("added", this._onAdded);
			this.on("removed", this._onRemoved);
		}.bind(this));
	};
	
	var s = PixiContainer.prototype;
	var p = Container.prototype = Object.create(s);
	
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Container;

	p.addChild = function(child)
	{
		var addChild = s.addChild.bind(this);
		for(var i = 0; i < arguments.length; i++)
		{
			addChild(arguments[i]);
		}
	};

	p._onAdded = function()
	{
		if(!this.parent._isPixiFlash)
		{
			SharedTicker.add(this._tickListener);
		}
	};
	
	p._tickListener = function(tickerDeltaTime)
	{
		var ms = tickerDeltaTime / SharedTicker.speed / PIXI.TARGET_FPMS;
		this._tick(ms);
	};
	
	p._onRemoved = function()
	{
		if(this._tickListener)
			SharedTicker.remove(this._tickListener);
	};
	
	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in milliseconds.
	 * @protected
	 **/
	p._tick = p.Container__tick = function(delta) {
		if (this.tickChildren) {
			for (var i=this.children.length-1; i>=0; i--) {
				var child = this.children[i];
				if (child.tickEnabled && child._tick) { child._tick(delta); }
				else if(child.tickChildren && child.Container__tick)
				{
					child.Container__tick(delta);
				}
			}
		}
	};
	
	p.__Container_destroy = p.destroy;
	p.destroy = function(destroyChildren)
	{
		if(this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}
		
		this.__Container_destroy(destroyChildren);
	};
	
	pixiflash.Container = Container;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Sprite = PIXI.Sprite,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Bitmap
	 * @class Bitmap
	 * @extends PIXI.Sprite
	 */
	var Bitmap = function(image)
	{
		Sprite.call(this, image);
		DisplayObject.call(this);
	};
	
	// Extend PIXI.Sprite
	var p = Bitmap.prototype = Object.create(Sprite.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Bitmap;
	
	// Assign to namespace
	pixiflash.Bitmap = Bitmap;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Container = PIXI.Container,
		DisplayObject = pixiflash.DisplayObject,
		Timeline = createjs.Timeline,
		Tween = createjs.Tween,
		SharedTicker = PIXI.ticker.shared;
	
	//*** Note: the vast majority of the code here is from EaselJS's MovieClip class.
	
	/*
	* MovieClip
	* Visit http://createjs.com/ for documentation, updates and examples.
	*
	* Copyright (c) 2010 gskinner.com, inc.
	*
	* Permission is hereby granted, free of charge, to any person
	* obtaining a copy of this software and associated documentation
	* files (the "Software"), to deal in the Software without
	* restriction, including without limitation the rights to use,
	* copy, modify, merge, publish, distribute, sublicense, and/or sell
	* copies of the Software, and to permit persons to whom the
	* Software is furnished to do so, subject to the following
	* conditions:
	*
	* The above copyright notice and this permission notice shall be
	* included in all copies or substantial portions of the Software.
	*
	* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
	* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
	* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
	* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
	* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
	* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
	* OTHER DEALINGS IN THE SOFTWARE.
	*/
	
	/**
	 * The class to emulate createjs.MovieClip, requires TweenJS
	 * @class MovieClip
	 * @extends PIXI.Container
	 */
	var MovieClip = function(mode, startPosition, loop, labels)
	{
		Container.call(this);
		DisplayObject.call(this);
		
		this.tickChildren = true;
		
		/**
		 * Controls how this MovieClip advances its time. Must be one of 0 (INDEPENDENT), 1 (SINGLE_FRAME), or 2 (SYNCHED).
		 * See each constant for a description of the behaviour.
		 * @property mode
		 * @type String
		 * @default null
		 **/
		this.mode = mode||MovieClip.INDEPENDENT;

		/**
		 * Specifies what the first frame to play in this movieclip, or the only frame to display if mode is SINGLE_FRAME.
		 * @property startPosition
		 * @type Number
		 * @default 0
		 */
		this.startPosition = startPosition || 0;

		/**
		 * Indicates whether this MovieClip should loop when it reaches the end of its timeline.
		 * @property loop
		 * @type Boolean
		 * @default true
		 */
		this.loop = loop;

		/**
		 * The current frame of the movieclip.
		 * @property currentFrame
		 * @type Number
		 * @default 0
		 * @readonly
		 */
		this.currentFrame = 0;
		
		/**
		 * The TweenJS Timeline that is associated with this MovieClip. This is created automatically when the MovieClip
		 * instance is initialized. Animations are created by adding <a href="http://tweenjs.com">TweenJS</a> Tween
		 * instances to the timeline.
		 *
		 * <h4>Example</h4>
		 *
		 *      var tween = createjs.Tween.get(target).to({x:0}).to({x:100}, 30);
		 *      var mc = new createjs.MovieClip();
		 *      mc.timeline.addTween(tween);
		 *
		 * Elements can be added and removed from the timeline by toggling an "_off" property
		 * using the <code>tweenInstance.to()</code> method. Note that using <code>Tween.set</code> is not recommended to
		 * create MovieClip animations. The following example will toggle the target off on frame 0, and then back on for
		 * frame 1. You can use the "visible" property to achieve the same effect.
		 *
		 *      var tween = createjs.Tween.get(target).to({_off:false})
		 *          .wait(1).to({_off:true})
		 *          .wait(1).to({_off:false});
		 *
		 * @property timeline
		 * @type Timeline
		 * @default null
		 */
		this.timeline = new Timeline(null, labels, {paused:true, position:startPosition, useTicks:true});
	
		/**
		 * If true, the MovieClip's position will not advance when ticked.
		 * @property paused
		 * @type Boolean
		 * @default false
		 */
		this.paused = false;
	
		/**
		 * If true, actions in this MovieClip's tweens will be run when the playhead advances.
		 * @property actionsEnabled
		 * @type Boolean
		 * @default true
		 */
		this.actionsEnabled = true;
	
		/**
		 * If true, the MovieClip will automatically be reset to its first frame whenever the timeline adds
		 * it back onto the display list. This only applies to MovieClip instances with mode=INDEPENDENT.
		 * <br><br>
		 * For example, if you had a character animation with a "body" child MovieClip instance
		 * with different costumes on each frame, you could set body.autoReset = false, so that
		 * you can manually change the frame it is on, without worrying that it will be reset
		 * automatically.
		 * @property autoReset
		 * @type Boolean
		 * @default true
		 */
		this.autoReset = true;
		
		/**
		 * @property _synchOffset
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._synchOffset = 0;
	
		/**
		 * @property _prevPos
		 * @type Number
		 * @default -1
		 * @private
		 */
		this._prevPos = -1; // TODO: evaluate using a ._reset Boolean prop instead of -1.
	
		/**
		 * @property _prevPosition
		 * @type Number
		 * @default 0
		 * @private
		 */
		this._prevPosition = 0;
	
		/**
		* Note - changed from default: When the MovieClip is framerate independent, this is the time
		* elapsed from frame 0 in seconds.
		* @property _t
		* @type Number
		* @default 0
		* @private
		*/
		this._t = 0;
		
		/**
		* By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
		* will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
		* framerate.
		*
		* @property _framerate
		* @type {Number}
		* @default 0
		**/
		this._framerate = 0;
		/**
		* When the MovieClip is framerate independent, this is the total time in seconds for the animation.
		* @property _duration
		* @type Number
		* @default 0
		* @private
		*/
		this._duration = 0;
	
		/**
		 * List of display objects that are actively being managed by the MovieClip.
		 * @property _managed
		 * @type Object
		 * @private
		 */
		this._managed = {};
		
		//add a listener for the first time the object is added, to get around
		//using new instances for prototypes that the CreateJS exporting does.
		this.once("added", function()
		{
			this._tickListener = this._tickListener.bind(this);
			this._onAdded();
			this._onAdded = this._onAdded.bind(this);
			this._onRemoved = this._onRemoved.bind(this);
			this.on("added", this._onAdded);
			this.on("removed", this._onRemoved);
		}.bind(this));
	};
	
	/**
	 * The MovieClip will advance independently of its parent, even if its parent is paused.
	 * This is the default mode.
	 * @property INDEPENDENT
	 * @static
	 * @type String
	 * @default "independent"
	 * @readonly
	 **/
	MovieClip.INDEPENDENT = "independent";

	/**
	 * The MovieClip will only display a single frame (as determined by the startPosition property).
	 * @property SINGLE_FRAME
	 * @static
	 * @type String
	 * @default "single"
	 * @readonly
	 **/
	MovieClip.SINGLE_FRAME = "single";

	/**
	 * The MovieClip will be advanced only when its parent advances and will be synched to the position of
	 * the parent MovieClip.
	 * @property SYNCHED
	 * @static
	 * @type String
	 * @default "synched"
	 * @readonly
	 **/
	MovieClip.SYNCHED = "synched";
	
	var p = MovieClip.prototype = Object.create(Container.prototype);
	
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = MovieClip;
	
	p._onAdded = function()
	{
		if(!this.parent._isPixiFlash)
		{
			SharedTicker.add(this._tickListener);
		}
	};
	
	p._tickListener = function(tickerDeltaTime)
	{
		var ms = tickerDeltaTime / SharedTicker.speed / PIXI.TARGET_FPMS;
		this._tick(ms);
	};
	
	p._onRemoved = function()
	{
		if(this._tickListener)
			SharedTicker.remove(this._tickListener);
	};
	
	/**
	 * Use the {{#crossLink "MovieClip/labels:property"}}{{/crossLink}} property instead.
	 * @method getLabels
	 * @return {Array}
	 * @deprecated
	 **/
	p.getLabels = function() {
		return this.timeline.getLabels();
	};
	
	/**
	 * Use the {{#crossLink "MovieClip/currentLabel:property"}}{{/crossLink}} property instead.
	 * @method getCurrentLabel
	 * @return {String}
	 * @deprecated
	 **/
	p.getCurrentLabel = function() {
		this._updateTimeline();
		return this.timeline.getCurrentLabel();
	};

	/**
	 * Returns an array of objects with label and position (aka frame) properties, sorted by position.
	 * Shortcut to TweenJS: Timeline.getLabels();
	 * @property labels
	 * @type {Array}
	 * @readonly
	 **/
	 
	/**
	 * Returns the name of the label on or immediately before the current frame. See TweenJS: Timeline.getCurrentLabel()
	 * for more information.
	 * @property currentLabel
	 * @type {String}
	 * @readonly
	 **/
	try {
		Object.defineProperties(p, {
			labels: { get: p.getLabels },
			currentLabel: { get: p.getCurrentLabel }
		});
	} catch (e) {}
	
	/**
	* When the MovieClip is framerate independent, this is the time elapsed from frame 0 in seconds.
	* @property elapsedTime
	* @type Number
	* @default 0
	* @public
	*/
	Object.defineProperty(p, 'elapsedTime', {
		get: function() {
			return this._t;
		},
		set: function(value) {
			this._t = value;
		}
	});
	
	/**
	* By default MovieClip instances advance one frame per tick. Specifying a framerate for the MovieClip
	* will cause it to advance based on elapsed time between ticks as appropriate to maintain the target
	* framerate.
	*
	* For example, if a MovieClip with a framerate of 10 is placed on a Stage being updated at 40fps, then the MovieClip will
	* advance roughly one frame every 4 ticks. This will not be exact, because the time between each tick will
	* vary slightly between frames.
	*
	* This feature is dependent on the tick event object (or an object with an appropriate "delta" property) being
	* passed into {{#crossLink "Stage/update"}}{{/crossLink}}.
	* @property framerate
	* @type {Number}
	* @default 0
	**/
	Object.defineProperty(p, 'framerate', {
		get: function() {
			return this._framerate;
		},
		set: function(value) {
			if(value > 0)
			{
				this._framerate = value;
				this._duration = value ? this.timeline.duration / value : 0;
			}
			else
				this._framerate = this._duration = 0;
		}
	});
	
	/**
	 * Sets paused to false.
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	};
	
	/**
	 * Sets paused to true.
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to false.
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances this movie clip to the specified position or label and sets paused to true.
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel The animation or frame name to go to.
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	};
	
	/**
	 * Advances the playhead. This occurs automatically each tick by default.
	 * @param [time] {Number} The amount of time in ms to advance by. Only applicable if framerate is set.
	 * @method advance
	*/
	p.advance = function(time) {
		// TODO: should we worry at all about clips who change their own modes via frame scripts?
		var independent = MovieClip.INDEPENDENT;
		if (this.mode != independent) { return; }
		
		if(!this._framerate)
		{
			var o=this, fps = o._framerate;
			while ((o = o.parent) && !fps) {
				if (o.mode == independent) { fps = o._framerate; }
			}
			this.framerate = fps;
		}
		
		if(!this.paused)
		{
			if(this._framerate > 0)
			{
				if(time)
					this._t += time * 0.001;//milliseconds -> seconds
				if(this._t > this._duration)
					this._t = this.timeline.loop ? this._t - this._duration : this._duration;
				//add a tiny amount to account for potential floating point errors
				this._prevPosition = Math.floor(this._t * this._framerate + 0.00000001);
				if(this._prevPosition > this.timeline.duration)
					this._prevPosition = this.timeline.duration;
			}
			else
				this._prevPosition = (this._prevPos < 0) ? 0 : this._prevPosition+1;
			//Timeline is always updated in the tick function for PixiFlash MovieClips,
			//to replace EaselJS's timeline updating in draw().
			//this._updateTimeline();
		}
	};
	
	/**
	 * @method _tick
	 * @param {Number} delta Time elapsed since the previous tick, in milliseconds.
	 * function.
	 * @protected
	 **/
	p._tick = function(delta) {
		if(this.tickEnabled)
			this.advance(delta);
		this._updateTimeline();
		this.Container__tick(delta);
	};
	
	p.Container__tick = function(delta) {
		if (this.tickChildren) {
			for (var i=this.children.length-1; i>=0; i--) {
				var child = this.children[i];
				if (child.tickEnabled && child._tick) { child._tick(delta); }
				else if(child.tickChildren && child.Container__tick)
				{
					child.Container__tick(delta);
				}
			}
		}
	};
	
	/**
	 * @method _goto
	 * @param {String|Number} positionOrLabel The animation name or frame number to go to.
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos === null || pos === undefined) { return; }
		// prevent _updateTimeline from overwriting the new position because of a reset:
		if (this._prevPos == -1) { this._prevPos = NaN; }
		this._prevPosition = pos;
		//update the elapsed time if a time based movieclip
		if(this._framerate > 0)
			this._t = pos / this._framerate;
		else
			this._t = 0;
		this._updateTimeline();
	};
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPos = -1;
		this._t = 0;
		this.currentFrame = 0;
	};
	
	/**
	 * @method _updateTimeline
	 * @protected
	 **/
	p._updateTimeline = function() {
		var tl = this.timeline;
		var synched = this.mode != MovieClip.INDEPENDENT;
		tl.loop = (this.loop==null) ? true : this.loop; // jshint ignore:line

		// update timeline position, ignoring actions if this is a graphic.
		if (synched) {
			tl.setPosition(this.startPosition + (this.mode==MovieClip.SINGLE_FRAME?0:this._synchOffset), Tween.NONE);
		} else {
			tl.setPosition(this._prevPos < 0 ? 0 : this._prevPosition, this.actionsEnabled ? null : Tween.NONE);
		}

		this._prevPosition = tl._prevPosition;
		if (this._prevPos == tl._prevPos) { return; }
		this.currentFrame = this._prevPos = tl._prevPos;

		for (var n in this._managed) { this._managed[n] = 1; }

		var tweens = tl._tweens;
		for (var i=0, l=tweens.length; i<l; i++) {
			var tween = tweens[i];
			var target = tween._target;
			if (target == this || tween.passive) { continue; } // TODO: this assumes actions tween has this as the target. Valid?
			var offset = tween._stepPosition;
			
			//Containers, Bitmaps(Sprites), and MovieClips(also Containers) all inherit from
			//Container for PIXI
			if (target instanceof Container) {
				// motion tween.
				this._addManagedChild(target, offset);
			} else {
				// state tween.
				this._setState(target.state, offset);
			}
		}

		var kids = this.children;
		for (i=kids.length-1; i>=0; i--) {
			var id = kids[i].id;
			if (this._managed[id] == 1) {
				this.removeChildAt(i);
				delete(this._managed[id]);
			}
		}
	};

	/**
	 * @method _setState
	 * @param {Array} state
	 * @param {Number} offset
	 * @protected
	 **/
	p._setState = function(state, offset) {
		if (!state) { return; }
		for (var i=state.length-1;i>=0;i--) {
			var o = state[i];
			var target = o.t;
			var props = o.p;
			for (var n in props) { target[n] = props[n]; }
			this._addManagedChild(target, offset);
		}
	};

	/**
	 * Adds a child to the timeline, and sets it up as a managed child.
	 * @method _addManagedChild
	 * @param {MovieClip} child The child MovieClip to manage
	 * @param {Number} offset
	 * @private
	 **/
	p._addManagedChild = function(child, offset) {
		if (child._off) { return; }
		this.addChildAt(child,0);

		if (child instanceof MovieClip) {
			child._synchOffset = offset;
			child._updateTimeline();
			// TODO: this does not precisely match Flash. Flash loses track of the clip if it is renamed or removed from the timeline, which causes it to reset.
			if (child.mode == MovieClip.INDEPENDENT && child.autoReset && !this._managed[child.id]) { child._reset(); }
		}
		this._managed[child.id] = 2;
	};
	
	p.__Container_destroy = p.destroy;
	p.destroy = function(destroyChildren)
	{
		if(this._tickListener)
		{
			SharedTicker.remove(this._tickListener);
			this._tickListener = null;
		}
		
		this.__Container_destroy(destroyChildren);
	};
	
	pixiflash.MovieClip = MovieClip;
	
	/**
	 * This plugin works with <a href="http://tweenjs.com" target="_blank">TweenJS</a> to prevent the startPosition
	 * property from tweening.
	 * @private
	 * @class MovieClipPlugin
	 * @constructor
	 **/
	function MovieClipPlugin() {
		throw("MovieClipPlugin cannot be instantiated.");
	}
	
	/**
	 * @method priority
	 * @private
	 **/
	MovieClipPlugin.priority = 100; // very high priority, should run first

	/**
	 * @method install
	 * @private
	 **/
	MovieClipPlugin.install = function() {
		Tween.installPlugin(MovieClipPlugin, ["startPosition"]);
	};
	
	/**
	 * @method init
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String|Number|Boolean} value
	 * @private
	 **/
	MovieClipPlugin.init = function(tween, prop, value) {
		return value;
	};
	
	/**
	 * @method step
	 * @private
	 **/
	MovieClipPlugin.step = function() {
		// unused.
	};

	/**
	 * @method tween
	 * @param {Tween} tween
	 * @param {String} prop
	 * @param {String | Number | Boolean} value
	 * @param {Array} startValues
	 * @param {Array} endValues
	 * @param {Number} ratio
	 * @param {Object} wait
	 * @param {Object} end
	 * @return {*}
	 */
	MovieClipPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		if (!(tween.target instanceof MovieClip)) { return value; }
		return (ratio == 1 ? endValues[prop] : startValues[prop]);
	};
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function()
{
	// Impor classes
	var Rectangle = PIXI.Rectangle;
	var Texture = PIXI.Texture;
	var Loader = PIXI.loaders.Loader;

	/**
	 * SpriteSheet for export from flash
	 * @class SpriteSheet
	 * @constructor
	 * @param {Object} data The spritesheet to load
	 * @param {Array} data.images The collection of BaseTextures
	 * @param {Array} data.frames The collection of frames
	 */
	var SpriteSheet = function(data)
	{
		/**
		 * The collection of frames
		 * @property {Array} frames
		 * @private
		 */
		this.frames = [];

		/**
		 * The global id of the spriteshet
		 * @property {String} _id
		 * @private
		 */
		this._id = null;

		if (data)
		{
			this._addFrames(data);
		}
	};

	// Reference to prototype
	var p = SpriteSheet.prototype;

	/**
	 * Add the frames data
	 * @method _addFrames
	 * @private
	 * @param {Object} data The spritesheet to load
	 * @param {Array} data.images The collection of BaseTextures
	 * @param {Array} data.frames The collection of frames
	 */
	p._addFrames = function(data)
	{
		// Convert the frame into textures
		for(var frame, i = 0; i < data.frames.length; i++)
		{
			frame = data.frames[i];
			this.frames.push(new Texture(
				data.images[frame[4] || 0],
				new Rectangle(
					frame[0],
					frame[1],
					frame[2],
					frame[3]
				)
			));
		}
	};

	/**
	 * Get a frame of the spritesheet
	 * @method getFrame
	 * @param {int} index The index or frame to get
	 */
	p.getFrame = function(index)
	{
		return this.frames[index] || null;
	};

	/**
	 * Destroy the spritesheet
	 * @method destroy
	 */
	p.destroy = function()
	{
		if (this._id)
		{
			delete window.ss[this._id];
			this._id = null;
		}
		if (this.frames)
		{
			this.frames.forEach(function(frame)
			{
				frame.destroy(true);
			});
			this.frames = null;
		}
	};

	/**
	 * Get a frame of the spritesheet
	 * @method addToGlobal
	 * @param {String} id The id of the spritesheet
	 */
	p.addToGlobal = function(id)
	{
		// Make sure the global object is setup
		window.ss = window.ss || {};

		this._id = id;
		window.ss[id] = this;
	};

	/**
	 * Create a spritesheet
	 * @method fromData
	 * @static
	 * @param {Object} input The flash spritesheet data
	 * @param {function} Callback when complete
	 */
	SpriteSheet.fromData = function(input, done)
	{
		// Create a new spritesheet object
		var spriteSheet = new SpriteSheet();

		// Clone the data
		var data = {
			frames: input.frames.slice(),
			images: input.images.slice()
		};

		var id, loader = new Loader();

		// Add the images to the loader
		for(var file, i = 0; i < data.images.length; i++)
		{
			file = data.images[i];
			loader.add(file, file);
			
			// Get the first name and use as the global ID
			if (!id)
			{
				id = file;
				var index = id.indexOf('/');
				if (index > -1)
					id = file.substr(index + 1);
				id = id.substr(0, id.lastIndexOf('.'));
				spriteSheet.addToGlobal(id);
			}
		}

		// Load the images
		loader.once('complete', function(loader, resources)
		{
			// Replace the images paths with base textures
			for(var name in resources)
			{
				var i = data.images.indexOf(name);
				data.images[i] = resources[name].texture.baseTexture;
			}
			spriteSheet._addFrames(data);
			done(spriteSheet);
		});

		// Star the load
		loader.load();
	};

	// Assign to namespace
	pixiflash.SpriteSheet = SpriteSheet;

}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiSprite = PIXI.Sprite,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Sprite
	 * @class Sprite
	 * @extends PIXI.Sprite
	 */
	var Sprite = function()
	{
		PixiSprite.call(this);
		DisplayObject.call(this);

		/**
		 * The spritesheet to use
		 * @property {pixiflash.SpriteSheet} spriteSheet
		 */
		this.spriteSheet = null;
	};
	
	// Extend PIXI.Sprite
	var p = Sprite.prototype = Object.create(PixiSprite.prototype);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Sprite;

	/**
	 * Goto and stop on a frame
	 * @method gotoAndStop
	 * @param {int} frame The frame index
	 */
	p.gotoAndStop = function(frame)
	{
		//Due to the way Flash exports Sprites, we need to initialize each instance on the first
		//use here.
		if(!this._initialized)
		{
			var spriteSheet = this.spriteSheet;
			this.initialize();
			this.spriteSheet = spriteSheet;
			this._initialized = true;
		}
		if (!this.spriteSheet)
		{
			throw "Sprite doesn't have a spriteSheet";
		}
		this.texture = this.spriteSheet.getFrame(frame);
	};
	
	// Assign to namespace
	pixiflash.Sprite = Sprite;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiGraphics = PIXI.Graphics,
		utils = pixiflash.utils,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Graphics
	 * @class Graphics
	 * @extends PIXI.Graphics
	 * @constructor
	 */
	var Graphics = function()
	{
		PixiGraphics.call(this);
		DisplayObject.call(this);
	};

	// Extend PIXI.Sprite
	var s = PixiGraphics.prototype;
	var p = Graphics.prototype = Object.create(s);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Graphics;

	// Assign to namespace
	pixiflash.Graphics = Graphics;
	
	 /**
	 * Map of Base64 characters to values. Used by {{#crossLink "Graphics/decodePath"}}{{/crossLink}}.
	 * @property {Object} BASE_64
	 * @static
	 * @final
	 * @private
	 * @readonly
	 **/
	var BASE_64 = {
		"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,
		"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,
		"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,
		"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,
		"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,
		"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,
		"7":59,"8":60,"9":61,"+":62,"/":63
	};

	/**
	 * Moves the drawing point to the specified position. A tiny API method "mt" also exists.
	 * @method mt
	 * @param {Number} x The x coordinate the drawing point should move to.
	 * @param {Number} y The y coordinate the drawing point should move to.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls).
	 **/
	p.mt = p.moveTo;

	/**
	 * Draws a line from the current drawing point to the specified position, which become the new current drawing
	 * point. A tiny API method "lt" also exists.
	 *
	 * For detailed information, read the
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#complex-shapes-(paths)">
	 * whatwg spec</a>.
	 * @method lt
	 * @param {Number} x The x coordinate the drawing point should draw to.
	 * @param {Number} y The y coordinate the drawing point should draw to.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.lt = p.lineTo;

	/**
	 * Draws a bezier curve from the current drawing point to (x, y) using the control points (cp1x, cp1y) and (cp2x,
	 * cp2y). For detailed information, read the
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-beziercurveto">
	 * whatwg spec</a>. A tiny API method "bt" also exists.
	 * @method bt
	 * @param {Number} cp1x
	 * @param {Number} cp1y
	 * @param {Number} cp2x
	 * @param {Number} cp2y
	 * @param {Number} x
	 * @param {Number} y
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bt = p.bezierCurveTo;

	/**
	 * Shortcut to drawRect.
	 * @method dr
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	/**
	 * Shortcut to drawRect.
	 * @method r
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.dr = p.r = p.drawRect;

	/**
	 * Shortcut to drawRoundedRect.
	 * @method rr
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @param {Number} radius The corner radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.rr = p.drawRoundedRect;

	/**
	 * Shortcut to drawRoundRectComplex. Not supported by pixiflash
	 * @method rc
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w Width of the rectangle
	 * @param {Number} h Height of the rectangle
	 * @param {Number} radius The corner radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.rc = function(x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL)
	{
		if (true)
		{
			console.warn("Complex rounded rectangles not supported");
		}
		return this.rr(x, y, w, h, radiusTL);
	};

	/**
	 * Shortcut to drawCircle.
	 * @method dc
	 * @param {Number} x x coordinate center point of circle.
	 * @param {Number} y y coordinate center point of circle.
	 * @param {Number} radius Radius of circle.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.dc = p.drawCircle;

	/**
	 * Shortcut to arc.
	 * @method a
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 * @param {Number} startAngle Measured in radians.
	 * @param {Number} endAngle Measured in radians.
	 * @param {Boolean} anticlockwise
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @protected
	 * @chainable
	 **/
	p.a = p.arc;

	/**
	 * Shortcut to arcTo.
	 * @method at
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} radius
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 * @chainable
	 * @protected
	 **/
	p.at = p.arcTo;

	/**
	 * Override the draw ellipse method
	 * @method  de
	 * @param  {Number} x      [description]
	 * @param  {Number} y      [description]
	 * @param  {Number} width  [description]
	 * @param  {Number} height [description]
	 */
	p.de = function(x, y, width, height)
	{
		// Math conversion
		return this.drawEllipse(x + width / 2, y + height / 2, width / 2, height / 2);
	};

	/**
	 * Draws a quadratic curve from the current drawing point to (x, y) using the control point (cpx, cpy). For detailed
	 * information, read the <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-quadraticcurveto">
	 * whatwg spec</a>. A tiny API method "qt" also exists.
	 * @method qt
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.qt = function(cpx, cpy, x, y)
	{
		// Ensure that the draw shape is not closed
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = false;
		}
		return this.quadraticCurveTo(cpx, cpy, x, y);
	};

	/**
	 * Closes the current path, effectively drawing a line from the current drawing point to the first drawing point specified
	 * since the fill or stroke was last set. A tiny API method "cp" also exists.
	 * @method cp
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.cp = function()
	{
		var currentPath = this.currentPath;
		if (currentPath && currentPath.shape)
		{
			currentPath.shape.closed = true;
		}
		return this;
	};

	/**
	 * Begins a fill with the specified color. This ends the current sub-path. A tiny API method "f" also exists.
	 * @method f
	 * @param {String} color A CSS compatible color value (ex. "red", "#FF0000", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no fill.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.f = function(color)
	{
		if (color)
		{
			var rgb = utils.colorToHex(color);
			var a = alphaFromColor(color);
			this.beginFill(rgb, a);
		}
		return this;
	};
	
	/**
	 * Placeholder method for a linear fill. Pixi does not support linear fills,
	 * so we just pick the first color in colorArray
	 * @method lf
	 * @param {Array} colorArray An array of CSS compatible color values @see `f`
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.lf = function(colorArray)
	{
		if (true)
		{
			console.warn("Linear gradient fills are not supported");
		}
		return this.f(colorArray[0]);
	};

	/**
	 * Placeholder method for a radial fill. Pixi does not support radial fills,
	 * so we just pick the first color in colorArray
	 * @method rf
	 * @param {Array} colorArray An array of CSS compatible color values @see `f`
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.rf = function(colorArray)
	{
		if (true)
		{
			console.warn("Radial gradient fills are not supported");
		}
		return this.f(colorArray[0]);
	};

	/**
	 * Placeholder method for a beginBitmapFill. Pixi does not support bitmap fills.
	 * @method bf
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bf = function()
	{
		if (true)
		{
			console.warn("Bitmap fills are not supported");
		}
		return this.f("#000000");
	};

	/**
	 * Placeholder method for a setStrokeDash. Pixi does not support dashed strokes.
	 * @method sd
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.sd = function()
	{
		if (true)
		{
			console.warn("Dashed strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginBitmapStroke. Pixi does not support bitmap strokes.
	 * @method bs
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.bs = function()
	{
		if (true)
		{
			console.warn("Bitmap strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginLinearGradientStroke. Pixi does not support gradient strokes.
	 * @method ls
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.ls = function()
	{
		if (true)
		{
			console.warn("Linear gradient strokes are not supported");
		}
		return this;
	};

	/**
	 * Placeholder method for a beginRadialGradientStroke. Pixi does not support gradient strokes.
	 * @method rs
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.rs = function()
	{
		if (true)
		{
			console.warn("Radial gradient strokes are not supported");
		}
		return this;
	};

	/**
	 * Sets the stroke style. Like all drawing methods, this can be chained, so you can define
	 * the stroke style and color in a single line of code like so:
	 *
	 * 	myGraphics.setStrokeStyle(8,"round").beginStroke("#F00");
	 *
	 * A tiny API method "ss" also exists.
	 * @method ss
	 * @param {Number} thickness The width of the stroke.
	 * @param {String | Number} [caps=0] Indicates the type of caps to use at the end of lines. One of butt,
	 * round, or square. Defaults to "butt". Also accepts the values 0 (butt), 1 (round), and 2 (square) for use with
	 * the tiny API.
	 * @param {String | Number} [joints=0] Specifies the type of joints that should be used where two lines meet.
	 * One of bevel, round, or miter. Defaults to "miter". Also accepts the values 0 (miter), 1 (round), and 2 (bevel)
	 * for use with the tiny API.
	 * @param {Number} [miterLimit=10] If joints is set to "miter", then you can specify a miter limit ratio which
	 * controls at what point a mitered joint will be clipped.
	 * @param {Boolean} [ignoreScale=false] If true, the stroke will be drawn at the specified thickness regardless
	 * of active transformations.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.ss = function(thickness, caps, joints, miterLimit, ignoreScale)
	{
		this.lineWidth = thickness;
		return this;
	};

	/**
	 * Begins a stroke with the specified color. This ends the current sub-path. A tiny API method "s" also exists.
	 * @method s
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.s = function(color)
	{
		if (color)
		{
			this.lineColor = utils.colorToHex(color);
			this.lineAlpha = 1;
		}
		return this;
	};

	/**
	 * Decodes a compact encoded path string into a series of draw instructions.
	 * This format is not intended to be human readable, and is meant for use by authoring tools.
	 * The format uses a base64 character set, with each character representing 6 bits, to define a series of draw
	 * commands.
	 *
	 * Each command is comprised of a single "header" character followed by a variable number of alternating x and y
	 * position values. Reading the header bits from left to right (most to least significant): bits 1 to 3 specify the
	 * type of operation (0-moveTo, 1-lineTo, 2-quadraticCurveTo, 3-bezierCurveTo, 4-closePath, 5-7 unused). Bit 4
	 * indicates whether position values use 12 bits (2 characters) or 18 bits (3 characters), with a one indicating the
	 * latter. Bits 5 and 6 are currently unused.
	 *
	 * Following the header is a series of 0 (closePath), 2 (moveTo, lineTo), 4 (quadraticCurveTo), or 6 (bezierCurveTo)
	 * parameters. These parameters are alternating x/y positions represented by 2 or 3 characters (as indicated by the
	 * 4th bit in the command char). These characters consist of a 1 bit sign (1 is negative, 0 is positive), followed
	 * by an 11 (2 char) or 17 (3 char) bit integer value. All position values are in tenths of a pixel. Except in the
	 * case of move operations which are absolute, this value is a delta from the previous x or y position (as
	 * appropriate).
	 *
	 * For example, the string "A3cAAMAu4AAA" represents a line starting at -150,0 and ending at 150,0.
	 * <br />A - bits 000000. First 3 bits (000) indicate a moveTo operation. 4th bit (0) indicates 2 chars per
	 * parameter.
	 * <br />n0 - 110111011100. Absolute x position of -150.0px. First bit indicates a negative value, remaining bits
	 * indicate 1500 tenths of a pixel.
	 * <br />AA - 000000000000. Absolute y position of 0.
	 * <br />I - 001100. First 3 bits (001) indicate a lineTo operation. 4th bit (1) indicates 3 chars per parameter.
	 * <br />Au4 - 000000101110111000. An x delta of 300.0px, which is added to the previous x value of -150.0px to
	 * provide an absolute position of +150.0px.
	 * <br />AAA - 000000000000000000. A y delta value of 0.
	 *
	 * A tiny API method "p" also exists.
	 * @method p
	 * @param {String} str The path string to decode.
	 * @return {pixiflash.Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.p = function(str)
	{
		// Masking implentation doesn't call f(), must beginFill
		if (!this.filling)
		{
			this.beginFill();
		}
		var instructions = [
			this.mt,
			this.lt,
			this.qt,
			this.bt,
			this.cp
		];
		var paramCount = [2, 2, 4, 6, 0];
		var i=0, l=str.length;
		var params = [];
		var x=0, y=0;
		var base64 = BASE_64;

		while (i<l)
		{
			var c = str.charAt(i);
			var n = base64[c];
			var fi = n>>3; // highest order bits 1-3 code for operation.
			var f = instructions[fi];
			// check that we have a valid instruction & that the unused bits are empty:
			if (!f || (n&3)) { throw("bad path data (@"+i+"): "+c); }
			var pl = paramCount[fi];
			if (!fi) { x=y=0; } // move operations reset the position.
			params.length = 0;
			i++;
			var charCount = (n>>2&1)+2;  // 4th header bit indicates number size for this operation.
			for (var p=0; p<pl; p++)
			{
				var num = base64[str.charAt(i)];
				var sign = (num>>5) ? -1 : 1;
				num = ((num&31)<<6)|(base64[str.charAt(i+1)]);
				if (charCount == 3) { num = (num<<6)|(base64[str.charAt(i+2)]); }
				num = sign*num/10;
				if (p%2) { x = (num += x); }
				else { y = (num += y); }
				params[p] = num;
				i += charCount;
			}
			f.apply(this,params);
		}
		return this;
	};

	/**
	 * Get the alpha color from color string
	 * @method alphaFromColor
	 * @private
	 * @param {String} color
	 */
	var alphaFromColor = function(color)
	{
		if (/^rgba\(/.test(color))
		{
			return parseFloat(color.substring(
				color.lastIndexOf(',') + 1,
				color.lastIndexOf(')')
			));
		}
		return 1;
	};

}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var Container = PIXI.Container,
		Graphics = pixiflash.Graphics,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Shape
	 * @class Shape
	 * @extends PIXI.Container
	 */
	var Shape = function()
	{
		Container.call(this);
		DisplayObject.call(this);

		// Shapes have a graphic by default
		this.graphics = new Graphics();
	};

	// Extend PIXI.Sprite
	var s = Container.prototype;
	var p = Shape.prototype = Object.create(s);
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Shape;

	// Assign to namespace
	pixiflash.Shape = Shape;
	
	/**
	 * The drawing graphics, these are necessary
	 * for the compability with EaselJS Flash exports.
	 * @property {pixiflash.Graphics} graphics
	 */
	Object.defineProperty(p, "graphics",
	{
		get: function() 
		{
			return this._graphics; 
		},
		set: function(graphics)
		{
			if (this._graphics)
			{
				this.removeChild(this._graphics);
			}
			this._graphics = graphics;
			if (graphics)
			{
				this.addChild(graphics);
			}
			this.emit('graphicsChanged', this);
		}
	});

	/**
	 * Override for the destroy
	 * @method  destroy
	 * @param  {Boolean} recursive If we should destroy the children of this shape
	 */
	p.destroy = function(recursive)
	{
		this.graphics = null;
		s.destroy.call(this, recursive);
	};

}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	var PixiText = PIXI.Text,
		DisplayObject = pixiflash.DisplayObject;
	
	/**
	 * The class to emulate createjs.Text
	 * @class Text
	 * @extends PIXI.Text
	 */
	var Text = function(text, font, color)
	{
		PixiText.call(this, text, { 
			font: font, 
			fill: color,
			padding: 10 // so text doesn't get cut off
		});
		DisplayObject.call(this);
	};
	
	// Extend PIXI.Text
	var p = Text.prototype = Object.create(PixiText.prototype);

	Object.defineProperties(p, 
	{
		/**
		 * The text align
		 * @property {String} textAlign 
		 */
		textAlign: 
		{
			set: function(align)
			{
				if (align == "center")
					this.anchor.x = 0.5;
				else if (align == "right")
					this.anchor.x = 1;
				else 
					this.anchor.x = 0;

				this.style.align = align;
			}, 
			get: function()
			{
				return this.style.align;
			}
		},
		/**
		 * The text line height
		 * @property {Number} lineHeight 
		 */
		lineHeight: 
		{
			set: function(lineHeight)
			{
				this.style.lineHeight = lineHeight;
			},
			get: function()
			{
				return this.style.lineHeight;
			}
		},
		/**
		 * The text line width
		 * @property {Number} lineWidth 
		 */
		lineWidth: 
		{
			set: function(wordWrapWidth)
			{
				this.style.wordWrapWidth = wordWrapWidth;
			},
			get: function()
			{
				return this.style.wordWrapWidth;
			}
		},
		shadow: 
		{
			set: function(shadow)
			{
				this.style.dropShadow = !!shadow;
				if (shadow)
				{
					this.style.dropShadowColor = shadow.color;
					// CreateJS can't handle these
					// this.style.dropShadowAngle = shadow.angle;
					// this.style.dropShadowDistance = shadow.distance;
				}
			}
		}
	});
	
	// Mixin the display object
	DisplayObject.mixin(p);
	
	//constructor for backwards/Flash exporting compatibility
	p.initialize = Text;
	
	// Assign to namespace
	pixiflash.Text = Text;
	
}());
/**
 * @module Pixi Flash
 * @namespace pixiflash
 */
(function(undefined)
{
	// Import classes
	var utils = pixiflash.utils;

	/**
	 * The class to emulate createjs.Shadow
	 * @class Shadow
	 */
	var Shadow = function(color, x, y, blur)
	{
		this.color = color;
		// CreateJS export doesn't support these properties
		// this.angle = Math.atan(y / x);
		// this.distance = Math.sqrt(x * x + y * y);
		// this.blur = blur;
	};
	
	// Extend PIXI.Sprite
	var p = Shadow.prototype;
	
	// Assign to namespace
	pixiflash.Shadow = Shadow;
	
}());