var cameraManager = new function()
{
	this.qID = -1;
	
	this.setOptions = function (srcType) {
		var options = {
			quality: 50,// Some common settings are 20, 50, and 100
			destinationType: Camera.DestinationType.FILE_URI,
			// In this app, dynamically set the picture source, Camera or photo gallery
			sourceType: srcType,
			encodingType: Camera.EncodingType.JPEG,
			mediaType: Camera.MediaType.PICTURE,
			allowEdit: false,
			correctOrientation: true,
			targetHeight: 200,
        	targetWidth: 200
		};
		return options;
	};
	
	this.takePicture = function(){
    	var options = cameraManager.setOptions(Camera.PictureSourceType.CAMERA);
		navigator.camera.getPicture(cameraManager.cameraSuccess, cameraManager.cameraError, options);
	};
	
	this.choosePicture = function(){
    	var options = cameraManager.setOptions(Camera.PictureSourceType.SAVEDPHOTOALBUM);
		navigator.camera.getPicture(cameraManager.cameraSuccess, cameraManager.cameraError, options);
	};
	
	this.cameraSuccess = function(imageURI) {
		$$(".fileContainer[name='"+cameraManager.qID+"']").attr("data-value","test");
		cameraManager.qID = -1;
		
		var image = document.getElementById('preview');
		image.src = imageURI;
	};
	
	this.cameraError = function(err) {
		myApp.alert("Unable to obtain picture: " + err, "app");
		cameraManager.qID = -1;
	};
};