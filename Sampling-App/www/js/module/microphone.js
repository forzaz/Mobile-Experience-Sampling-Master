var AUD_EXTENSION;
var AUD_PATH;

var microphoneManager = new function()
{
	this.qID = -1;
	
	this.mediaRec;
	this.src = "";
	this.playing = false;
	this.recording = false;
	
	this.init = function(){
												AUD_EXTENSION = ".wav";
		if(device.platform === "Android") 		AUD_EXTENSION = ".amr";
		
		if(device.platform === "iOS") 			AUD_PATH = cordova.file.tempDirectory;
		else if(device.platform === "Android") 	AUD_PATH = cordova.file.externalRootDirectory;
	};
	
	this.toggleRecording = function(qID){
		if(!microphoneManager.recording)
		{
			//Stop playing media
			microphoneManager.stopPlay();
			
			microphoneManager.qID = qID;
			microphoneManager.getMedia("recording_"+qID+AUD_EXTENSION);
			microphoneManager.mediaRec.startRecord();
			$$(".fileContainer[name='"+qID+"'] #record + p.label").html("Stop recording");
			$$(".fileContainer[name='"+microphoneManager.qID+"'] #record").css("background-color", "#2EE577");
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
		microphoneManager.playing = true;
	};
	
	this.stopPlay = function(){
		if(microphoneManager.playing){
			$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord + p.label").html("Play");
			$$(".fileContainer[name='"+microphoneManager.qID+"'] #playRecord").toggleClass("play stop");
			microphoneManager.mediaRec.stop();
			microphoneManager.mediaRec.release();
			microphoneManager.playing = false;
		}
	};
	
	this.getMedia = function(src)
	{
		microphoneManager.src = src;
		microphoneManager.mediaRec = new Media(src,
				function() {
            		console.log("recordAudio():Audio Success");
        		},
        		function(err) {
            		console.log("recordAudio():Audio Error: "+ err.code);
        		}
		);
	};
	
}