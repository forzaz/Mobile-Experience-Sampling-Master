/**
 * SampleU 1.0.2
 * This mobile application and backend interface allows researchers to conduct experience sampling or ecological momentary intervention studies on Android and iOS.
 * 
 * This project is led by Chao Zhang, Daniël Lakens, and Karin Smolders from  
 * Human-Technology Interaction group at Eindhoven University of Technology
 * chao.zhang87@gmail.com || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * The development of the app, including the design and coding of the front and back-end, was greatly helped by BOSONIC.design
 * info@bosonic.design || http://www.bosonic.design/
 * 
 * Released on: July, 2018
 */

/*
 * Microphone module
 * This module allows users to record audio and play it back.
 */

var AUD_EXTENSION;
var AUD_PATH;

var microphoneManager = new function()
{
	this.qID = -1;
	
	this.mediaRec;
	this.src = "";
	this.playing = false;
	this.recording = false;
	
	this.count = 0;
	this.timer;
	this.duration = -1;
	
	//standard functions
	this.initModule = function() {
												AUD_EXTENSION = ".wav";
		if(device.platform === "Android") 		AUD_EXTENSION = ".amr";
		
		if(device.platform === "iOS") 			AUD_PATH = cordova.file.tempDirectory;
		else if(device.platform === "Android") 	AUD_PATH = cordova.file.externalRootDirectory;
	};
	
	this.initOnPage = function() {
		$$(".button.voice").each(function( index ) {
  			$$(this).on('click',function(){
				microphoneManager.toggleRecording($$(this).attr("name"));
			});
		});
		$$(".button.play").each(function( index ) {
  			$$(this).on('click',function(){
				microphoneManager.togglePlay($$(this).attr("name"));
			});
		});
	};
	
	this.renderQuestions = function(type,ID,labelData){
		var HTML = "";
		switch(type)
		{
			case "Recording":
				HTML = "<div class='fileContainer Recording' name='q"+ID+"' data-value=''>";
				HTML += "	<div class='optionContainer'>";
				HTML += "		<div id='record' class='button voice' name='q"+ID+"'></div>";
				HTML += "		<p class='label'>Start recording</p>";
				HTML += "	</div>";
				HTML += "	<div class='optionContainer'>";
				HTML += "		<div id='playRecord' class='button play' name='q"+ID+"' style='opacity: 0.6;'></div>";
				HTML += "		<p class='label'>Play</p>";
				HTML += "	</div>";
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
			case "Recording":
				audioURI = $$(".fileContainer[name='"+ID+"']").attr("data-value");
				if(audioURI !== "")
				{
					$$(".fileContainer[name='"+ID+"']").removeClass("required");
					info.val = survey.saveFile(ID,"audio",rID);
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
	this.toggleRecording = function(qID){
		if(!microphoneManager.recording)
		{
			//Stop playing media
			microphoneManager.stopPlay();
			
			microphoneManager.qID = qID;
			microphoneManager.getMedia("recording_"+qID+AUD_EXTENSION);
			microphoneManager.mediaRec.startRecord();
			$$(".fileContainer[name='"+qID+"'] #record + p.label").html("Stop recording");
			$$(".fileContainer[name='"+qID+"'] #record").css("background-color", "#2EE577");
			microphoneManager.recording = true;
		}
		else
		{
			//There is already a recording happening
			if(qID === microphoneManager.qID)
			{
				//Stop and save recording if qID is the same
				microphoneManager.mediaRec.stopRecord();
				microphoneManager.mediaRec.release();
				
				$$(".fileContainer[name='"+microphoneManager.qID+"']").attr('data-value',AUD_PATH+microphoneManager.src);
				$$(".fileContainer[name='"+microphoneManager.qID+"'] #record + p.label").html("New recording");
				$$(".fileContainer[name='"+microphoneManager.qID+"'] #record").css("background-color", "#D8D8D8");
				$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord").css("opacity", "1");
				
				microphoneManager.qID = -1;
				microphoneManager.src = "";
				microphoneManager.recording = false;
				
			}
			//else.. do nothing
		}
	};
	
	this.togglePlay = function(qID){
		if(!microphoneManager.recording)
		{
			//No recording happening, sound can be played
			if(microphoneManager.qID !== -1){
				//if a sound is playing, we stop it.
				microphoneManager.stopPlay();
			}
			if(microphoneManager.qID !== qID)
			{
				//if another sound is activated, we start it.
				microphoneManager.qID = qID;
				if($$(".fileContainer[name='"+qID+"']").attr('data-value') !== "") microphoneManager.startPlay("recording_"+qID+AUD_EXTENSION);
				return;
			}
			microphoneManager.qID = -1;
		}
		else
		{
			myApp.alert("Can not play sound when you are recording a sound.","Recorder active");
		}
	};
	
	this.startPlay = function(src){
		$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord + p.label").html("Stop");
		$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord").toggleClass("play stop");
		microphoneManager.getMedia(src);
		microphoneManager.mediaRec.play();
		microphoneManager.timer = setInterval(microphoneManager.duringPlay, 100);
		microphoneManager.playing = true;
	};
	
	this.duringPlay = function(){
		microphoneManager.count = microphoneManager.count+100;
		
		if(microphoneManager.duration < 0)
			microphoneManager.duration = microphoneManager.mediaRec.getDuration();
		
		if(microphoneManager.duration > 0 && microphoneManager.count/1000 > microphoneManager.duration)
			microphoneManager.stopPlay();
	};
	
	this.stopPlay = function(){
		if(microphoneManager.playing){
			$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord + p.label").html("Play");
			$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord").toggleClass("play stop");
			microphoneManager.mediaRec.stop();
			microphoneManager.mediaRec.release();
			microphoneManager.playing = false;
			
			microphoneManager.count = 0;
			microphoneManager.duration = -1;
			clearInterval(microphoneManager.timer);
		}
	};
	
	this.getMedia = function(src)
	{
		microphoneManager.src = src;
		microphoneManager.mediaRec = new Media(src,
				function() {
            		//console.log("recordAudio():Audio Success");
        		},
        		function(err) {
            		//console.log("recordAudio():Audio Error: "+ err.code);
        		}
		);
	};
	
}
modules.push(microphoneManager);