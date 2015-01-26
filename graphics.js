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

function addGraphicMembers(context)
{
	addTransformMembers(context, c.canWidth, c.canHeight);
	
	context.drawString = function(stringToDraw, stringY)
	{
		this.fillText(stringToDraw, 20, stringY);
	};
	
	context.drawCenteredString = function(string, x, y, stringLength)
	{
		var halfStringLength;
		
		if(validData(stringLength))
		{
			halfStringLength = stringLength / 2;
		} else
		{
			halfStringLength = this.measureText(string).width / 2;
		}
		
		this.fillText(string, x - halfStringLength, y);
	};
	
	context.drawCircle = function(x, y, radius, filled)
	{
		this.beginPath();
		this.arc(x, y, radius, 0, Math.TAU, true);
		
		if(filled)
		{
			this.fill();
		} else
		{
			this.stroke();
		}
	};
	
	context.drawCircleWithOutline = function(x, y, radius)
	{
		this.beginPath();
		this.arc(x, y, radius, 0, Math.TAU, true);
		
		this.fill();
		this.stroke();
	};
	
	context.fillLayer = function()
	{
		var viewable = this.transform.viewable;
		this.fillRect(viewable.x, viewable.y, viewable.width, viewable.height);
	};
	
	context.clearLayer = function()
	{
		var viewable = this.transform.viewable;
		this.clearRect(viewable.x, viewable.y, viewable.width, viewable.height);
	};
}

function basicGraphics(layer)
{
	layer.fillStyle = "black";
	layer.fillLayer();
}

function setupMainGraphicsLayer(layer)
{
	fg.$t(c.hCanWidth, c.hCanHeight);
	fg.lineJoin = c.defaultLineJoin;
	
	fg.$k();
}

function clearLayers()
{
	for(var i=0, length=canvasContexts.length; i<length; i++)
	{
		canvasContexts[i].clearLayer();
	}
}

function drawGrid(layer, gridSpacing, dark)
{
	var viewable = layer.transform.viewable;
	var startingValue;
	var changingValue; // Calculated value, wither x or y
	
	if(dark)
	{
		layer.strokeStyle = "rgb(50, 50, 50)";
	} else
	{
		layer.strokeStyle = "grey";
	}
	
	layer.fillStyle = "grey";
	layer.font = c.mainTextFont;
	layer.lineWidth = c.defaultLineWidth;
	
	layer.beginPath();
	
	startingValue = getNextMultiple(viewable.x, gridSpacing);
	
	for(var i=0; i<viewable.width; i++) // Vertical lines
	{
		changingValue = (i * gridSpacing) + startingValue;
		
		if(changingValue>viewable.x2)
		{
			break;
		}

		layer.moveTo(changingValue, viewable.y);
		layer.lineTo(changingValue, viewable.y2);
	}
	
	startingValue = getNextMultiple(viewable.y, gridSpacing);
	
	for(var i=0; i<viewable.height; i++) // viewable.height to make sure it isn't infinite (it will always finish before reaching it)
	{
		changingValue = (i * gridSpacing) + startingValue; // Vertical
		
		if(changingValue>viewable.y2)
		{
			break;
		}
		
		layer.moveTo(viewable.x, changingValue);
		layer.lineTo(viewable.x2, changingValue);
	}
	
	layer.stroke();
	drawOriginInfo(layer);
}

function drawOriginInfo(layer)
{
	var viewable = layer.transform.viewable;
	
	layer.fillStyle = "white";
	layer.strokeStyle = "rgb(200, 200, 200)";
	
	layer.beginPath();
	layer.moveTo(viewable.x, 0); // Horizonatl
	layer.lineTo(viewable.x2, 0);
	
	layer.moveTo(0, viewable.y); // Vertical
	layer.lineTo(0, viewable.y2);
	layer.stroke();
	
	layer.fillText("0", 0, viewable.y+20);
	layer.fillText("0", viewable.x, 0);
}

function getRectPath(layer, x, y, width, height)
{
	layer.moveTo(x, y);
	layer.lineTo(x + width, y);
	layer.lineTo(x + width, y + height);
	layer.lineTo(x, y + height);
	layer.closePath();
}

function getSquarePath(layer, x, y, size)
{
	var dSize = size + size;
	getRectPath(layer, x - size, y - size, dSize , dSize);
}

function drawMainEditor(layer) // USES INP
{
	if(inp.tab.s)
	{
		var mouse = layer.$getRelativePoint(inp.x, inp.y);
		
		drawObjects(layer, true);
		
		drawShipViewable(layer, mouse, "rgba(255, 0, 0, 0.5)")
		drawShip(layer, mouse, "red", true);
	} else
	{
		if(inp.space.s)
		{
			drawGrid(layer, ed.currentGridSpacing, true);
		} else
		{
			drawGrid(layer, ed.currentGridSpacing, false);
		}
		
		drawObjects(layer, false);
	}
}

function drawObjects(layer, gameGraphics) // If gameGraphics is true, it will draw game graphics
{
	var objectsLength = ed.objects.length;
	var objectTeamColor;
	var currentObject;
	
	for(var i=0; i<objectsLength; i++)
	{
		currentObject = ed.objects[i];
		objectTeamColor = getColorStringFromTeam(currentObject.team);
		
		switch(currentObject.type)
		{
			case "wall":
				drawWall(layer, currentObject, gameGraphics);
				break;
				
			case "spawn":
				if(!gameGraphics)
				{
					layer.fillStyle = objectTeamColor;
					drawSimpleObject(layer, currentObject, "S", gameGraphics);
				}
				break;
				
			case "health":
				layer.fillStyle = "red";
				drawSimpleObject(layer, currentObject, "H", gameGraphics);
				break;
				
			case "energy":
				layer.fillStyle = "orange";
				drawSimpleObject(layer, currentObject, "E", gameGraphics);
				break;
				
			case "speedzone":
				drawSpeedZone(layer, currentObject, gameGraphics);
				break;
				
			case "teleporter":
				drawTeleporter(layer, currentObject, gameGraphics);
				break;
				
			case "textitem":
				drawTextItem(layer, currentObject, gameGraphics);
				break;
				
			case "flag":
				drawFlag(layer, currentObject, gameGraphics);
				break;
				
			case "flagspawn":
				if(!gameGraphics)
				{
					drawFlag(layer, currentObject, gameGraphics, true);
				}
				break;
				
			case "soccer":
				drawSoccer(layer, currentObject, gameGraphics);
				break;
				
			case "core":
				drawCore(layer, currentObject, gameGraphics);
				break;
				
			case "mine":
				drawMine(layer, currentObject, gameGraphics);
				break;
				
			case "spybug":
				drawSpybug(layer, currentObject, gameGraphics);
				break;
				
			case "asteroid":
				layer.fillStyle = "grey";
				drawSimpleObject(layer, currentObject, "A", gameGraphics);
				break;
				
			case "asteroidspawn":
				if(!gameGraphics)
				{
					var point = currentObject.points[0];
					layer.fillStyle = "grey";
					
					drawSimpleObject(layer, currentObject, "A", gameGraphics);
					layer.lineWidth = c.defaultLineWidth;
					layer.strokeStyle = "white";
					layer.drawCircle(point.x, point.y, 50, false);
				}
				
				break;
				
			case "testitem":
				drawTestItem(layer, currentObject, gameGraphics);
				break;
				
			case "resourceitem":
				drawResourceItem(layer, currentObject, gameGraphics);
				break;
				
			case "ghostship":
				drawShip(layer, currentObject.points[0], "white", gameGraphics);
				break;
				
			case "loadoutzone":
				drawZone(layer, currentObject, objectTeamColor, "LoadoutZone", gameGraphics);
				break;
				
			case "goalzone":
				drawZone(layer, currentObject, objectTeamColor, "GoalZone", gameGraphics);
				break;
				
			case "slipzone":
				drawZone(layer, currentObject, "green", "Slip!", gameGraphics);
				break;
				
			case "polywall":
				drawZone(layer, currentObject, "blue", "", gameGraphics);
				break;
				
			case "nexus":
				drawZone(layer, currentObject, "orange", "Nexus", gameGraphics);
				break;
				
			case "zone":
				if(!gameGraphics)
				{
					drawZone(layer, currentObject, "rgb(200, 200, 200)", "", gameGraphics);
				}
				break;
		}
	}
	
	drawPoints(layer, ed.currentWallPoints);
	drawDragSelection(layer);
}

function drawShipViewable(layer, point, color)
{
	var width = 800;
	var height = 600;
	var hWidth = 400;
	var hHeight = 300;
	
	layer.fillStyle = color;
	layer.fillRect(point.x - hWidth, point.y - hHeight, width, height);
}

function drawShip(layer, point, color, gameGraphics)
{
	var shipSize = 25;
	layer.strokeStyle = color;
	layer.lineWidth = 2;
	
	layer.beginPath();
	
	layer.moveTo(point.x-shipSize, point.y+shipSize);
	layer.lineTo(point.x+shipSize, point.y+shipSize);
	layer.lineTo(point.x, point.y-shipSize);
	layer.closePath();
	
	layer.stroke();
	
	if(!gameGraphics)
	{
		drawPoints(layer, [point]); // This needs an array
	}
}

// Editor Objects
function drawWall(layer, wall, gameGraphics)
{
	var wallLength = wall.points.length;
	var currentPoint;
	
	if(wallLength>0)
	{
		layer.strokeStyle ="blue";
		layer.lineWidth = wall.width;
		layer.beginPath();
		layer.moveTo(wall.points[0].x, wall.points[0].y);
	
		for(var i=1; i<wallLength; i++) // 1=0 because i=0 done before
		{
			currentPoint = wall.points[i];
			
			layer.lineTo(currentPoint.x, currentPoint.y);
		}
	
		layer.stroke();
		
		if(!gameGraphics)
		{
			drawPoints(layer, wall.points); // Not optimized?
		}
	}
}

function drawSpeedZone(layer, speedZone, gameGraphics)
{
	var firstPoint = speedZone.points[0];
	var secondPoint = speedZone.points[1];
	var currentPoint;
	
	layer.strokeStyle ="red";
	layer.lineWidth = 3;
	layer.beginPath();
	
	layer.moveTo(firstPoint.x, firstPoint.y);
	layer.lineTo(secondPoint.x, secondPoint.y);
	getSquarePath(layer, firstPoint.x, firstPoint.y, 10);
	
	layer.stroke();
	
	if(!gameGraphics)
	{
		drawPoints(layer, speedZone.points); // Not optimized?
	}
}

function drawTeleporter(layer, teleporter, gameGraphics)
{
	var firstPoint = teleporter.points[0];
	var secondPoint = teleporter.points[1];
	var currentPoint;
	
	layer.strokeStyle ="green";
	layer.lineWidth = 3;
	layer.beginPath();

	layer.moveTo(firstPoint.x, firstPoint.y);
	layer.lineTo(secondPoint.x, secondPoint.y);
	layer.stroke();
	
	layer.drawCircle(firstPoint.x, firstPoint.y, 75, false);
	
	if(!gameGraphics)
	{
		drawPoints(layer, teleporter.points); // Not optimized?
	}
}

function drawTextItem(layer, textItem, gameGraphics) // Not fast!
{
	var firstPoint = textItem.points[0];
	var secondPoint = textItem.points[1];
	var currentPoint;
	var color = getColorStringFromTeam(textItem.team);
	
	var centerX = (firstPoint.x + secondPoint.x) / 2;
	var centerY = (firstPoint.y + secondPoint.y) / 2;
	
	layer.strokeStyle = color;
	layer.fillStyle = color;
	layer.font = getTextItemSize(textItem) + "px Arial";
	
	layer.lineWidth = 3;
	layer.beginPath();

	layer.moveTo(firstPoint.x, firstPoint.y);
	layer.lineTo(secondPoint.x, secondPoint.y);
	getSquarePath(layer, firstPoint.x, firstPoint.y, 10);
	
	layer.stroke();
	
	layer.drawCenteredString(textItem.text, centerX, centerY);
	
	if(!gameGraphics)
	{
		drawPoints(layer, textItem.points); // Not optimized?
	}
}

function drawFlag(layer, flag, gameGraphics, isSpawn)
{
	var teamColor = getColorStringFromTeam(flag.team);
	var point = flag.points[0];
	var flagSize = 15;
	var halfFlagSize = flagSize / 2;
	var thirdFlagSize = flagSize / 3;
	
	layer.lineWidth = 1;
	layer.strokeStyle = "white";
	
	layer.beginPath();
	layer.moveTo(point.x - flagSize, point.y - flagSize); // Stick
	layer.lineTo(point.x - flagSize, point.y + flagSize);
	layer.stroke();
	
	layer.strokeStyle = teamColor;
	layer.beginPath();
	
	layer.moveTo(point.x - flagSize, point.y - flagSize);
	layer.lineTo(point.x + flagSize, point.y - thirdFlagSize); // Stick
	layer.lineTo(point.x - flagSize, point.y + thirdFlagSize); // Stick
	
	layer.moveTo(point.x - flagSize, point.y - flagSize + thirdFlagSize);
	layer.lineTo(point.x + flagSize - halfFlagSize, point.y - thirdFlagSize);
	layer.lineTo(point.x - flagSize, point.y);
	
	layer.stroke();
	
	if(isSpawn)
	{
		layer.drawCircle(point.x, point.y, flagSize + halfFlagSize, false);
	}
	
	if(!gameGraphics)
	{
		drawPoints(layer, flag.points);
	}
}

function drawSoccer(layer, soccer, gameGraphics)
{
	var point = soccer.points[0];
	
	layer.lineWidth = c.defaultLineWidth;
	layer.strokeStyle = "white";
	layer.drawCircle(point.x, point.y, 28, false);
	
	if(!gameGraphics)
	{
		drawPoints(layer, soccer.points);
	}
}

function drawCore(layer, core, gameGraphics)
{
	var point = core.points[0];
	var color = getColorStringFromTeam(core.team);
	
	layer.lineWidth = c.defaultLineWidth;
	layer.strokeStyle = "white";
	layer.drawCircle(point.x, point.y, 95, false);
	
	layer.strokeStyle = color;
	layer.drawCircle(point.x, point.y, 37, false);
	
	if(!gameGraphics)
	{
		drawPoints(layer, core.points);
	}
}

function drawMine(layer, mine, gameGraphics)
{
	var point = mine.points[0];
	
	layer.lineWidth = c.defaultLineWidth;
	layer.strokeStyle = "white";
	
	layer.drawCircle(point.x, point.y, 50, false);
	layer.drawCircle(point.x, point.y, 10, false);
	
	layer.strokeStyle = "red";
	layer.drawCircle(point.x, point.y, 6, false);
	
	if(!gameGraphics)
	{
		drawPoints(layer, mine.points);
	}
}

function drawSpybug(layer, spybug, gameGraphics)
{
	var point = spybug.points[0];
	var teamColor = getColorStringFromTeam(spybug.team);
	
	layer.fillStyle = teamColor;
	layer.font = "15px Arial";
	
	layer.drawCircle(point.x, point.y, 12, true);
	
	layer.fillStyle = "white";
	layer.drawCenteredString("SB", point.x, point.y + 5);
	
	if(!gameGraphics)
	{
		drawPoints(layer, spybug.points);
	}
}

function drawTestItem(layer, testItem, gameGraphics)
{
	var point = testItem.points[0];
	
	layer.lineWidth = c.defaultLineWidth;
	layer.strokeStyle = "yellow";
	layer.drawCircle(point.x, point.y, 55, false);
	
	if(!gameGraphics)
	{
		drawPoints(layer, testItem.points);
	}
}

function drawResourceItem(layer, resourceItem, gameGraphics)
{
	var point = resourceItem.points[0];
	var resourceSize = 20
	var resourceCorners = 8;
	
	layer.lineWidth = c.defaultLineWidth;
	layer.strokeStyle = "white";
	
	layer.beginPath();
	layer.moveTo(point.x - resourceSize, point.y);
	
	layer.lineTo(point.x - resourceCorners, point.y - resourceCorners);
	layer.lineTo(point.x, point.y - resourceSize);
	layer.lineTo(point.x + resourceCorners, point.y - resourceCorners);
	layer.lineTo(point.x + resourceSize, point.y);
	layer.lineTo(point.x + resourceCorners, point.y + resourceCorners);
	layer.lineTo(point.x, point.y + resourceSize);
	layer.lineTo(point.x - resourceCorners, point.y + resourceCorners);
	layer.closePath();
	
	layer.stroke();
	
	if(!gameGraphics)
	{
		drawPoints(layer, resourceItem.points);
	}
}

function drawZone(layer, zone, color, symbol, gameGraphics)
{
	var zoneLength = zone.points.length;
	var currentPoint;
	var symbolYOffset = 9;
	
	if(zoneLength>0)
	{
		layer.fillStyle = color;
		layer.beginPath();
		layer.moveTo(zone.points[0].x, zone.points[0].y);
	
		for(var i=1; i<zoneLength; i++) // 1=0 because i=0 done before
		{
			currentPoint = zone.points[i];
			
			layer.lineTo(currentPoint.x, currentPoint.y);
		}
	
		layer.fill();
		
		if(symbol!="")
		{
			var center = centerPoint(zone.points);
			
			layer.fillStyle = "grey";
			layer.font = "25px Arial";
			layer.drawCenteredString(symbol, center.x, center.y + symbolYOffset);
		}
		
		if(!gameGraphics)
		{
			drawPoints(layer, zone.points, true); // Not optimized?
		}
	}
}

function drawSimpleObject(layer, object, symbol, gameGraphics) // Uses fillStyle
{
	var size = 25;
	var size2 = size + size;
	var point = object.points[0];
	var symbolYOffset = 13; // Guessed this with 15px Arial
	
	layer.fillRect(point.x - size, point.y - size, size2, size2);
	
	if(symbol!="")
	{
		layer.fillStyle = "white";
		layer.font = "35px Arial";
		layer.drawCenteredString(symbol, point.x, point.y + symbolYOffset); // To heavy?
	}
	
	if(!gameGraphics)
	{
		drawPoints(layer, object.points);
	}
}

/*function drawSelected(layer, selected) // Not really used yet
{
	var currentPoint;

	layer.strokeStyle ="yellow";
	layer.lineWidth = c.defaultLineWidth;
	layer.beginPath();
	layer.moveTo(selected.points[0].x, selected.points[0].y);

	for(var i=1, length=selected.points.length; i<length; i++) // 1=0 because i=0 done before
	{
		currentPoint = selected.points[i];
		
		layer.lineTo(currentPoint.x, currentPoint.y);
	}

	layer.stroke();
}*/

function drawPoints(layer, points, close) // Draws an array of points, used with walls and others
{
	var squareSize = c.pointSquareSize;
	var squareSize2 = squareSize + squareSize;
	var currentPoint = points[0];
	
	if(points.length>0)
	{
		layer.strokeStyle ="yellow";
		layer.fillStyle = "rgba(0, 255, 0, 0.7)";
		layer.lineWidth = c.defaultLineWidth;
		layer.beginPath();
		
		if(points.length==1) // Optimizations
		{
			var square = getSquarePath(layer, currentPoint.x, currentPoint.y, squareSize);
			layer.stroke();
			
			if(currentPoint.isSelected)
			{
				layer.fill();
			}
		} else if(points.length>1)
		{
			layer.beginPath();
			
			getSquarePath(layer, currentPoint.x, currentPoint.y, squareSize);
			layer.moveTo(currentPoint.x, currentPoint.y);
			
			if(currentPoint.isSelected)
			{
				layer.fillRect(currentPoint.x - squareSize, currentPoint.y - squareSize, squareSize2, squareSize2);
			}
			
			for(var i=1, length=points.length; i<length; i++) // 1=0 because i=0 done before
			{
				currentPoint = points[i];
				
				layer.lineTo(currentPoint.x, currentPoint.y);
				
				getSquarePath(layer, currentPoint.x, currentPoint.y, squareSize);
				layer.moveTo(currentPoint.x, currentPoint.y);
				
				if(currentPoint.isSelected)
				{
					layer.fillRect(currentPoint.x - squareSize, currentPoint.y - squareSize, squareSize2, squareSize2);
				}
			}

			if(close)
			{
				layer.moveTo(currentPoint.x, currentPoint.y); // currentPoint holds the last point
				layer.lineTo(points[0].x, points[0].y);
			}
			
			layer.stroke();
		}
	}
}

function drawDragSelection(layer)
{
	if(ed.dragSelectionCorner)
	{
		var relativeMouse = layer.$getRelativePoint(inp.x, inp.y);
		var width = relativeMouse.x - ed.dragSelectionCorner.x;
		var height = relativeMouse.y - ed.dragSelectionCorner.y;
		
		layer.strokeStyle = "yellow";
		layer.lineWidth = c.defaultLineWidth;
	
		layer.strokeRect(ed.dragSelectionCorner.x, ed.dragSelectionCorner.y, width, height);
	}
}

function drawFancyOverlay(layer)
{
	drawMainEditor(layer);
	
	layer.fillStyle = "rgba(0, 0, 0, 0.5)";
	layer.fillLayer();
}

// Menu
function drawSettings(layer)
{
	layer.font = "40px Arial";
	layer.fillStyle = "lime";
	
	layer.drawCenteredString("Level Settings", c.hCanWidth, 80);
	handleMenuButtons(layer, m.settingsButtons, c.hCanWidth);
}

function drawManageTeams(layer)
{
	var currentTeam;
	var lineX = 50;
	var lineLength = c.canWidth - lineX;
	
	var lineY;
	
	layer.font = "40px Arial";
	layer.fillStyle = "lime";
	layer.drawCenteredString("Teams", c.hCanWidth, 80);
	
	// Teams
	layer.font = "20px Arial";
	layer.strokeStyle = "white";
	layer.beginPath();
	
	for(var i=0, length=ed.info.teams.length; i<length; i++)
	{
		currentTeam = ed.info.teams[i];
		lineY = (c.manageTeamsLineSeparation * i) + c.manageTeamsStartingY;
		
		if(i!=0) // Not first team (line over teams)
		{
			layer.moveTo(lineX, lineY);
			layer.lineTo(lineLength, lineY);
		}
		
		layer.fillStyle = getStringFromColor(currentTeam.color);
		layer.drawCenteredString(currentTeam.name, c.hCanWidth, lineY + c.manageTeamsYNameOffset);
	}
	
	layer.stroke();
	
	handleMenuButtons(layer, m.manageTeamsButtons, c.hCanWidth);
	handleMenuButtons(layer, m.dynamicTeamButtons, c.manageTeamsButtonsX);
}

// UI
function drawUI(layer)
{
	var x = c.UiX - (c.canWidth - c.UiX);
	var width = c.canWidth - x;
	var height = c.canHeight;
	
	layer.fillStyle = "rgba(255, 0, 0, 0.5)";
	layer.strokeStyle = "yellow";
	layer.lineWidth = c.defaultLineWidth;
	
	layer.beginPath();
	getRectPath(layer, x, 0, width, height)
	layer.fill();
	layer.stroke();
	
	handleMenuButtons(layer, m.mainUIButtons, c.UiX);
}