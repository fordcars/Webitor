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

// To add an object, make a constructor, or use addSimpleObject(), modify copyObject() (if needed),
// modify deleteSelection() (if needed), add a renderer in drawObjects(), edit getLevelObjects() in parsing, edit editSelected() in modules, add a menu button

function newObject(points, type, args, notAdded) // args: object. If notAdded = true, it will not add it to the editor.
{
	var objectToCreate = {};
	
	if(args==undefined)
	{
		args = {};
	}
	
	objectToCreate = args;
	
	objectToCreate.points = points;
	objectToCreate.type = type;
	objectToCreate.team = ed.currentTeam; // Not used with all objects
	
	if(notAdded || notAdded==undefined)
	{
		addObjectToEditor(objectToCreate);
	}
	
	return objectToCreate;
}

function addObjectToEditor(object)
{
	ed.objects.push(object);
}

function newWall(points, width)
{
	return newObject(points, "wall", {width: width});
}

function addSimpleObject(type, point) // Simple objects. Point: object coords
{
	var object;
	
	switch(type)
	{
		case "spawn":
			object = newObject([point], type);
			break;
		
		case "health":
			object = newObject([point], type, {regen: 20});
			break;
			
		case "energy":
			object = newObject([point], type, {regen: 20});
			break;
			
		case "speedzone":
			object = newObject([point, nPoint(point.x + 200, point.y)], "speedzone", {speed: 2000, snapEnabled: false, rotation: 0});
			break;
			
		case "teleporter":
			object = newObject([point, nPoint(point.x + 200, point.y)], "teleporter", {delay: 1});
			break;
			
		case "textitem":
			object = newObject([point, nPoint(point.x + 200, point.y)], "textitem", {text: "Your text here"});
			break;
			
		case "flag":
			object = newObject([point], type);
			break;
			
		case "flagspawn":
			object = newObject([point], type, {respawn: 30});
			break;
			
		case "soccer":
			object = newObject([point], type);
			break;
			
		case "core":
			object = newObject([point], type, {health: 40});
			break;
			
		case "mine":
			object = newObject([point], type);
			break;
			
		case "spybug":
			object = newObject([point], type);
			break;
			
		case "asteroid":
			object = newObject([point], type, {size: 1});
			break;
			
		case "asteroidspawn":
			object = newObject([point], type, {respawn: 30});
			break;
			
		case "testitem":
			object = newObject([point], type);
			break;
			
		case "resourceitem":
			object = newObject([point], type);
			break;
			
		case "ghostship":
			object = newObject([point], type);
			break;
			
		case "loadoutzone":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type);
			break;
			
		case "goalzone":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type);
			break;
			
		case "slipzone":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type, {friction: 1});
			break;
			
		case "polywall":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type);
			break;
			
		case "nexus":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type);
			break;
			
		case "zone":
			object = newObject([nPoint(point.x - 225, point.y - 75), nPoint(point.x + 225, point.y - 75), nPoint(point.x + 225, point.y + 75), nPoint(point.x - 225, point.y + 75)], type, {id: 0});
			break;
	}
	
	return object;
}

function copyObject(object, notAdded) // Yay
{
	var objectArgs = {};
	var copiedObject;
	
	switch(object.type)
	{
		case "wall":
			objectArgs.width = object.width;
			break;
		
		case "health":
			objectArgs.regen = object.regen;
			break;
			
		case "energy":
			objectArgs.regen = object.regen;
			break;
			
		case "speedzone":
			objectArgs.speed = object.speed;
			objectArgs.roation = object.rotation;
			objectArgs.snapEnabled = object.snapEnabled;
			break;
			
		case "teleporter":
			objectArgs.delay = object.delay;
			break;
			
		case "textitem":
			objectArgs.text = object.text;
			break;
			
		case "flagspawn":
			objectArgs.respawn = object.respawn;
			break;
			
		case "core":
			objectArgs.health = object.health;
			break;
			
		case "asteroid":
			objectArgs.size = object.size;
			break;
			
		case "asteroidspawn":
			objectArgs.respawn = object.respawn;
			break;
			
		case "slipzone":
			objectArgs.friction = object.friction;
			break;
			
		case "zone":
			objectArgs.id = object.id;
			break;
	}
	
	copiedObject = newObject(cPointArray(object.points), object.type, objectArgs, notAdded);
	copiedObject.team = object.team;
	
	return copiedObject;
}