var qData = [];
var survey = new function() {
	this.startdate = null;
	
	this.retrieveQuestions = function(){
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
						HTML += "<p class='question'>"+data[1]+"</p>";
						qData.push({name:"q"+data[0],type:data[2]});
						switch(data[2])
						{
							case "ShortText":
								HTML += "<input class='SOQ' type='text' name='q"+data[0]+"' />";
							break;

							case "LongText":
								HTML += "<textarea class='LOQ' name='q"+data[0]+"'></textarea>";
							break;

							case "Select":
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
							break;

							case "MultiSelect":
								labels = data[3].split(";");
								labels.forEach(function(label) {
									HTML += "<label class='checkContainer'>"+label;
									HTML += "<input type='checkbox' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
									HTML += "<span class='checkmark'></span>";
									HTML += "</label>";
								});
							break;

							case "Likert":
								labels = [];
								if(data[3] === "5" || data[3] === "7" || data[3] === "9")
								{
									switch(data[3])
									{
										case "5": labels = ["1","2","3-s","4","5"]; break;
										case "7": labels = ["1","2","3","4-s","5","6","7"]; break;
										case "9": labels = ["1","2","3","4","5-s","6","7","8","9"]; break;
									}
								}
								else labels = data[3].split(";");
								
								HTML += "<div class='likert'>";
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
								HTML += "<input class='dateQ' type='date' name='q"+data[0]+"' />";
							break;

							case "Time":
								HTML += "<input class='timeQ' type='time' name='q"+data[0]+"' />";
							break;

							case "Dropdown":
								HTML += "<select class='dropQ' name='q"+data[0]+"'>";
								labels = data[3].split(";");
								labels.forEach(function(label) {
									HTML += "<option value='"+label+"'>"+label+"</option>";
								});
								HTML += "</select>";
							break;

							case "Location":
								HTML += "<div class='fileContainer Location'>";
								
								HTML += "<a href='#' class='button'>Choose Location</a>";
							break;

							case "Recording":
								HTML += "<div class='fileContainer Recording'>";
								HTML += "<div class='optionContainer'>";
								HTML += "	<button class='button voice'></button>";
								HTML += "	<p class='label'>Record</p>";
								HTML += "</div></div>";
							break;

							case "Photo":
								HTML += "<div class='fileContainer Image' name='q"+data[0]+"'><div class='optionContainer'>";
								HTML += "	<div id='takePic' class='button camera' name='q"+data[0]+"'></div>";
								HTML += "	<p class='label'>Camera</p>";
								HTML += "</div>";
								HTML += "<div class='optionContainer'>";
								HTML += "	<div id='choosePic' class='button album'></div>";
								HTML += "	<p>Album</p>";
								HTML += "</div>";

								HTML += "<div class='preview'><div class='close'></div><img id='preview' /></div>";
								HTML += "</div>";
							break;
						}
					}
				});

				HTML = $$("#questions #header").html()+HTML+$$("#questions #footer").html();
				$$("#questions").html(HTML);
				
				$$("#survey_submit").on('click', survey.send);
				$$("#takePic").on('click',function(){
					cameraManager.qID = $$(this).attr("name");
					cameraManager.takePicture();
				});
				$$("#choosePic").on('click',cameraManager.choosePicture);
			},
			error(xhr,status,error){
				myApp.alert('error data');
				$$("#questions").html(status + " " + error);
			}
		}); 
	};
	
	this.serialize = function(){
		var string = "";
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
					val = $$("#questions [name='"+q.name+"']").val();
				break;
				case "Select":
				case "Likert":
					if($$("#questions [name='"+q.name+"']:checked").length > 0)
					{
						val = $$("#questions [name='"+q.name+"']:checked").val();
					}
				break;
				case "MultiSelect":
					if($$("#questions [name='"+q.name+"']:checked").length > 0)
					{
						//myApp.alert($$("#questions [name='"+q.name+"']:checked").length);
						$$("#questions [name='"+q.name+"']:checked").each(function(key){
							if(key > 0) val += ",%20";
							val += $$(this).val();
						});
					}
				break;
				case "Photo":
					imageURI = $$(".fileContainer[name='"+q.name+"'] #preview").attr("src");
					if(imageURI !== "")
					{
						val += survey.uploadFile(q.name,"img");
					}
				break;
			}
			
			if(val === ""){ val = "Empty";}
			string += "&"+q.name+"="+val.replace(" ","%20");
		});
		
		return string;
	};
	
	this.response = function(){
		return "&UID="+storage.getItem("Uid")+"&sd="+this.startdate.replace(" ","%20");
	};
	
	this.uploadFile = function(qID,format){
		var options = new FileUploadOptions();
		var path = "files/";
		var filename = "";
		
		switch(format)
		{
			case "img":
				imageURI = $$(".fileContainer[name='"+qID+"'] #preview").attr("src");
				
				path+="images/";
				filename = "image_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + ".jpg";
        		
				options.fileKey = "file";
        		options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        		options.mimeType = "image/jpeg";
        		options.chunkedMode = false;
			break;
		}
		
		var params = {};
        params.filename = filename;
		options.params = params;

		var ft = new FileTransfer();
        ft.upload(
			imageURI,
			"http://surveyhti.nfshost.com/survey/saveFiles.php"+AUTORIZATION+"&format="+format, 
			function(result){
        		//alert('result : ' + JSON.stringify(result));
        	}, function(error){
        		//alert('error : ' + JSON.stringify(error));
			}, options
		);
		
		return path+filename;

	};
	
	this.send = function(){
		$$.ajax({
			url:WEB_BASE+"saveQuestions.php"+AUTORIZATION+survey.response()+survey.serialize(),
			success: function(result){
				var data = result.split("::");
				
				if(data[0] === "success")
				{
					myApp.alert("Your response is saved, thank you!");
					view.router.loadPage('menu.html');
				}
				else
				{
					myApp.alert('Something went wrong, your response is not saved');
				}
				
			},
			error(xhr,status,error){
				
				myApp.alert('Something went wrong, your response is not saved');
				//$$("#questions").html(status + " " + error);
			}
		});
	};
};

function sliderOutput(id)
{
	$$("output[name='f"+id+"']").html($$("input[name='q"+id+"']").val());
	
}