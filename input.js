// Webitor
// Copyright © 2015 Carl Hewett

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

function addEventListeners() // Only called once
{
	mainCanvas.addEventListener("mousemove", mouseMoveEventHandler, false);
	mainCanvas.addEventListener("click", clickEventHandler, false);
	mainCanvas.addEventListener("contextmenu", rightClickEventHandler, false);
	
	document.addEventListener("mousedown", mouseDownEventHandler, false);
	document.addEventListener("mouseup", mouseUpEventHandler, false);

	mainCanvas.addEventListener("mousewheel", mouseWheelEventHandler, false);
	// Firefox
	mainCanvas.addEventListener("DOMMouseScroll", mouseWheelEventHandler, false);
	
	// On document
	document.addEventListener("keydown", keyDownEventHandler, false);
	document.addEventListener("keyup", keyUpEventHandler, false);
}

function mouseMoveEventHandler(e)
{
	var e = e || window.event;
	var currentTime = Date.now();
	
	if(currentTime>(inp.lastMouseMoveTime + c.mouseMoveThrottle))
	{
		inp.x = e.layerX;
		inp.y = e.layerY
		
		inp.lastMouseMoveTime = currentTime;
	}
}

function clickEventHandler(e)
{	
	inp.clickBuffer = true;
}

function rightClickEventHandler(e)
{
	inp.rightClick = true;
	event.preventDefault();
	
	return false;
}

function mouseDownEventHandler(e)
{
	var event = window.event || e;
	
	if(event.which==1 || event.button==0)
	{
		inp.mdown = true;
	}
}

function mouseUpEventHandler(e)
{
	var event = window.event || e;
	
	if(event.which==1 || event.button==0)
	{
		inp.mdown = false;
	}
}

function mouseWheelEventHandler(e)
{
	var event = window.event || e;
	var delta = Math.max(-1, Math.min(1, (event.wheelDelta || -event.detail)));
	
	inp.wheel = delta;
	event.preventDefault();
	
	return false;
}

function keyDownEventHandler(e)
{
	var event = e || window.event;
	var keyCode = event.keyCode || event.key;
	var currentKey;
	
	for(var i=0; i<c.numberOfInputKeys; i++)
	{
		currentKey = inp.keys[i];
		
		if(currentKey.keyCode==keyCode)
		{
			currentKey.s = true;
			
			if(currentKey.callback)
			{
				currentKey.callback();
			}
			break;
		}
	}
	
	event.preventDefault();
	return false;
}

function keyUpEventHandler(e)
{
	var event = e || window.event;
	var keyCode = event.keyCode || event.key;
	var currentKey;
	
	for(var i=0; i<c.numberOfInputKeys; i++)
	{
		currentKey = inp.keys[i];
		
		if(currentKey.keyCode==keyCode)
		{
			currentKey.s = false;
		}
	}
	
	event.preventDefault();
	return false;
}

function newInputKey(keyCode, callback)
{
	var tempObj = {};
	
	tempObj.keyCode = keyCode;
	tempObj.s = false; // State
	tempObj.newS = false;
	
	if(callback)
	{
		tempObj.callback = callback;
	}
	
	inp.keys.push(tempObj);
	
	return tempObj;
}

function checkForClick() // Do not call more than once per frame!
{
	if(inp.clickBuffer)
	{
		inp.clickBuffer = false;
		return true;
	} else
	{
		return false;
	}
}