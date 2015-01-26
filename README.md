Webitor
================

Webitor is a javascript level editor for the game Bitfighter (http://bitfighter.org).

This is a work-in-progress project, and I hope to eventually port this to mobile.

The code isn't the prettiest, but I learnt a lot writing this, and hopefully I will clean it up in the future.

Instructions:

This level editor supports a lot of the 'real' editor's features. You can:
- Make walls with right click
- Add most of the objects supported by the game, including secret ones
- Press Escape to modify level settings
- Download the level
- Upload the level to the Pleiades database

Here is a list of the currently supported commands. To use these, press the indicated key:
- 'g': gets the selected objects, and brings them to your cursor
- 'h': flip selected points horizontally
- 'v': flip selected points vertically
- 'r': rotate selected points
- 'x': scale selected points
- 'Enter': modify selected objects' attributes
- 'Ctrl + c': copy selected points
- 'Ctrl + v': paste selected points
- '1 to 0': change the current team, for changing object teams
- Hold space to disable snap-to-grid
- Hold shift to move faster
- Scroll to zoom
- WASD to move

NOTES:
- You can't selected objects, you can only select points. If you want to do something, like changing an attribute of an object, select one or more points of it.
- There is NO undo, be careful!
- Wall corners look round, but they aren't really

Known bugs:
- Rotate (r) also changes the scaling of the points, maybe due to floating points?
