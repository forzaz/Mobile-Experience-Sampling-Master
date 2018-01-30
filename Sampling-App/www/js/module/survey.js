var qData = [];
var survey = new function() {
	this.startdate = null;
	
	this.retrieveQuestions = function(){
		$$.ajax({
			url:WEB_BASE+"getQuestions.php"+Autorization(),
			success: function(result){
				var HTML = '';
				var questions = result.split("<br/>");

				questions.pop();
				questions.forEach(function(question) {
					var data = question.split("::");
					HTML += "<p>"+data[1]+"</p>";
					qData.push({name:"q"+data[0],type:data[2]});
					switch(data[2])
					{
						case "ShortText":
							HTML += "<input type='text' name='q"+data[0]+"' />";
						break;

						case "LongText":
							HTML += "<textarea name='q"+data[0]+"'></textarea>";
						break;

						case "Select":
							var labels = data[3].split(";");
							labels.forEach(function(label) {
								if(!label.endsWith("-s")) HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
								else
								{
									label = label.replace("-s","");
									HTML += "<input type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' checked='checked' />";
								}
								HTML += "<label for='"+label+"'>"+label+"</label>";
							});
						break;

						case "MultiSelect":
							var labels = data[3].split(";");
							labels.forEach(function(label) {
								HTML += "<input type='checkbox' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
								HTML += "<label for='"+label+"'>"+label+"</label>";
							});
						break;

						case "Likert":
							var labels;
							if(data[3] == "5" || data[3] == "7" || data[3] == "9")
							{
								switch(data[3])
								{
									case "5": labels = ["1","2","3-s","4","5"]; break;
									case "7": labels = ["1","2","3","4-s","5","6","7"]; break;
									case "9": labels = ["1","2","3","4","5-s","6","7","8","9"]; break;
								}
							}
							else labels = data[3].split(";");
							
							labels.forEach(function(label) {
								if(!label.endsWith("-s")) HTML += "<input class='likert' type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' />";
								else
								{
									label = label.replace("-s","");
									HTML += "<input class='likert' type='radio' name='q"+data[0]+"' id='"+label+"' value='"+label+"' checked='checked' />";
								}
								HTML += "<label for='"+label+"'>"+label+"</label>";
							});
						break;

						case "Slider":
						break;

						case "Date":
							HTML += "<input type='date' name='q"+data[0]+"' />";
						break;

						case "Time":
							HTML += "<input type='time' name='q"+data[0]+"' />";
						break;

						case "Dropdown":
							HTML += "<select name='q"+data[0]+"'>";
							var labels = data[3].split(";");
							labels.forEach(function(label) {
								HTML += "<option value='"+label+"'>"+label+"</option>";
							});
							HTML += "</select>";
						break;

						case "Location":
							HTML += "<a href='#' class='button'>Choose Location</a>";
						break;

						case "Recording":
							HTML += "<a href='#' class='button'>Record Audio</a>";
						break;

						case "Photo":
							HTML += "<a href='#' class='button'>Take Photo</a>";
						break;
					}

				});

				HTML = $$("#questions #header").html()+HTML+$$("#questions #footer").html();
				$$("#questions").html(HTML);
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
			}
			
			if(val === ""){ val = "Empty";}
			string += "&"+q.name+"="+val.replace(" ","%20");
		});
		
		return string;
	};
	
	this.response = function(){
		return "&UID="+UID+"&sd="+this.startdate.replace(" ","%20");
	};
	
	this.send = function(){
		$$.ajax({
			url:WEB_BASE+"saveQuestions.php"+Autorization()+this.response()+this.serialize(),
			success: function(result){
				$$("#questions").html(result);
			},
			error(xhr,status,error){
				myApp.alert('error data');
				$$("#questions").html(status + " " + error);
			}
		});
	};
};