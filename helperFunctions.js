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

function error(error)
{
	console.error("ERROR:", error);
}

function validData(data)
{
	if(data==null || data===false)
	{
		return false;
	}
	
	return true;
}

function isFunction(obj) // http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
{
  return !!(obj && obj.constructor && obj.call && obj.apply);
}

function e2(value) // Exponent 2
{
	return value * value;
}

function randomInt(min, max) // Between min and max (exclusive)
{
	return Math.floor(Math.random() * (min - max + 1) + max);
}

function randomFloat(min, max) // Between min and max (exclusive)
{
	return Math.random() * (min - max + 1) + max;
}

// General purpose points
function p(x, y)
{
	return {x: x, y: y};
}

function cP(point)
{
	return {x: point.x, y: point.y};
}

// Editor points
function nPoint(x, y)
{
	return {x: x, y: y, isSelected: false};
}

function cPoint(pointToCopy)
{
	var point = {};
	
	point.x = pointToCopy.x;
	point.y = pointToCopy.y;
	
	if(pointToCopy.isSelected)
	{
		selectPoint(point);
	}
	
	return point;
}

function cPointArray(arrayOfPoints)
{
	var newArray = [];
	var currentPoint;
	
	for(var i=0, length=arrayOfPoints.length; i<length; i++)
	{
		currentPoint = arrayOfPoints[i];
		
		newArray.push(cPoint(currentPoint));
	}
	
	return newArray;
}

function centerPoint(arrayOfPoints)
{
	var numberOfPoints = arrayOfPoints.length;
	var center = nPoint(0, 0);
	var currentPoint;
	
	for(var i=0; i<numberOfPoints; i++)
	{
		currentPoint = arrayOfPoints[i];
		
		center.x += currentPoint.x;
		center.y += currentPoint.y;
	}
	
	center.x /= numberOfPoints;
	center.y /= numberOfPoints;
	
	return center;
}

function normalizeLineEndings(string)
{
	string.replace(/(rn|r|n)/g, c.lineEndings);
	return string;
}

function quoteText(text)
{
	return '"' + text + '"';
}

function parseSimpleTextDatabase(text) // Returns an array of line objects. Each of them contain .name (string) and .values (array of strings)
{
	var parsedText = [];
	var stringToParse = normalizeLineEndings(text) + c.lineEndings; // Adds new line for cleaner parsing
	
	var currentChar;
	var currentLineName;
	var currentLineValues = [];
	var currentWord = "";
	
	var inLineName = true;
	var inComment = false;
	
	var lineObject = {};
	
	for(var i=0, length=stringToParse.length; i<length; i++)
	{
		currentChar = stringToParse[i];
		
		if(inComment)
		{
			if(currentChar==c.lineEndings)
			{
				inComment = false;
			}
			
			continue;
		}
		
		switch(currentChar)
		{
			case c.lineEndings:
				if(inLineName) // Same as case " "
				{
					currentLineName = currentWord;
					
					inLineName = false;
				} else
				{
					currentLineValues.push(currentWord);
				}
				
				if(currentLineName!="")
				{
					lineObject = {};
					
					lineObject.name = currentLineName;
					lineObject.values = currentLineValues;
					
					parsedText.push(lineObject);
				}
				
				// Clean up
				currentLineValues = [];
				currentWord = "";
				inLineName = true;
				inComment = false;
				break;
			
			case " ":
				if(inLineName)
				{
					currentLineName = currentWord;
					
					inLineName = false;
				} else
				{
					currentLineValues.push(currentWord);
				}
				
				// Clean up
				currentWord = "";
				
				break;
			
			case "#": // Comments
				inComment = true;
				break;
			
			default:
				currentWord += currentChar;
				
				break;
		}
	}
	
	return parsedText;
}

function isInt(n) // http://stackoverflow.com/questions/3885817/how-to-check-if-a-number-is-float-or-integer
{
	return n % 1 === 0;
}

// Gets the next multiple of the value. If the lower flag is true, it will get the next multiple that is lower than the value. Rounds initial value
function getNextMultiple(value, multiple, lower)
{
	var newValue = 0;
	var step = 0;
	
	value = Math.round(value);
	
	if(value % multiple) // If it is NOT a multiple (has remainder)
	{
		if(lower)
		{
			step = -1;
		} else
		{
			step = 1;
		}
		
		for(var i=1; i<1000; i+=step) // i=0 already done
		{
			newValue = value + i;
			
			if(newValue % multiple==0) // If it IS a multiple (has no remainder)
			{
				return newValue;
			}
		}
		
		return 0; // Failed
	} else // Is a multiple
	{
		return value;
	}
}

function snapToGrid(point) // Ugliest code since IE. USES INP
{
	if(inp.space.s)
	{
		return cPoint(point); // Safe
	}
	
	// Return values
	var x = 0;
	var y = 0;
	
	var x1 = getNextMultiple(point.x, ed.currentGridSpacing, true);
	var x2 = getNextMultiple(point.x, ed.currentGridSpacing, false);
	var y1 = getNextMultiple(point.y, ed.currentGridSpacing, true);
	var y2 = getNextMultiple(point.y, ed.currentGridSpacing, false);
	
	if(ed.currentGridZoomedOut)
	{
		var centerX = (x1 + x2) / 2;
		var centerY = (y1 + y2) / 2;
		
		if(point.x-x1 > x2-point.x) // x2 is good
		{
			if(x2-point.x > point.x-centerX)
			{
				x = centerX;
			} else
			{
				x = x2;
			}
		} else // y1 is good
		{
			if(centerX-point.x > point.x-x1)
			{
				x = x1;
			} else
			{
				x = centerX;
			}
		}
		
		if(point.y-y1 > y2-point.y) // y2 is good
		{
			if(y2-point.y > point.y-centerY)
			{
				y = centerY;
			} else
			{
				y = y2;
			}
		} else // y1 is good
		{
			if(centerY-point.y > point.y-y1)
			{
				y = y1;
			} else
			{
				y = centerY;
			}
		}
	} else
	{
		if(point.x-x1 > x2-point.x)
		{
			x = x2;
		} else
		{
			x = x1;
		}
		
		if(point.y-y1 > y2-point.y)
		{
			y = y2;
		} else
		{
			y = y1;
		}
	}
	
	return nPoint(x, y);
}

function getSnappedPoint(point, arrayOfPoints)
{
	var snappedPoint = cP(arrayOfPoints[0]); // Get at least 1 point
	var currentPoint;
	
	for(var i=0, length=arrayOfPoints.length; i<length; i++)
	{
		currentPoint = arrayOfPoints[i];
		
		if(point.x-snappedPoint.x > point.x-currentPoint.x)
		{
			snappedPoint.x = currentPoint.x;
		}
		
		if(point.y-snappedPoint.y > point.y-currentPoint.y)
		{
			snappedPoint.y = currentPoint.y;
		}
	}
	
	return snappedPoint;
}

function isInRect(point, rect1, rect2)
{
	var prettyRect1 = nPoint(rect1.x, rect1.y);
	var prettyRect2 = nPoint(rect2.x, rect2.y);
	
	// Make them rect pretty. Rect1 will be upper left, Rect2, bottom right.
	if(rect2.x<=rect1.x)
	{
		prettyRect1.x = rect2.x;
		prettyRect2.x = rect1.x;
	}
	
	if(rect2.y<=rect1.y)
	{
		prettyRect1.y = rect2.y;
		prettyRect2.y = rect1.y;
	}
	
	if(point.x>prettyRect1.x && point.x<prettyRect2.x && point.y>prettyRect1.y && point.y<prettyRect2.y)
	{
		return true;
	}
	
	return false;
}

function isInSquare(point, sPoint, hSide) // Faster than pointIsInRect. Square point is in the middle of the square.
{
	if(point.x>sPoint.x-hSide && point.x<sPoint.x+hSide && point.y>sPoint.y-hSide && point.y<sPoint.y+hSide)
	{
		return true;
	}
	
	return false;
}

function isOnAPoint(point) // Check if a point is on an object's point. Returns the point it was on.
{
	var currentObject;
	var currentPoint;
	var unselectedPoint = false;
	
	for(var i=0, length=ed.objects.length; i<length; i++)
	{
		currentObject = ed.objects[i];
		
		for(var j=0, pLength=currentObject.points.length; j<pLength; j++)
		{
			currentPoint = currentObject.points[j];
			
			if(isInSquare(point, currentPoint, c.pointSquareSize))
			{
				if(currentPoint.isSelected)
				{
					return currentPoint;
				} else
				{
					unselectedPoint = currentPoint;
				}
			}
		}
	}
	
	return unselectedPoint;
}

function pointIsOnPoint(point1, point2)
{
	return isInSquare(point1, point2, c.pointSquareSize); // Works because all points are the same size
}

// Selection
function getSelectedPoints(mouse)
{
	var currentObject;
	var currentPoint;
	
	for(var i=0, length=ed.objects.length; i<length; i++)
	{
		currentObject = ed.objects[i];
		
		for(var j=0, pLength=currentObject.points.length; j<pLength; j++)
		{
			currentPoint = currentObject.points[j];
			
			if(isInRect(currentPoint, mouse, ed.dragSelectionCorner))
			{
				selectPoint(currentPoint);
			}
		}
	}
}

function selectPoint(point)
{
	if(!point.isSelected)
	{
		point.isSelected = true;
		ed.selectedPoints.push(point);
	}
}

function selectPoints(pointArray) // Selects an array of points
{
	for(var i=0, length=pointArray.length; i<length; i++)
	{
		selectPoint(pointArray[i]);
	}
}

function deselectPoint(point)
{
	var arrayIndex = ed.selectedPoints.indexOf(point);
	ed.selectedPoints.splice(arrayIndex, 1);
	point.isSelected = false;
}

function deselectPoints(points)
{
	for(var i=0, length=points.length; i<length; i++)
	{
		deselectPoint(points[i]);
	}
}

function deselectAllPoints()
{
	for(var i=0, length=ed.selectedPoints.length; i<length; i++)
	{
		ed.selectedPoints[i].isSelected = false;
	}
	
	ed.selectedPoints = [];
}

function getSelectedObjects() // Returns objects that have at least 1 point selected
{
	var selectedObjects = [];
	var currentObject;
	var currentPoint;
	
	for(var i=0, length=ed.objects.length; i<length; i++)
	{
		currentObject = ed.objects[i];
		
		for(var j=0, jLength=currentObject.points.length; j<jLength; j++)
		{
			currentPoint = currentObject.points[j];
			
			if(currentPoint.isSelected)
			{
				selectedObjects.push(currentObject);
				break;
			}
		}
	}
	
	return selectedObjects;
}

function getStringFromColor(color)
{
	return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
}

function getColorStringFromTeam(team)
{
	var color;
	
	if(team==c.neutralTeam)
	{
		color = c.neutralColor;
	} else if(team==c.hostileTeam)
	{
		color = c.hostileColor;
	} else
	{
		color = getStringFromColor(team.color)
	}
	
	return color;
}

function getLevelFileColor(color) // From based 255 to based 1 ([0, 1])
{
	var base = c.colorBase;
	var numberOfDecimals = 2;
	
	return newColor(roundToDecimal(color.r / base, numberOfDecimals), roundToDecimal(color.g / base, numberOfDecimals), roundToDecimal(color.b / base, numberOfDecimals)); // Rounds to 2 decimals
}

function getCurrentTeamColor()
{
	return getColorStringFromTeam(ed.currentTeam);
}

function getTextItemSize(textItem)
{
	var point1 = textItem.points[0];
	var point2 = textItem.points[1];
	var distance = Math.sqrt(e2(point2.x - point1.x) + e2(point2.y - point1.y));
	
	return distance / 8; // Kind of
}

function roundToDecimal(value, numberOfDecimals)
{
	var decimal = Math.pow(10, numberOfDecimals);
	
	return Math.floor(value * decimal) / decimal;
}

function downloadBlobAsTextFile(blob, fileName) // Cool, from http://stackoverflow.com/questions/19327749/javascript-blob-filename-without-link
{
	var link = document.createElement("a");
	var url = window.URL.createObjectURL(blob);
	
	document.body.appendChild(link);
	link.style = "display: none";
	link.href = url;
	link.download = fileName;
	link.click();
	
	window.URL.revokeObjectURL(url);
	document.body.removeChild(link); // Cleaner?
}

function askUser(question, defaultValue, isANumber) // If defaultValue is not defined, it will be a confirm()
{
	var value;
	
	if(defaultValue==null)
	{
		value = confirm(question);
	} else
	{
		value = prompt(question, defaultValue);
		
		if(value!=null)
		{
			if(isANumber)
			{
				value = parseInt(value);
		
				if(isNaN(value))
				{
					value = false;
				}
			}
		} else
		{
			value = false;
		}
	}
	
	return value;
}