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

// Todo
// Scale from center of screen (maybe)
// Optimize update() (it keeps drawing the grid and all)
// Btw, it will not tell the user if the level upload failed
// NOTE: Rotate scales the points, todo

window.onload = main;

var canvases = [];
var canvasContexts = [];

var canvasContainer;
var ui;
var fg;
var bg;

var inp = {}; // Input. Why not i? Because it is used in for loops, yo!
var m = {}; // Menu
var ed = {}; // Editor
var c = {}; // Constants

function definitions()
{
	Math.TAU = Math.PI * 2;
	
	// Input
	inp.x = 0;
	inp.y = 0;
	inp.clickBuffer = false;
	inp.clicked = false; // Updated each frame. Use this! (inp.clicked = checkForClick() each frame)
	
	inp.rightClick = false;
	
	inp.wheel = 0;
	
	inp.lastMouseMoveTime = 0;
	
	inp.mdown = false;
	
	inp.keys = [];
	inp.up = newInputKey(87); // In javascript, objects get passed by reference
	inp.down = newInputKey(83);
	inp.left = newInputKey(65);
	inp.right = newInputKey(68);
	
	inp.shift = newInputKey(16); // Moves faster
	inp.ctrl = newInputKey(17); // For modules and stuff'
	inp.space = newInputKey(32); // No snap-to-grid
	inp.tab = newInputKey(9); // Shows game graphics
	
	// Shortcuts
	inp.esc = newInputKey(27, escapeMenu);
	inp.backspace = newInputKey(8, deleteSelected);
	inp.g = newInputKey(71, getSelected);
	inp.h = newInputKey(72, flipSelectedH);
	inp.v = newInputKey(86, flipSelectedVOrPaste);
	inp.r = newInputKey(82, rotateSelected);
	inp.x = newInputKey(88, scaleSelected);
	inp.enter = newInputKey(13, editSelected);
	inp.c = newInputKey(67, copySelected);
	
	inp.t1 = newInputKey(49, function(){changeCurrentTeam(1);});
	inp.t2 = newInputKey(50, function(){changeCurrentTeam(2);});
	inp.t3 = newInputKey(51, function(){changeCurrentTeam(3);});
	inp.t4 = newInputKey(52, function(){changeCurrentTeam(4);});
	inp.t5 = newInputKey(53, function(){changeCurrentTeam(5);});
	inp.t6 = newInputKey(54, function(){changeCurrentTeam(6);});
	inp.t7 = newInputKey(55, function(){changeCurrentTeam(7);});
	inp.t8 = newInputKey(56, function(){changeCurrentTeam(8);});
	inp.t9 = newInputKey(57, function(){changeCurrentTeam(9);});
	inp.t0 = newInputKey(48, function(){changeCurrentTeam(0);});
	
	// Editor
	ed.info; // Level info
	ed.objects = [];
	ed.currentWallPoints = [];
	
	ed.username = false;
	ed.password = false;
	
	ed.request; // XML request, if used
	
	// Selection
	ed.dragSelectionCorner = false;
	ed.selectedPoints = [];
	
	ed.draggingItem = false;
	ed.draggingItemLocked = false; // When true, dragging items will not require holding the mouse button
	
	ed.copiedObjects = [];
	
	ed.currentTeam; // Current team for objects. It holds the actual team for 'real' teams, and numbers for neutral and hostile.
	
	ed.currentGridSpacing; // Setup when scaling changes with setupGridSpacing(layer)
	ed.currentGridZoomedOut; // If true, the grid is in zoomed out mode
	
	// Menu
	m.mainUIButtons = [];
	m.settingsButtons = [];
	m.manageTeamsButtons = [];
	
	m.dynamicTeamButtons = [];
	
	m.location = "main";
	m.oldLocation = "";
	m.newLocation = true; // Is true when this is the first frame since m.location changed
	m.buttonHeight = 20;
	
	// Constants
	c.defaultCanvasWidth = 1000;
	c.defaultCanvasHeight = 600;
	c.amountOfLayers = 3;
	
	c.defaultLineWidth = 1;
	c.defaultLineJoin = "round";
	
	c.canWidth = c.defaultCanvasWidth;
	c.canHeight = c.defaultCanvasHeight;
	c.hCanWidth = c.canWidth / 2;
	c.hCanHeight = c.canHeight / 2;
	
	c.mouseMoveThrottle = 1; // The smaller the more precise (at the cost of CPU)
	
	c.numberOfInputKeys = inp.keys.length;
	
	// Editor
	c.normalGridSpacing = 25; // In pixels
	c.zoomedOutGridSpacing = c.normalGridSpacing * 10;
	c.zoomedOutGridScaling = 0.8;
	c.lineEndings = "\n";
	
	c.UiX = c.canWidth - 90;
	c.mainTextFont = "20px Arial";
	c.selectedButtonColor = "white";
	
	c.normalMoveSpeed = 4;
	c.fastMoveSpeed = 8;
	c.zoomInSpeed = 1.1;
	c.zoomOutSpeed = 1 / c.zoomInSpeed;
	
	c.wallWidth = 50;
	
	c.lineEndings = "\n";
	
	c.colorBase = 255;
	c.pointSquareSize = 6; // Half of the square sides in points in objects
	
	c.manageTeamsStartingY = 100;
	c.manageTeamsLineSeparation = 40;
	c.manageTeamsYNameOffset = (c.manageTeamsLineSeparation / 2) + 8; // Guessed '8' according to 20px Arial
	c.manageTeamsButtonsX = 100;
	
	c.neutralColor = "white";
	c.hostileColor = "rgb(150, 150, 150)";
	
	c.neutralTeam = -1;
	c.hostileTeam = -2;
	c.teamBase = 0;
	
	c.levelDbUrl = "http://bitfighter.org/pleiades/levels/upload";
	c.requestBoundary = "---REQUEST---BOUNDARY---"; // Found in Bitfighter output
	
	c.dataImageStringStart = "data:image/png;base64,"; // Gets removed from image data
	
	c.levelFileExtension = ".level";
}

function main()
{
	definitions(); // "Global" variables defined here
	
	// Other definitions
	ed.currentTeam = c.neutralTeam;
	
	(function() // requestAnimationFrame polyfill by Erik Möller. Fixed by Paul Irish and Tino Zijdel, https://gist.github.com/paulirish/1579671, MIT license
	{
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
					|| window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
			window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
				timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
	}());
	
	setupElements(document.body);
	addEventListeners();
	createMenuButtons();
	
	basicGraphics(bg);
	
	login();
	ed.info = getDefaultLeveInfo(); // Uses username if possible
	
	setupMainGraphicsLayer(fg);
	
	window.requestAnimationFrame(update);
}

function setupElements(parent)
{
	var currentCanvas;
	var currentCanvasContext;
	
	canvasContainer = document.createElement("div");
	canvasContainer.style.width = (c.defaultCanvasWidth) + "px";
	canvasContainer.style.height = (c.defaultCanvasHeight) + "px";
	canvasContainer.style.position = "absolute";
	canvasContainer.style.left = 0;
	canvasContainer.style.top = 0;
	canvasContainer.style.border = "solid black";
	
	for(var i=c.amountOfLayers-1; i>=0; i--)
	{
		currentCanvas = document.createElement("canvas");

		currentCanvas.style.position = "absolute";
		currentCanvas.style.left = 0;
		currentCanvas.style.top = 0;
		currentCanvas.style.zIndex = i;
		
		currentCanvas.width = c.defaultCanvasWidth;
		currentCanvas.height = c.defaultCanvasHeight;
		
		canvases.push(currentCanvas);
		
		currentCanvasContext = currentCanvas.getContext("2d");
		
		addGraphicMembers(currentCanvasContext);
		
		canvasContexts.push(currentCanvasContext);
		
		canvasContainer.appendChild(currentCanvas);
	}
	
	mainCanvas = canvases[0];
	mainCanvasContext = canvasContexts[0];
	
	ui = canvasContexts[0];
	fg = canvasContexts[1];
	bg = canvasContexts[2];
	
	parent.appendChild(canvasContainer);
}

function update()
{
	window.requestAnimationFrame(update);
	inp.clicked = checkForClick();
	
	updateMenuInfo();
	
	ui.clearLayer();
	
	switch(m.location)
	{
		case "main":
			fg.clearLayer();
			
			if(m.newLocation)
			{
				setupGridSpacing(fg);
			}
			
			doControls(fg);
	
			drawMainEditor(fg);
	
			drawUI(ui);
			break
			
		case "settings":
			if(m.newLocation)
			{
				fg.clearLayer();
				drawFancyOverlay(fg);
			}
			
			drawSettings(ui);
			break;
			
		case "manageteams":
			if(m.newLocation)
			{
				fg.clearLayer();
				drawFancyOverlay(fg);
				
				updateDynamicButtons();
			}
		
			drawManageTeams(ui);
			break;
	}
	
	inp.wheel = 0; // Do this, always!!
	inp.rightClick = false;
}