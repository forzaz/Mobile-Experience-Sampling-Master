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
 * Released on: April, 2018 in Experience Sampling App 1.0.1
 */

var cameraManager = new function()
{
	this.qID = -1;
	
	//standard functions
	this.initModule = function() {
		
	};
	
	this.initOnPage = function() {
		$$(".button.camera").each(function( index ) {
  			$$(this).on('click',function(){
				cameraManager.takePicture($$(this).attr("name"));
			});
		});
		$$(".button.album").each(function( index ) {
  			$$(this).on('click',function(){
				cameraManager.choosePicture($$(this).attr("name"));
			});
		});
		$$(".fileContainer.Image .preview .close").each(function( index ) {
  			$$(this).on('click',function(){
				cameraManager.clearQuestion($$(this).attr("name"));
			});
		});
	};
	
	this.renderQuestions = function(type,ID,labelData){
		var HTML = "";
		switch(type)
		{
			case "Photo":
				HTML = "<div class='fileContainer Image' name='q"+ID+"'>";
				HTML += "	<div class='optionContainer'>";
				HTML += "		<div id='takePic' class='button camera' name='q"+ID+"'></div>";
				HTML += "			<p class='label'>Camera</p>";
				HTML += "	</div>";
				HTML += "	<div class='optionContainer'>";
				HTML += "		<div id='choosePic' class='button album' name='q"+ID+"'></div>";
				HTML += "			<p>Album</p>";
				HTML += "	</div>";
				
				HTML += "	<div class='preview'><div id='removePic' class='close' name='q"+ID+"'></div><img id='preview' src='' /></div>";
				HTML += "</div>";
			break;
		}
		return HTML;
	};
	
	this.validate = function(type,ID,required,rID){
		var info = {};
		info.val = "";
		info.error = false;
		info.checked = false;
		
		switch(type)
		{
			case "Photo":
				imageURI = $$(".fileContainer[name='"+ID+"'] #preview").attr("src");
				if(imageURI !== "")
				{
					$$(".fileContainer[name='"+ID+"']").removeClass("required");
					if (rID !== "") {
						info.val = survey.saveFile(ID,"img",rID);
					}
				}
				else if(required === "1")
				{
					$$(".fileContainer[name='"+ID+"']").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
		}
		return info;
	};
	
	//module specific functions
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
modules.push(cameraManager);