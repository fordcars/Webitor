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

function uploadLevel(levelString)
{
	var contentType = "multipart/form-data, boundary=" + c.requestBoundary;
	
	alert("Uploading level");

	httpSend("Content-Type", contentType, "POST", c.levelDbUrl, constructMultipartBody(
		[{name: "data[Level][content]", value: levelString},
		{name: "data[User][user_password]", value: ed.password},
		{name: "data[User][username]", value: ed.username}], c.requestBoundary));
}

function constructMultipartBody(data, boundary) // http://stackoverflow.com/questions/5933949/how-to-send-multipart-form-data-form-content-by-ajax-no-jquery
{
	var body = "";
	var currentData;
	
	for(var i=0, length=data.length; i<length; i++)
	{
		currentData = data[i];
		

		body += "--" + boundary
			+ "\r\nContent-Disposition: form-data; name=" + currentData.name
			+ "\r\n\r\n" + currentData.value + "\r\n";
	}
	
	body += "--" + boundary;
	
	return body;
}

// For reference, maybe todo eventually: send screenshots to Pleiades
/*function getBitfighterImage()
{
	return getBinaryImageData(getImageDataFromCanvas(canvases[0]));
}

function getBinaryImageData(b64String) // http://stackoverflow.com/questions/5292689/sending-images-from-canvas-elements-using-ajax-and-php-files
{
	var bytes = Array.prototype.map.call(b64String, function(c) { // Optimized for-loop pretty much
		return c.charCodeAt(0) & 0xff; // Do something cool
	});
	
	return new Uint8Array(bytes).buffer; // ASCII-style? Btw, you can't see the buffer's contents with console.log()!
}

function getImageDataFromCanvas(canvas)
{
	return trimImageDataString(canvas.toDataURL());
}

function trimImageDataString(string)
{
	var startingChar = c.dataImageStringStart.length; // Index of the start of the data
	
	return string.substring(startingChar);
}*/

function httpSend(header1, header2, method, url, data)
{
	try
	{
		var request = new XMLHttpRequest();
	
		if(data==undefined)
		{
			data = null;
		}
	
		request = new XMLHttpRequest();
	
		request.open(method, url, true); // Async is true
		request.setRequestHeader(header1, header2);
		request.send(data);
	
		request.addEventListener("load", responseReceived, false);
		ed.request = request; // Long live request!
	} catch(e)
	{
	}
}

function responseReceived()
{
	console.log(ed.request.responseText);
}