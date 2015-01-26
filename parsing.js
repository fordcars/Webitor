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

function getDefaultLeveInfo()
{
	var info = {};

	info.gameType = "GameType";
	info.score = 8;
	info.time = 10;
	info.name = "Level name";
	info.description = "Level description";
	
	if(ed.username)
	{
		info.credits = ed.username;
	} else
	{
		info.credits = "UnknownAuthor";
	}
	
	info.gridSize = 255; // Always this I believe
	info.teams = [newTeam("Blue", newColor(0, 0, 255)), newTeam("Red", newColor(255, 0, 0))];
	info.specials = "";
	info.minPlayers = "";
	info.maxPlayers = "";
	
	info.format = 2; // For Bitfighter parsing, 2 uses real points as coords, without transformations
	
	return info;
}

function newColor(r, g, b) // 255-based! ([0, 255] for each color)
{
	return {r: r, g: g, b: b};
}

function newTeam(name, color)
{
	return {name: name, color: color};
}

function getLevelTeamIndex(team)
{
	if(team!=c.neutralTeam && team!=c.hostileTeam)
	{
		return ed.info.teams.indexOf(team) + c.teamBase;
	} else
	{
		return team;
	}
}

function getLevelString()
{
	var levelString = getLevelHeader() + getLevelObjects();
	return levelString;
}

function getLine(values) // Gets a line from an array, spaces between values
{
	var line = "";

	for(var i=0, length=values.length; i<length; i++)
	{
		if(i==0)
		{
			line += values[i];
		} else
		{
			line += " " + values[i];
		}
	}
	
	return line;
}

function getLineArrayFromPointsArray(pointsArray) // Separates x and y
{
	var lineArray = [];
	var currentPoint;
	
	for(var i=0, length=pointsArray.length; i<length; i++)
	{
		currentPoint = pointsArray[i];
		
		lineArray.push(currentPoint.x);
		lineArray.push(currentPoint.y);
	}
	
	return lineArray;
}

function getLevelHeader()
{
	var header = "";
	
	var info = ed.info;
	var currentValue;
	var values = [["LevelFormat", info.format],
				  [info.gameType, info.time, info.score],
				  ["LevelName", quoteText(info.name)],
				  ["LevelDescription", quoteText(info.description)],
				  ["LevelCredits", quoteText(info.credits)],
				  ["GridSize", info.gridSize],
				  "Teams", // Adds team lines here
				  ["Specials", info.specials],
				  ["MinPlayers", info.minPlayers],
				  ["MaxPlayers", info.maxPlayers]];
				  
	for(var i=0, length=values.length; i<length; i++) // All lines end with line endings! They are added AFTER, not BEFORE lines
	{
		currentValue = values[i];
		
		if(currentValue!="Teams")
		{
			header += getLine(currentValue);
			
			header += c.lineEndings; // Adds line ending to the end, easier for later
		} else // Teams
		{
			var currentTeam;
			var currentTeamColor;
			
			for(var j=0, jLength=info.teams.length; j<jLength; j++) // Adds a team lines!
			{
				currentTeam = info.teams[j];
				currentTeamColor = getLevelFileColor(currentTeam.color);
				
				header += getLine(["Team", quoteText(currentTeam.name), currentTeamColor.r, currentTeamColor.g, currentTeamColor.b]);
				header += c.lineEndings; // Adds line ending in the end, too.
			}
		}
	}
	
	return header;
}

function getLevelObjects()
{
	var levelString = "";
	var currentObject;
	var currentLineArray; // Use if you want to. Always clear before doing so!
	var currentTeamIndex;
	
	for(var i=0, length=ed.objects.length; i<length; i++)
	{
		currentObject = ed.objects[i];
		currentTeamIndex = getLevelTeamIndex(currentObject.team);
		
		switch(currentObject.type)
		{
			case "wall":
				currentLineArray = ["BarrierMaker", currentObject.width];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "spawn":
				currentLineArray = ["Spawn", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "health":
				currentLineArray = ["RepairItem"];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push(currentObject.regen);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "energy":
				currentLineArray = ["EnergyItem"];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push(currentObject.regen);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "speedzone":
				currentLineArray = ["SpeedZone"];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				if(currentObject.snapEnabled)
				{
					currentLineArray.push(currentObject.speed, "SnapEnabled", "Rotate=" + currentObject.rotation);
				} else
				{
					currentLineArray.push(currentObject.speed, "Rotate=" + currentObject.rotation);
				}
				
				levelString += getLine(currentLineArray);
				break;
				
			case "teleporter":
				currentLineArray = ["Teleporter"];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push("Delay=" + currentObject.delay);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "textitem":
				currentLineArray = ["TextItem", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push(getTextItemSize(currentObject), quoteText(currentObject.text));
				
				levelString += getLine(currentLineArray);
				break;
				
			case "flag":
				currentLineArray = ["FlagItem", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "flagspawn":
				currentLineArray = ["FlagSpawn", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push(currentObject.respawn);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "soccer":
				currentLineArray = ["SoccerBallItem"];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "core":
				currentLineArray = ["CoreItem", currentTeamIndex, currentObject.health];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "mine":
				currentLineArray = ["Mine"];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "spybug":
				currentLineArray = ["SpyBug", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "asteroid":
				currentLineArray = ["Asteroid"];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push("Size=" + currentObject.size);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "asteroidspawn":
				currentLineArray = ["AsteroidSpawn"];
				pushPointsToArray(currentLineArray, currentObject.points);
				currentLineArray.push(currentObject.respawn);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "testitem":
				currentLineArray = ["TestItem", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "resourceitem":
				currentLineArray = ["ResourceItem", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "ghostship":
				currentLineArray = ["Ship", c.neutralTeam];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "loadoutzone":
				currentLineArray = ["LoadoutZone", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "goalzone":
				currentLineArray = ["GoalZone", currentTeamIndex];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "slipzone":
				currentLineArray = ["SlipZone", currentObject.friction];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "polywall":
				currentLineArray = ["PolyWall"];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "nexus":
				currentLineArray = ["NexusZone"];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
				
			case "zone":
				currentLineArray = ["Zone!" + currentObject.id];
				pushPointsToArray(currentLineArray, currentObject.points);
				
				levelString += getLine(currentLineArray);
				break;
		}
		
		levelString += c.lineEndings;
	}
	
	return levelString;
}

function pushPointsToArray(array, pointArray)
{
	// func.apply(thisArg[, argsArray]) will give func thisArg as itself, and argsArray as the arguments to the function. Useful for push(item1, item2...).
	array.push.apply(array, getLineArrayFromPointsArray(pointArray));
}