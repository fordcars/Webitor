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

function createMenuButtons()
{
	// UI
	addMenuButton("Login", 20, "yellow", m.mainUIButtons, "callback", {defaultValue: login});
	addMenuButton("Download Level", 50, "yellow", m.mainUIButtons, "callback", {defaultValue: downloadLevel});
	addMenuButton("Upload to Pleiades", 80, "yellow", m.mainUIButtons, "callback", {defaultValue: uploadToPleiades});
	addMenuButton("Re-center", c.canHeight - 30, "blue", m.mainUIButtons, "callback", {defaultValue: recenter, x: 50});
	
	// UI Objects
	addMenuButton("Spawn", 120, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("spawn");}});
	addMenuButton("Health", 140, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("health");}});
	addMenuButton("Energy", 160, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("energy");}});
	addMenuButton("GoFast", 180, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("speedzone");}});
	addMenuButton("Teleporter", 200, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("teleporter");}});
	addMenuButton("TextItem", 220, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("textitem");}});
	
	addMenuButton("Flag", 240, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("flag");}});
	addMenuButton("FlagSpawn", 260, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("flagspawn");}});
	addMenuButton("SoccerBall", 280, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("soccer");}});
	addMenuButton("Core", 300, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("core");}});
	addMenuButton("Mine", 320, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("mine");}});
	addMenuButton("Spybug", 340, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("spybug");}});
	addMenuButton("Asteroid", 360, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("asteroid");}});
	addMenuButton("AsteroidSpawn", 380, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("asteroidspawn");}});
	addMenuButton("TestItem", 400, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("testitem");}});
	addMenuButton("ResourceItem", 420, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("resourceitem");}});
	addMenuButton("GhostShip", 440, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("ghostship");}});
	
	addMenuButton("LoadoutZone", 460, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("loadoutzone");}});
	addMenuButton("GoalZone", 480, getCurrentTeamColor, m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("goalzone");}});
	addMenuButton("SlipZone", 500, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("slipzone");}});
	addMenuButton("PolyWall", 520, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("polywall");}});
	addMenuButton("Nexus", 540, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("nexus");}});
	addMenuButton("Zone", 560, "lime", m.mainUIButtons, "callback", {defaultValue: function(){userAddObject("zone");}});
	
	// Settings
	addMenuButton("Game Type", 140, "yellow", m.settingsButtons, "toggle", {defaultValue: "Bitmatch", values: ["Bitmatch", "CTF", "Zone Control", "Core", "Retrieve", "HTF", "Rabbit", "Nexus", "Soccer"]});
	addMenuButton("Score", 180, "yellow", m.settingsButtons, "callback", {defaultValue: changeScore});
	addMenuButton("Time", 220, "yellow", m.settingsButtons, "callback", {defaultValue: changeTime});
	addMenuButton("Allow Engineer", 260, "yellow", m.settingsButtons, "boolean", {defaultValue: false});
	addMenuButton("Name", 300, "yellow", m.settingsButtons, "callback", {defaultValue: changeLevelName});
	addMenuButton("Description", 340, "yellow", m.settingsButtons, "callback", {defaultValue: changeLevelDescription});
	addMenuButton("Author", 380, "yellow", m.settingsButtons, "callback", {defaultValue: changeLevelAuthor});
	addMenuButton("Manage Teams", 420, "yellow", m.settingsButtons, "normal", {defaultValue: "manageteams"});
	
	addMenuButton("Back", 500, "lime", m.settingsButtons, "callback", {defaultValue: saveLevelInfo});
	
	// Manage Teams
	addMenuButton("Add team", 480, "lime", m.manageTeamsButtons, "callback", {defaultValue: addTeam});
	addMenuButton("Back", 500, "lime", m.manageTeamsButtons, "normal", {defaultValue: "settings"});
}

function updateMenuInfo()
{
	if(m.location!=m.oldLocation)
	{
		m.newLocation = true;
		m.oldLocation = m.location;
	} else
	{
		m.newLocation = false;
	}
}

function addMenuButton(buttonName, buttonY, buttonColor, locationArray, buttonType, buttonParameters) // Arrays passed by REFERENCE
{
	var tempObj = {};
	
	tempObj.name = buttonName;
	tempObj.y = buttonY;
	tempObj.type = buttonType;
	tempObj.color = buttonColor;
	
	if(validData(buttonParameters))
	{
		tempObj.parameters = buttonParameters;
		tempObj.value = buttonParameters.defaultValue;
		
		if(tempObj.type=="toggle")
		{
			tempObj.parameters.values = buttonParameters.values;
			tempObj.parameters.valueIndex = 0; // The index of the first value
		}
	}
	
	locationArray.push(tempObj);
	
	return tempObj;
}

function handleMenuButtons(layer, menuArray, menuX)
{
	var menuLoc = m.location;
	
	var currentButton;
	var currentButtonX = 0;
	var mouseOnButton = false;
	var buttonString;
	var buttonStringLength;
	var halfButtonLength;
	
	layer.font = c.mainTextFont;
	
	for(var i=0, length=menuArray.length; i<length; i++)
	{
		currentButton = menuArray[i];
		
		if(currentButton.parameters.x==undefined)
		{
			currentButtonX = menuX;
		} else
		{
			currentButtonX = currentButton.parameters.x;
		}
		
		mouseOnButton = false;
		
		if(currentButton.type=="boolean") // Button string to display
		{
			var booleanString;
			buttonString = currentButton.name + ": ";
			
			if(currentButton.value)
			{
				booleanString = "True";
			} else
			{
				booleanString = "False";
			}
			
			buttonString = buttonString + booleanString;
		} else if(currentButton.type=="toggle")
		{
			buttonString = currentButton.name + ": " + currentButton.value;
		} else
		{
			buttonString = currentButton.name;
		}
		
		buttonStringLength = layer.measureText(buttonString).width;
		halfButtonLength = buttonStringLength/2;
		
		if(inp.x>currentButtonX-halfButtonLength && inp.x<currentButtonX+halfButtonLength && inp.y>currentButton.y-m.buttonHeight && inp.y<currentButton.y)
		{
			mouseOnButton = true;
		}
		
		if(mouseOnButton)
		{
			layer.fillStyle = c.selectedButtonColor;
		} else
		{
			if(isFunction(currentButton.color))
			{
				layer.fillStyle = currentButton.color();
			} else
			{
				layer.fillStyle = currentButton.color;
			}
		}
		
		if(inp.clicked && mouseOnButton) // Handle clicks
		{
			if(currentButton.type=="normal")
			{
				changeMenuLocation(currentButton.value);
			} else if(currentButton.type=="boolean")
			{
				currentButton.value = !currentButton.value;
			} else if(currentButton.type=="toggle")
			{
				var parameters = currentButton.parameters; // parameters is the object containing all the button parameters
				var numberOfValues = parameters.values.length;
				
				if(parameters.valueIndex<numberOfValues-1)
				{
					parameters.valueIndex++;
				} else
				{
					parameters.valueIndex = 0;
				}
				
				currentButton.value = parameters.values[parameters.valueIndex];
			} else if(currentButton.type=="callback")
			{
				currentButton.value();
			}
		}
		
		layer.drawCenteredString(buttonString, currentButtonX, currentButton.y, buttonStringLength);
	}
}

function changeMenuLocation(locationString)
{
	m.location = locationString;
	m.newLocation = true;
}

// Menu callbacks

function changeLevelName()
{
	var name = askUser("Level name:", ed.info.name);
	
	if(validData(name))
	{
		ed.info.name = name;
	}
}

function changeLevelDescription()
{
	var description = askUser("Level description:", ed.info.description);
	
	if(validData(description))
	{
		ed.info.description = description;
	}
}

function changeLevelAuthor()
{
	var credits = askUser("Level author:", ed.info.credits);
	
	if(validData(credits))
	{
		ed.info.credits = credits;
	}
}

function changeScore()
{
	var score = askUser("Winning score:", ed.info.score, true);
	
	if(validData(score))
	{
		ed.info.score = score;
	}
}

function changeTime()
{
	var time = askUser("Time (seconds):", ed.info.time, true);
	
	if(validData(time))
	{
		ed.info.time = time;
	}
}

function saveLevelInfo()
{
	var gameType = m.settingsButtons[0].value; // Extremely ugly (index)
	var allowEngineer = m.settingsButtons[3].value;
	
	switch(gameType) // Remove the prettyness
	{
		case "CTF":
			gameType = "CTFGameType";
			break;
			
		case "Bitmatch":
			gameType = "GameType";
			break;
			
		case "HTF":
			gameType = "HTFGameType";
			break;
			
		case "Rabbit":
			gameType = "RabbitGameType";
			break;
			
		case "Nexus":
			gameType = "NexusGameType";
			break;
			
		case "Soccer":
			gameType = "SoccerGameType";
			break;
			
		case "Core":
			gameType = "CoreGameType";
			break;
			
		case "Zone Control":
			gameType = "ZoneControlGameType";
			break;
			
		case "Retrieve":
			gameType = "RetrieveGameType";
			break;
	}
	
	ed.info.gameType = gameType;
	
	if(allowEngineer)
	{
		ed.info.specials = "Engineer";
	} else
	{
		ed.info.specials = ""; // Clear it!
	}
	
	changeMenuLocation("main");
}

function getDynamicTeamButtons(y)
{
	var buttonArray = [];
	var button;
	var buttonY = 0;
	var currentTeam;
	
	for(var i=0, length=ed.info.teams.length; i<length; i++)
	{
		currentTeam = ed.info.teams[i];
		buttonY = (i * c.manageTeamsLineSeparation) + c.manageTeamsStartingY + c.manageTeamsYNameOffset;
		
		button = addMenuButton("Setup", buttonY, "yellow", buttonArray, "callback", {defaultValue: function(){setupTeam(this);}}); // this passes the button object, for teamIndex
		button.teamIndex = i; // Kind of id, to know to which team this buttons corresponds (hacky)
		
		button = addMenuButton("Delete", buttonY, "yellow", buttonArray, "callback", {defaultValue: function(){deleteTeam(this);}, x: c.canWidth - c.manageTeamsButtonsX}); // x optional
		button.teamIndex = i;
	}
	
	return buttonArray;
}

function updateDynamicButtons()
{
	m.dynamicTeamButtons = getDynamicTeamButtons();
}

function login()
{
	var errorText = "You will not be able to upload to Pleiades unless you login!";
	
	ed.username = askUser("To upload your level to Pleiades, please enter your username (or click Cancel): ", "Username");
	
	if(!validData(ed.username))
	{
		alert(errorText);
		ed.username = false;
	} else
	{
		ed.password = askUser("Please enter your password for the same reasons: ", "Password");
		
		if(!validData(ed.password))
		{
			alert(errorText);
			ed.password = false;
		}
	}
}

function uploadToPleiades()
{
	if(ed.username && ed.password) // They are defined
	{
		if(ed.username!=ed.info.credits)
		{
			if(askUser("Error! The level's author and your username do not match. Do you want to change the author's name to match yours?"))
			{
				ed.info.credits = ed.username;
			} else
			{
				return;
			}
		}
		
		if(askUser("Upload to Pleiades?"))
		{
			uploadLevel(getLevelString());
		}
	} else
	{
		alert("You have to login to upload! If you are not registered, head over to bitfighter.org.");
	}
}

function downloadLevel()
{
	var file = new Blob([getLevelString()], {type: "text/plain"});
	
	downloadBlobAsTextFile(file, ed.info.name + c.levelFileExtension);
}

function recenter()
{
	var layer = fg;
	
	layer.$r(); // Yay!
	layer.$k(); // Re-save, to make sure we can restore again later
	setupGridSpacing(layer); // Make sure we have the right grid spacing
}

function setupTeam(button)
{
	var team = ed.info.teams[button.teamIndex];
	
	getTeamInfo(team);
}

function getTeamInfo(team)
{
	var value = askUser("Team name:", team.name);
	
	if(validData(value))
	{
		team.name = value;
	}
	
	// TODO, remove this end-user nightmare!
	value = askUser("R (" + c.colorBase + "):", team.color.r, true);
	
	if(validData(value))
	{
		team.color.r = value;
	}
	
	value = askUser("G (" + c.colorBase + "):", team.color.g, true);
	
	if(validData(value))
	{
		team.color.g = value;
	}
	
	value = askUser("B (" + c.colorBase + "):", team.color.b, true);
	
	if(validData(value))
	{
		team.color.b = value;
	}
}

function deleteTeam(button)
{
	ed.info.teams.splice(button.teamIndex, 1); // BTW you need to specify the amount of elements to splice, otherwise it will clear the whole thing!
	updateDynamicButtons();
}

function addTeam()
{
	var team = newTeam("no-name", newColor(0, 0, 255)); // Random info, should be overridden by user, but might not
	
	getTeamInfo(team); // Get user team info
	ed.info.teams.push(team); // Add the team
	
	updateDynamicButtons();
}

function userAddObject(objectType) // Layer: fg. If objectType is a function, will call this and give it the relative mouse coord as an argument.
{
	var relativeMouse = fg.$getRelativePoint(inp.x, inp.y); // Returns a NEW point
	var object;
	
	if(isFunction(objectType))
	{
		object = objectType(relativeMouse);
	} else
	{
		object = addSimpleObject(objectType, relativeMouse);
	}
	
	var objectPoints = object.points;
	
	deselectAllPoints();
	selectPoints(objectPoints);
	setDragging(objectPoints[0], true);
}