// transform.js
// Copyright © 2014 Carl Hewett

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// 0: translation, 1: scaling, 2: rotation

// TODO: Remove ugly variables and replace them with a matrix: https://blog.safaribooksonline.com/2012/04/26/html5-canvas-games-tracking-transformation-matrices/

function addTransformMembers(context, width, height)
{
	context.width = width;
	context.height = height;
	
	context.transformSaves = [];
	
	setupTransform(context);
	
	context.$t = function(x, y, adjustViewable) // Translate
	{
		this.translate(x, y);
		
		if(adjustViewable==undefined)
		{
			adjustViewable = true;
		}
		
		getTransform(this, 0, adjustViewable, x, y);
	};
	
	context.$s = function(x, y, adjustViewable) // Scale
	{
		this.scale(x, y);
		
		if(adjustViewable==undefined)
		{
			adjustViewable = true;
		}
		
		getTransform(this, 1, adjustViewable, x, y);
	};
	
	context.$k = function() // Keeps (Saves)
	{
		this.save();
		
		this.transformSaves.push(getTransformSave(this));
	}
	
	context.$r = function(numberOfRestores) // Restore. Ex: ctx.$r(2) will restore() twice (argument not necessary, default 1)
	{
		var contextToRestore = this;
		var transformSavesLength = this.transformSaves.length;
		
		if(transformSavesLength>0)
		{
			if(numberOfRestores==undefined)
			{
				numberOfRestores = 1;
			
				contextToRestore.restore();
			} else
			{
				for(var i=0; i<numberOfRestores; i++)
				{
					contextToRestore.restore();
				}
			}
		
			restoreTransformSave(contextToRestore, numberOfRestores);
		}
	};
	
	context.$getRelativePoint = function(x, y) // Returns a new point using the transformations (useful for mouse movement) (point given in arguments is a point on the canvas)
	{
		var transform = this.transform;
		var pointX = (x / transform.scaling.x) + transform.viewable.x;
		var pointY = (y / transform.scaling.y) + transform.viewable.y;
		
		return {x:pointX, y:pointY};
	};
}

function setupTransform(context)
{
	context.transform = {};
	
	var transform = context.transform; // Objects passed by reference
	
	transform.translation = {};
	transform.scaling = {};
	transform.rotation = {};
	transform.viewable = {};
	
	transform.translation.x = 0;
	transform.translation.y = 0;
	transform.scaling.x = 1;
	transform.scaling.y = 1;
	transform.rotation.x = 0;
	transform.rotation.y = 0;
	
	transform.viewable.x = 0;
	transform.viewable.y = 0;
	transform.viewable.width = context.width;
	transform.viewable.height = context.height;
	transform.viewable.x2 = context.width; // X of the right side
	transform.viewable.y2 = context.height;
}

function getTransform(context, transformation, adjustViewable, x, y)// Doesn't return anything, changes context.transform
{
	var transform = context.transform;
	
	switch(transformation)
	{
		// Translation
		case 0:
			transform.translation.x += x;
			transform.translation.y += y;
			break;
		
		// Scaling
		case 1:
			transform.scaling.x *= x;
			transform.scaling.y *= y;
			break;
		
		// Rotation (TODO)
		case 2:
			transform.rotation.x += x;
			transform.rotation.y += y;
			break;
	}
	
	if(adjustViewable)
	{
		if(transformation==0) // Translation
		{
			transform.viewable.x -= x;
			transform.viewable.y -= y;
		} else if(transformation==1) // Scaling
		{
			transform.viewable.x /= x;
			transform.viewable.y /= y;
		}
		
		transform.viewable.width = context.width / transform.scaling.x;
		transform.viewable.height = context.height / transform.scaling.y;
		
		transform.viewable.x2 = transform.viewable.x + transform.viewable.width;
		transform.viewable.y2 = transform.viewable.y + transform.viewable.height;
	}
}

function getTransformSave(context)
{
	var transform = {};
	var transformToCopy = context.transform;
	
	// Seriously ugly
	transform.translation = {};
	transform.scaling = {};
	transform.rotation = {};
	transform.viewable = {};
	
	transform.translation.x = transformToCopy.translation.x;
	transform.translation.y = transformToCopy.translation.y;
	transform.scaling.x = transformToCopy.scaling.x;
	transform.scaling.y = transformToCopy.scaling.y;
	transform.rotation.x = transformToCopy.rotation.x;
	transform.rotation.y = transformToCopy.rotation.y;
	
	transform.viewable.x = transformToCopy.viewable.x;
	transform.viewable.y = transformToCopy.viewable.y;
	transform.viewable.width = transformToCopy.viewable.width;
	transform.viewable.height = transformToCopy.viewable.height;
	
	transform.viewable.x2 = transformToCopy.viewable.x2;
	transform.viewable.y2 = transformToCopy.viewable.y2;
	
	return transform; // copy(transform) or something (sorry, this is javascript)
}

function restoreTransformSave(context, numberOfSavesToBackup)
{
	var transformSavesLength = context.transformSaves.length;
	var lastTransformSaveIndex;
	
	if(transformSavesLength>0)
	{
		lastTransformSaveIndex = transformSavesLength - numberOfSavesToBackup;
		context.transform = context.transformSaves[lastTransformSaveIndex];
		
		context.transformSaves.splice(lastTransformSaveIndex, numberOfSavesToBackup); // Removes the last save, stack style
	}
}