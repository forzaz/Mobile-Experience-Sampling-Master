/**
 * Camera module
 * This module handles the camera input type, allowing users to make a picture
 * with the camera or choose one from their album.
 * 
 * This module is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: March, 2018 in Experience Sampling App 1.0.0
 */

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