var qData = [];
var survey = new function() {
	this.startdate = null;
	
	this.retrieveQuestions = function(){
		$$(".messageOverlay span").html("Loading question, wait a moment...");
		$$(".messageOverlay").css("display","table");
		
		$$.ajax({
			url:WEB_BASE+"getQuestions.php"+AUTORIZATION,
			success: function(result){
				var HTML = '';
				var labels;
				var questions = result.split("<br/>");

				questions.pop();
				
				questions.forEach(function(question) {
					var data = question.split("::");
					if(renderQuestion(data[0])){
						HTML += "<p class='question'>"+data[1];
						if(data[4] === "1") HTML += " (required)";
						HTML += "</p>";
						qData.push({name:"q"+data[0],type:data[2]});
						switch(data[2])
						{
							case "ShortText":
								HTML += "<input class='SOQ' type='text' name='q"+data[0]+"' data-required='"+data[4]+"'/>";
							break;

							case "LongText":
								HTML += "<textarea class='LOQ' name='q"+data[0]+"' data-required='"+data[4]+"'></textarea>";
							break;

							case "Select":
								HTML += "<div class='selectContainer' name='q"+data[0]+"' data-required='"+data[4]+"'>";
								labels = data[3].split(";");
								labels.forEach(function(label) {
									if(label.endsWith("-s"))
									{
										label = label.replace("-s","");
										HTML += "<label class='radiocontainer'>"+label;
										HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' checked='checked' />";
									}
									else
									{
										HTML += "<label class='radiocontainer'>"+label;
										HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
									}
									HTML += "<span class='radiocheckmark'></span>";
									HTML += "</label>";
								});
								HTML += "</div>";
							break;

							case "MultiSelect":
								HTML += "<div class='selectContainer' name='q"+data[0]+"' data-required='"+data[4]+"'>";
								labels = data[3].split(";");
								labels.forEach(function(label) {
									HTML += "<label class='checkContainer'>"+label;
									HTML += "<input type='checkbox' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
									HTML += "<span class='checkmark'></span>";
									HTML += "</label>";
								});
								HTML += "</div>";
							break;

							case "Likert":
								labels = [];
								if(data[3] === "5" || data[3] === "7" || data[3] === "9")
								{
									switch(data[3])
									{
										case "5": labels = ["1","2","3","4","5"]; break;
										case "7": labels = ["1","2","3","4","5","6","7"]; break;
										case "9": labels = ["1","2","3","4","5","6","7","8","9"]; break;
									}
								}
								else labels = data[3].split(";");
								
								HTML += "<div class='selectContainer likert' name='q"+data[0]+"' data-required='"+data[4]+"'>";
								labels.forEach(function(label) {
									if(label.endsWith("-s"))
									{
										label = label.replace("-s","");
										HTML += "<label class='radiocontainer'>"+label;
										HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' checked='checked' />";
									} 
									else
									{
										HTML += "<label class='radiocontainer'>"+label;
										HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
									}
									HTML += "<span class='radiocheckmark'></span>";
									HTML += "</label>";
								});
								HTML += "</div>";
							break;

							case "Slider":
								var values = data[3].split("<");
								HTML += "<div class='slider'>";
								HTML += values[0]+" <input type='range' name='q"+data[0]+"' id='q"+data[0]+"' min='"+values[0]+"' value='"+values[1]+"' max='"+values[2]+"' oninput='sliderOutput("+data[0]+")'> "+values[2];
								HTML += "<br/><output name='f"+data[0]+"' for='q"+data[0]+"'>"+values[1]+"</output>";
								HTML += "</div>";
							break;

							case "Date":
								type = data[3];
								if(type !== "text"){
									HTML += "<input class='dateQ' type='date' name='q"+data[0]+"' data-required='"+data[4]+"' />";
								} else {
									HTML += "<input class='dateQ' type='text' name='q"+data[0]+"' data-required='"+data[4]+"' />";
								}
							break;

							case "Time":
								type = data[3];
								if(type !== "text"){
									HTML += "<input class='timeQ' type='time' name='q"+data[0]+"' data-required='"+data[4]+"' />";
								} else {
									HTML += "<input class='timeQ' type='text' name='q"+data[0]+"' data-required='"+data[4]+"' />";
								}
							break;

							case "Dropdown":
								HTML += "<select class='dropQ' name='q"+data[0]+"' data-required='"+data[4]+"' >";
								labels = data[3].split(";");
								labels.forEach(function(label) {
									HTML += "<option value='"+label+"'>"+label+"</option>";
								});
								HTML += "</select>";
							break;

							case "ShareLocation":
								HTML += "<div class='selectContainer' name='q"+data[0]+"' data-required='"+data[4]+"'>";
								HTML += "<label id='shareLoc' class='checkContainer'>I accept to share my current location";
								HTML += "<input type='checkbox' name='q"+data[0]+"' id='accept' value='' />";
								HTML += "<span class='checkmark'></span>";
								HTML += "</label>";
								HTML += "</div>"
							break;
								
							case "ChooseLocation":
								HTML += "<div class='fileContainer Location' name='q"+data[0]+"' data-value='' data-required='"+data[4]+"'>";
								HTML += "	<p id='location'>No location selected</p>";
								HTML += "	<div class='optionContainer'>";
								HTML += "		<div id='openMap' class='button marker' name='q"+data[0]+"'></div>";
								HTML += "		<p class='label'>Choose a location</p>";
								HTML += "	</div>";
								HTML += "</div>";
							break;

							case "Recording":
								HTML += "<div class='fileContainer Recording' name='q"+data[0]+"' data-value='' data-required='"+data[4]+"'>";
								HTML += "	<div class='optionContainer'>";
								HTML += "		<div id='record' class='button voice' name='q"+data[0]+"'></div>";
								HTML += "		<p class='label'>Start recording</p>";
								HTML += "	</div>";
								HTML += "	<div class='optionContainer'>";
								HTML += "		<div id='playRecord' class='button play' name='q"+data[0]+"' style='opacity: 0.6;'></div>";
								HTML += "		<p class='label'>Play</p>";
								HTML += "	</div>";
								HTML += "</div>";
							break;

							case "Photo":
								HTML += "<div class='fileContainer Image' name='q"+data[0]+"' data-required='"+data[4]+"'>";
								HTML += "	<div class='optionContainer'>";
								HTML += "		<div id='takePic' class='button camera' name='q"+data[0]+"'></div>";
								HTML += "			<p class='label'>Camera</p>";
								HTML += "	</div>";
								HTML += "	<div class='optionContainer'>";
								HTML += "		<div id='choosePic' class='button album' name='q"+data[0]+"'></div>";
								HTML += "			<p>Album</p>";
								HTML += "	</div>";

								HTML += "	<div class='preview'><div id='removePic' class='close' name='q"+data[0]+"'></div><img id='preview' src='' /></div>";
								HTML += "</div>";
							break;
						}
					}
				});

				HTML = $$("#questions #header").html()+HTML+$$("#questions #footer").html();
				$$("#questions").html(HTML);
				$$("#survey_submit").on('click', survey.send);
				
				/*Add camera functionalities*/
				$$("#takePic").on('click',function(){
					cameraManager.takePicture($$(this).attr("name"));
				});
				$$("#removePic").on('click',function(){
					cameraManager.clearQuestion($$(this).attr("name"));
				});
				$$("#choosePic").on('click',function(){
					cameraManager.choosePicture($$(this).attr("name"));
				});

				/*Add location functionalities*/
				HTML = "<div id='map' class='preview'><div id='closeMap'>Set location</div></div>";
				$$(".page[data-page='survey'] .page-content").append(HTML);
				$$("#shareLoc").on('click',function(){
					if($$("input",this).is(':checked')) $$("input",this).attr("value", "");
					else geoLocationManager.getCurrentLocation($$("input",this).attr("name"));
				});
				$$("#openMap").on('click',function(){
					geoLocationManager.openMapsWindow($$(this).attr("name"));
				});
				$$("#closeMap").on('click',geoLocationManager.closeMapsWindow);
				
				/*Add recording functionalities*/
				$$("#record").on('click',function(){
					microphoneManager.toggleRecording($$(this).attr("name"));
				});
				$$("#playRecord").on('click',function(){
					microphoneManager.togglePlay($$(this).attr("name"));
				});
				
				$$(".messageOverlay").css("display","none");
			},
			error(xhr,status,error){
				myApp.alert('error data');
				$$("#questions").html(status + " " + error);
			}
		}); 
	};
	
	this.serialize = function(){
		var string = "";
		var returnFalse = false;
		qData.forEach(function(q){
			var val = "";
			switch(q.type)
			{
				case "ShortText":
				case "LongText":
				case "Dropdown":
				case "Date":
				case "Time":
				case "Slider":
					$$("#questions [name='"+q.name+"']").removeClass("required");
					val = $$("#questions [name='"+q.name+"']").val();
					if(val === "" && $$("#questions [name='"+q.name+"']").attr("data-required") === "1")
					{
						$$("#questions [name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;
				case "Select":
				case "Likert":
					$$("#questions .selectContainer[name='"+q.name+"']").removeClass("required");
					if($$("#questions input[name='"+q.name+"']:checked").length > 0)
					{
						val = $$("#questions input[name='"+q.name+"']:checked").val();
					}
					else if($$("#questions .selectContainer[name='"+q.name+"']").attr("data-required") === "1")
					{
						$$("#questions .selectContainer[name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;
				case "MultiSelect":
					if($$("#questions input[name='"+q.name+"']:checked").length > 0)
					{
						$$("#questions .selectContainer[name='"+q.name+"']").removeClass("required");
						$$("#questions input[name='"+q.name+"']:checked").each(function(key){
							if(key > 0) val += ",%20";
							val += $$(this).val();
						});
					}
					else if($$("#questions .selectContainer[name='"+q.name+"']").attr("data-required") === "1")
					{
						$$("#questions .selectContainer[name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;
				case "Photo":
					imageURI = $$(".fileContainer[name='"+q.name+"'] #preview").attr("src");
					if(imageURI !== "")
					{
						$$(".fileContainer[name='"+q.name+"']").removeClass("required");
						val += survey.uploadFile(q.name,"img");
					}
					else if($$(".fileContainer[name='"+q.name+"']").attr("data-required") === "1")
					{
						$$(".fileContainer[name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;
				case "Recording":
					audioURI = $$(".fileContainer[name='"+q.name+"']").attr("data-value");
					if(audioURI !== "")
					{
						$$(".fileContainer[name='"+q.name+"']").removeClass("required");
						val += survey.uploadFile(q.name,"audio");
					}
					else if($$(".fileContainer[name='"+q.name+"']").attr("data-required") === "1")
					{
						$$(".fileContainer[name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;	
				case "ShareLocation":
					if($$("#questions #shareLoc input[name='"+q.name+"']:checked").length > 0)
					{
						$$("#questions .selectContainer[name='"+q.name+"']").removeClass("required");
						val = $$("#questions #shareLoc input[name='"+q.name+"']:checked").val();
					}
					else
					{
						if($$("#questions .selectContainer[name='"+q.name+"']").attr("data-required") === "1")
						{
							$$("#questions .selectContainer[name='"+q.name+"']").addClass("required");
							returnFalse = true;
						}
						val = "Not agreed";
					}
				break;
				case "ChooseLocation":
					$$(".fileContainer[name='"+q.name+"']").removeClass("required");
					val = $$(".fileContainer[name='"+q.name+"']").attr("data-value");
					if(val === "" && $$(".fileContainer[name='"+q.name+"']").attr("data-required") === "1")
					{
						$$(".fileContainer[name='"+q.name+"']").addClass("required");
						returnFalse = true;
					}
				break;
			}
			
			if(val === ""){ val = "Empty";}
			string += "&"+q.name+"="+encodeURIComponent(val);
			
		});
		
		if(returnFalse) return false;
		return string;
	};
	
	this.response = function(){
		return "&UID="+storage.getItem("Uid")+"&sd="+this.startdate.replace(" ","%20");
	};
	
	this.uploadFile = function(qID,format){
		var options = new FileUploadOptions();
		var path = "files/";
		var filename = "";
		var fileURI;
		
		switch(format)
		{
			case "img":
				path+="images/";
				filename = "image_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + ".jpg";
        		
				fileURI = $$(".fileContainer[name='"+qID+"'] #preview").attr("src");
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "image/jpeg";
        		options.chunkedMode = false;
			break;
			case "audio":
				path+="recordings/";
				filename = "recording_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + AUD_EXTENSION;
        		
				fileURI = $$(".fileContainer[name='"+qID+"']").attr("data-value");
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "audio/"+AUD_EXTENSION.substr(1, 3).toUpperCase();
        		options.chunkedMode = false;
			break;
		}
		
		var params = {};
        params.filename = filename;
		options.params = params;
		
		var ft = new FileTransfer();
        ft.upload(
			fileURI, "http://surveyhti.nfshost.com/survey/saveFiles.php"+AUTORIZATION+"&format="+format, 
			function(result){
        		//alert('result : ' + JSON.stringify(result));
        	}, function(error){
        		//alert('error : ' + JSON.stringify(error));
			}, options
		);
		
		return path+filename;
	};
	
	this.send = function(){
		if(navigator.connection.type !== Connection.NONE)
		{
			microphoneManager.stopPlay();
			$$(".messageOverlay span").html("Sending response...");
			$$(".messageOverlay").css("display","table");
			
			var serialize = survey.serialize();
			if(serialize){
				$$.ajax({
					url:WEB_BASE+"saveQuestions.php"+AUTORIZATION+survey.response()+serialize,
					success: function(result){
						var data = result.split("::");

						if(data[0] === "success")
						{
							$$(".messageOverlay").css("display","none");
							myApp.alert("Your response is saved.","Thank you!");
							view.router.loadPage('menu.html');
						}
						else
						{
							$$(".messageOverlay").css("display","none");
							myApp.alert('Your response is not saved, please try again','Something went wrong');
						}

					},
					error(xhr,status,error){
						$$(".messageOverlay").css("display","none");
						myApp.alert('Your response is not saved, please try again','Something went wrong');
						//$$("#questions").html(status + " " + error);
					}
				});
			} else {
				$$(".messageOverlay").css("display","none");
				myApp.alert("Pleae make sure you answer all the required questions (indicated in red).","Not all questions are answered");
			}
		} else {
			$$(".messageOverlay").css("display","none");
			myApp.alert("Please, make sure you have an internet connection to submit the survey.","No internet connection");
		}
	};
};

function sliderOutput(qID)
{
	$$("output[name='f"+qID+"']").html($$("input[name='q"+qID+"']").val());
}