//MODULE CONFIG
const PIC_QUALITY 	= 50;	// Some common settings are 20, 50, and 100
const PIC_WIDTH 	= 200;	//Width of the picture saved on the server
const PIC_HEIGHT 	= 200;	// Height of the picture saved on the server

var cameraManager = new function()
{
	this.qID = -1;
	
	this.setOptions = function (srcType) {
		var options = {
			quality: PIC_QUALITY,
			destinationType: Camera.DestinationType.FILE_URI,
			sourceType: srcType,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: false,
			correctOrientation: true,
			targetHeight: PIC_HEIGHT,
        	targetWidth: PIC_WIDTH
		};
		return options;
	};
	
	this.takePicture = function(qID){
		cameraManager.qID = qID;
    	var options = cameraManager.setOptions(Camera.PictureSourceType.CAMERA);
		navigator.camera.getPicture(cameraManager.onRetrievePicture, cameraManager.onFailPicture, options);
	};
	
	this.choosePicture = function(qID){
		cameraManager.qID = qID;
    	var options = cameraManager.setOptions(Camera.PictureSourceType.SAVEDPHOTOALBUM);
		navigator.camera.getPicture(cameraManager.onRetrievePicture, cameraManager.onFailPicture, options);
	};
	
	this.clearQuestion = function(qID){
    	$$(".fileContainer[name='"+qID+"'] #preview").prop("src","");
	};
	
	this.onRetrievePicture = function(imageURI) {
		$$(".fileContainer[name='"+cameraManager.qID+"'] #preview").prop("src",imageURI);
		cameraManager.qID = -1;
	};
	
	this.onFailPicture = function(err) {
		myApp.alert("No picture added", "No picture is taken/selected.");
		cameraManager.qID = -1;
	};
};