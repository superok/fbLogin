//Client ID and API key from the Developer Console
var CLIENT_ID = '542846345506-kljaq9db3p7hh1n6lobgq5fqgkedp579.apps.googleusercontent.com';
var API_KEY = 'AIzaSyC82h0phWpTKAThKkoNBFOcKXk1ONVPZQE';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/drive.file';

$(document).ready(function () {
	$( "#dialog" ).dialog({
		autoOpen: false,
		modal:true,
	    buttons: {
		    Ok: function() {
		       $( this ).dialog( "close" );
		    }
	    }
	});
    $('input[type=file]').change(function () {
     $('#btnUpload').show();
     $('#divFiles').html('');
     for (var i = 0; i < this.files.length; i++) { //Progress bar and status label's for each file genarate dynamically
          var fileId = i;
          $("#divFiles").append('<div class="col-md-12">' +
                  '<div class="progress-bar progress-bar-striped active" id="progressbar_' + fileId + '" role="progressbar" aria-valuemin="0" aria-valuemax="100" style="width:0%"></div>' +
                  '</div>' +
                  '<div class="col-md-12">' +
                       '<div class="col-md-6">'  +
                          '<input type="button" class="btn btn-danger" style="display:none;line-height:6px;height:25px" id="cancel_' + fileId + '" value="cancel">' +
                          '<span class="progress-status" id="filename_' + fileId + '"></span>' +
                       '</div>' +
                       '<div class="col-md-6">' + 
                          '<p class="progress-status" style="text-align: right;margin-right:-15px;font-weight:bold;color:saddlebrown" id="status_' + fileId + '"></p>' +
                       '</div>' +
                  '</div>' +
                  '<div class="col-md-12">' +
                       '<p id="notify_' + fileId + '" style="text-align: right;"></p>' +
                  '</div>');
                }
            })
        });

var fileCount = 0;
var ajaxCompleteCount = 0;
function uploadFiles() {
	   var file = document.getElementById("fileUploader")//All files
	   fileCount = file.files.length;
	   ajaxCompleteCount = 0;
	   for (var i = 0; i < file.files.length; i++) {
	          uploadSingleFile(file.files[i], i);
	   }
	}

function uploadSingleFile(file, i) {
    var fileId = i;
    var ajax = new XMLHttpRequest();
    //Progress Listener
    ajax.upload.addEventListener("progress", function (e) {
        var percent = (e.loaded / e.total) * 100;
        $("#status_" + fileId).text(Math.round(percent) + "% uploaded, please wait...");
        $('#progressbar_' + fileId).css("width", percent + "%")
        $("#notify_" + fileId).text("Uploaded " + (e.loaded / 1048576).toFixed(2) + " MB of " + (e.total / 1048576).toFixed(2) + " MB ");
        $("#filename_" + fileId).text(file.name);
    }, false);
    //Load Listener
    ajax.addEventListener("load", function (e) {
    	console.log(e);
        $("#status_" + fileId).text('Upload completed');
        $('#progressbar_' + fileId).css("width", "100%")

        //Hide cancel button
        var _cancel = $('#cancel_' + fileId);
        _cancel.hide();
    }, false);
    //Error Listener
    ajax.addEventListener("error", function (e) {
        $("#status_" + fileId).text("Upload Failed");
    }, false);
    //Abort Listener
    ajax.addEventListener("abort", function (e) {
        $("#status_" + fileId).text("Upload Aborted");
    }, false);

    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", file, file.name);
    formData.append("upload_file", true);
    
    var metadata = {
    	    'name': file.name, // Filename at Google Drive
    	    'mimeType': file.type, // mimeType at Google Drive
    	    'parents': ['1X4_xCCBuMh8BiQ38G9beFgGrRC5w5peX'] // Folder ID at Google Drive
    	};
    
    var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
    var form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
    form.append('file', file);

    var xhr = new XMLHttpRequest();
    ajax.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
    ajax.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    ajax.responseType = 'json';
    ajax.onload = () => {
        console.log(ajax.response.id); // Retrieve uploaded file ID.
        if(fileCount == ++ajaxCompleteCount ){
        	 $( "#dialog" ).dialog( "open" );
        	console.log('all done');
        }
        
    };
    ajax.send(form);

    //Cancel button
    var _cancel = $('#cancel_' + fileId);
    _cancel.show();

    _cancel.on('click', function () {
        ajax.abort();
    })
}


/**
 *  On load, called to load the auth2 library and API client library.
 */
function handleClientLoad() {
  gapi.load('client:auth2', initClient);
}

/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
function initClient() {
	var authorizeButton = document.getElementById('authorize_button');
	var signoutButton = document.getElementById('signout_button');
	
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {	  
		if(!gapi.auth2){
		    gapi.load('auth2', function() {
		        gapi.auth2.init();
		    });
		 }
		
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
function updateSigninStatus(isSignedIn) {
	var authorizeButton = document.getElementById('authorize_button');
	var signoutButton = document.getElementById('signout_button');
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick(event) {
  var auth2 = gapi.auth2.getAuthInstance();
  auth2.signOut().then(function () {
      auth2.disconnect();
  });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}