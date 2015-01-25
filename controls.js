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

function doControls(layer)
{
	var relativeMouse = layer.$getRelativePoint(inp.x, inp.y);
	var snappedMouse = snapToGrid(relativeMouse);
	var moveSpeed = c.normalMoveSpeed;
	
	if(inp.shift.s)
	{
		moveSpeed = c.fastMoveSpeed;
	}
	
	if(inp.up.s)
	{
		layer.$t(0, moveSpeed);
	} else if(inp.down.s)
	{
		layer.$t(0, -moveSpeed);
	}
	
	if(inp.left.s)
	{
		layer.$t(moveSpeed, 0);
	} else if(inp.right.s)
	{
		layer.$t(-moveSpeed, 0);
	}
	
	if(ed.draggingItemLocked)
	{
		dragSelectedPoints(relativeMouse);
	}
	
	if(inp.clicked) // Complex logic, doh! This is pretty much mouse up, but as an event
	{
		var length = ed.currentWallPoints.length;
		
		if(length>2) // At least 3 points. (3-1=2)
		{
			ed.currentWallPoints.splice(length-1, 1);
			newWall(ed.currentWallPoints, c.wallWidth);
		}
		
		ed.currentWallPoints = [];
		
		if(ed.draggingItem) // Was dragging an item
		{
			setDragging(false);
		}
		
		if(ed.dragSelectionCorner) // Was dragging a selection rectangle
		{
			getSelectedPoints(relativeMouse);
			ed.dragSelectionCorner = false;
		}
	}
	
	if(inp.rightClick)
	{
		var dragPoint = cPoint(snappedMouse);
		deselectAllPoints(); // In-case
		
		if(ed.currentWallPoints.length==0)
		{
			ed.currentWallPoints.push(cPoint(snappedMouse));
		}
		
		ed.currentWallPoints.push(dragPoint);
		setDragging(dragPoint, true);
	}
	
	if(inp.wheel==1)
	{
		layer.$s(c.zoomInSpeed, c.zoomInSpeed);
		setupGridSpacing(layer);
	} else if(inp.wheel==-1)
	{
		layer.$s(c.zoomOutSpeed, c.zoomOutSpeed);
		setupGridSpacing(layer);
	}
	
	if(inp.mdown)
	{
		if(ed.draggingItemLocked)
		{
			setDragging(false);
		}
		
		if(ed.currentWallPoints.length==0 && !ed.dragSelectionCorner) // Not already doing something
		{
			if(!ed.draggingItem)
			{
				var point = isOnAPoint(relativeMouse);
				
				if(point) // Has at least one point
				{
					if(point.isSelected)
					{
						setDragging(point);
					} else if(inp.shift.s) // Holding down shift key
					{
						selectPoint(point);
						setDragging(point);
					} else
					{
						deselectAllPoints();
						selectPoint(point);
						setDragging(point);
					}
				} else if(!ed.dragSelectionCorner) // No points at all
				{
					deselectAllPoints(); // Deselect all
					ed.dragSelectionCorner = cP(relativeMouse);
				}
			} else
			{
				dragSelectedPoints(relativeMouse); // Also drags selected points
			}
		}
	}
}

function setupGridSpacing(layer) // Always call this when changing layer scaling
{
	if(layer.transform.scaling.x<c.zoomedOutGridScaling)
	{
		ed.currentGridSpacing = c.zoomedOutGridSpacing;
		ed.currentGridZoomedOut = true;
	} else
	{
		ed.currentGridSpacing = c.normalGridSpacing;
		ed.currentGridZoomedOut = false;
	}
}

function dragSelectedPoints(mouse)
{
	var draggingPoint = ed.draggingItem;
	
	if(draggingPoint)
	{
		var snappedMouse = snapToGrid(mouse);
		var currentPoint;
	
		for(var i=0, length=ed.selectedPoints.length; i<length; i++)
		{
			currentPoint = ed.selectedPoints[i];
			
			if(currentPoint!=ed.draggingItem) // Not the point we are currently dragging
			{
				currentPoint.x = currentPoint.x - draggingPoint.x + snappedMouse.x;
				currentPoint.y = currentPoint.y - draggingPoint.y + snappedMouse.y;
			}
		}
		
		draggingPoint.x = snappedMouse.x;
		draggingPoint.y = snappedMouse.y;
	}
}

function setDragging(item, locked) // When set to false, clear everything
{
	ed.draggingItem = item;
	
	if(locked && item!=false)
	{
		ed.draggingItemLocked = true;
	} else
	{
		ed.draggingItemLocked = false;
	}
}