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

function escapeMenu()
{
	if(m.location=="settings" || m.location=="manageteams")
	{
		changeMenuLocation("main");
	} else
	{
		changeMenuLocation("settings");
	}
}

function deleteSelected()
{
	var currentObject;
	var currentPoint;
	var objectRemoveLength;
	
	for(var i=ed.objects.length-1; i>=0; i--) // I can't go through selected points only. Inverted loop for spilcing nicely
	{
		currentObject = ed.objects[i];
		
		for(var j=currentObject.points.length-1; j>=0; j--)
		{
			currentPoint = currentObject.points[j];
			
			if(currentPoint.isSelected)
			{
				deselectPoint(j); // In case
				currentObject.points.splice(j, 1);
			}
		}
		
		switch(currentObject.type)
		{
			case "wall":
				objectRemoveLength = 1;
				break;
				
			case "speedzone":
				objectRemoveLength = 1;
				break;
				
			case "teleporter":
				objectRemoveLength = 1;
				break;
				
			case "textitem":
				objectRemoveLength = 1;
				break;
				
			case "loadoutzone":
				objectRemoveLength = 2;
				break;
				
			case "goalzone":
				objectRemoveLength = 2;
				break;
				
			case "slipzone":
				objectRemoveLength = 2;
				break;
				
			case "polywall":
				objectRemoveLength = 2;
				break;
				
			case "nexus":
				objectRemoveLength = 2;
				break;
				
			case "zone":
				objectRemoveLength = 2;
				break;
				
			default:
				objectRemoveLength = 0;
				break;
		}
				
		if(currentObject.points.length<=objectRemoveLength)
		{
			deselectPoints(currentObject.points); // In case
			ed.objects.splice(i, 1);
		}
	}
}

function changeCurrentTeam(keyNumber)
{
	var selectedObjects = getSelectedObjects();
	var team;
	
	if(keyNumber==0)
	{
		if(inp.shift.s)
		{
			team = c.hostileTeam;
		} else
		{
			team = c.neutralTeam;
		}
	} else
	{
		if(keyNumber>ed.info.teams.length)
		{
			keyNumber = ed.info.teams.length - 1;
		}
		
		team = ed.info.teams[keyNumber-1];
	}
	
	ed.currentTeam = team;
	
	for(var i=0, length=selectedObjects.length; i<length; i++)
	{
		selectedObjects[i].team = team;
	}
}

function getSelected()
{
	if(ed.selectedPoints.length>0)
	{
		var selectedObjects = getSelectedObjects();
		
		for(var i=0, length=selectedObjects.length; i<length; i++)
		{
			selectPoints(selectedObjects[i].points);
		}
		
		setDragging(ed.selectedPoints[0], true);
	}
}

function flipSelectedH()
{
	var numberOfPoints = ed.selectedPoints.length;
	var centerX = 0
	var currentPoint;
	
	for(var i=0; i<numberOfPoints; i++)
	{
		currentPoint = ed.selectedPoints[i];
		
		centerX += currentPoint.x;
	}
	
	centerX /= numberOfPoints;
	
	for(var i=0; i<numberOfPoints; i++)
	{
		currentPoint = ed.selectedPoints[i];
		
		currentPoint.x -= (currentPoint.x - centerX) + (currentPoint.x - centerX); // Optimized :)
	}
}

function flipSelectedVOrPaste()
{
	if(inp.ctrl.s)
	{
		paste(); // Same key as paste
	} else
	{
		var numberOfPoints = ed.selectedPoints.length;
		var centerY = 0
		var currentPoint;
		
		for(var i=0; i<numberOfPoints; i++)
		{
			currentPoint = ed.selectedPoints[i];
			
			centerY += currentPoint.y;
		}
		
		centerY /= numberOfPoints;
		
		for(var i=0; i<numberOfPoints; i++)
		{
			currentPoint = ed.selectedPoints[i];
			
			currentPoint.y -= (currentPoint.y - centerY) + (currentPoint.y - centerY); // Optimized :)
		}
	}
}

function rotateSelected()
{
	var angle = 22 * (Math.PI / 180);
	
	var center = centerPoint(ed.selectedPoints);
	
	for(var i=0, length=ed.selectedPoints.length; i<length; i++)
	{
		currentPoint = ed.selectedPoints[i];
		
		currentPoint.x = center.x + (currentPoint.x-center.x) * Math.cos(angle) - (currentPoint.y-center.y) * Math.sin(angle);
		currentPoint.y = center.y + (currentPoint.x-center.x) * Math.sin(angle) + (currentPoint.y-center.y) * Math.cos(angle);
	}
}

function scaleSelected()
{
	var factor = askUser("Scaling factor:", 2);
	var point;
	
	var center = centerPoint(ed.selectedPoints);
	
	if(validData(factor))
	{
		factor = parseFloat(factor);
	
		if(!isNaN(factor))
		{
			for(var i=0, length=ed.selectedPoints.length; i<length; i++)
			{
				point = ed.selectedPoints[i];
				
				point.x = Math.round((point.x - center.x) * factor); // Math.round() cleaner?
				point.y = Math.round((point.y - center.y) * factor);
			}
		}
	}
}

function editSelected()
{
	var selectedObjects = getSelectedObjects();
	var referenceObject = selectedObjects[0];
	var type = referenceObject.type; // Get an object type
	var dataText;
	var dataName;
	var dataIsNumber = false;
	
	var dataValue;
	var currentObject;
	
	switch(type)
	{
		case "wall":
			dataText = "Wall width:";
			dataName = "width";
			dataIsNumber = true;
			break;
		
		case "health":
			dataText = "Regen (seconds):";
			dataName = "regen";
			dataIsNumber = true;
			break;
			
		case "energy":
			dataText = "Regen (seconds):";
			dataName = "regen";
			dataIsNumber = true;
			break;
			
		case "speedzone":
			editSelectedSpeedZones();
			return;
			
		case "teleporter":
			dataText = "Delay:";
			dataName = "delay";
			dataIsNumber = true;
			break;
			
		case "textitem":
			dataText = "Text:";
			dataName = "text";
			break;
			
		case "flagspawn":
			dataText = "Respawn Timer:";
			dataName = "respawn";
			dataIsNumber = true;
			break;
			
		case "core":
			dataText = "Health:";
			dataName = "health";
			dataIsNumber = true;
			break;
			
		case "asteroid":
			dataText = "Size:";
			dataName = "size";
			dataIsNumber = true;
			break;
			
		case "asteroidspawn":
			dataText = "Respawn Timer:";
			dataName = "respawn";
			dataIsNumber = true;
			break;
			
		case "slipzone":
			dataText = "Friction:";
			dataName = "friction";
			dataIsNumber = true;
			break;
			
		case "zone":
			dataText = "Id:";
			dataName = "id";
			dataIsNumber = true;
			break;
		
		default:
			return;
	}
	
	dataValue = askUser(dataText, referenceObject[dataName], dataIsNumber);
	
	if(validData(dataValue))
	{
		for(var i=0, length=selectedObjects.length; i<length; i++)
		{
			currentObject = selectedObjects[i];
		
			if(currentObject.type==type)
			{
				currentObject[dataName] = dataValue;
			}
		}
	}
}

function editSelectedSpeedZones() // Had to :(
{
	var selectedObjects = getSelectedObjects();
	var referenceObject = selectedObjects[0];
	
	var speed = askUser("Speed:", referenceObject.speed, true);
	var snapEnabled = askUser("Enable snapping?");
	var rotation = askUser("Rotation:", referenceObject.rotation, true);
	
	var type = "speedzone";
	var currentObject;
		
	for(var i=0, length=selectedObjects.length; i<length; i++)
	{
		currentObject = selectedObjects[i];
	
		if(currentObject.type==type)
		{
			if(validData(speed))
			{
				currentObject.speed = speed;
			}
			
			currentObject.snapEnabled = snapEnabled;
			
			if(validData(rotation))
			{
				currentObject.rotation = rotation;
			}
		}
	}
}

function copySelected() // Copies the selected objects. If it is a wall, you can copy-paste areas of walls.
{
	if(inp.ctrl.s)
	{
		var selectedObjects = getSelectedObjects();
		var copiedObjects = [];
		
		for(var i=0, length=selectedObjects.length; i<length; i++)
		{
			copiedObjects.push(copyObject(selectedObjects[i], false));
		}
		
		if(copiedObjects.length>0) // If you copied by accident
		{
			ed.copiedObjects = copiedObjects; // Clears out old objects
		}
	}
}

function paste() // Pastes copied objects
{
	var object = false;
	
	deselectAllPoints();
	
	for(var i=0, length=ed.copiedObjects.length; i<length; i++)
	{
		object = ed.copiedObjects[i];
		
		addObjectToEditor(object);
		selectPoints(object.points);
	}
	
	if(object)
	{
		setDragging(object.points[0], true);
	}
	
	copySelected(); // Funny, huh? This makes sure you can paste these objects again
}