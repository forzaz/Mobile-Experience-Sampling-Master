/**
 * Basic questions module
 * This module contains the basic question types like text input, likert scale etc.
 * 
 * This module is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: April, 2018 in Experience Sampling App 1.0.1
 */

var basicQuestionsManager = new function()
{
	//standard functions
	this.initModule = function() {
	};
	
	this.initOnPage = function() {
	};
	
	this.renderQuestions = function(type,ID,labelData){
		var HTML = "";
		switch(type)
		{
			case "ShortText":
				HTML += "<input class='SOQ' type='text' name='q"+ID+"' />";
			break;
					
			case "LongText":
				HTML += "<textarea class='LOQ' name='q"+ID+"'></textarea>";
			break;

			case "Select":
				HTML += "<div class='selectContainer' name='q"+ID+"'>";
				labels = labelData.split(";");
				labels.forEach(function(label) {
					if(label.endsWith("-s"))
					{
						label = label.replace("-s","");
						HTML += "<label class='radiocontainer'>"+label;
						HTML += "<input type='radio' name='q"+ID+"' id='"+label+"' value='"+label+"' checked='checked' />";
					}
					else
					{
						HTML += "<label class='radiocontainer'>"+label;
						HTML += "<input type='radio' name='q"+ID+"' id='"+label+"' value='"+label+"' />";
					}
					HTML += "<span class='radiocheckmark'></span>";
					HTML += "</label>";
				});
				HTML += "</div>";
			break;
		
			case "MultiSelect":
				HTML += "<div class='selectContainer' name='q"+ID+"'>";
				labels = labelData.split(";");
				labels.forEach(function(label) {
					HTML += "<label class='checkContainer'>"+label;
					HTML += "<input type='checkbox' name='q"+ID+"' id='"+label+"' value='"+label+"' />";
					HTML += "<span class='checkmark'></span>";
					HTML += "</label>";
				});
				HTML += "</div>";
			break;

			case "Likert":
				labels = [];
				if(labelData === "5" || labelData === "7" || labelData === "9")
				{
					switch(labelData)
					{
						case "5": labels = ["1","2","3","4","5"]; break;
						case "7": labels = ["1","2","3","4","5","6","7"]; break;
						case "9": labels = ["1","2","3","4","5","6","7","8","9"]; break;
					}
				}
				else labels = labelData.split(";");
				
				HTML += "<div class='selectContainer likert' name='q"+ID+"'>";
				labels.forEach(function(label) {
					if(label.endsWith("-s"))
					{
						label = label.replace("-s","");
						HTML += "<label class='radiocontainer'>"+label;
						HTML += "<input type='radio' name='q"+ID+"' id='"+label+"' value='"+label+"' checked='checked' />";
					} 
					else
					{
						HTML += "<label class='radiocontainer'>"+label;
						HTML += "<input type='radio' name='q"+ID+"' id='"+label+"' value='"+label+"' />";
					}
					HTML += "<span class='radiocheckmark'></span>";
					HTML += "</label>";
				});
				HTML += "</div>";
			break;

			case "Slider":
				var values = labelData.split("<");
				HTML += "<div class='slider'>";
				HTML += values[0]+" <input type='range' name='q"+ID+"' id='q"+ID+"' min='"+values[0]+"' value='"+values[1]+"' max='"+values[2]+"' oninput='basicQuestionsManager.sliderOutput("+ID+")'> "+values[2];
				HTML += "<br/><output name='f"+ID+"' for='q"+ID+"'>"+values[1]+"</output>";
				HTML += "</div>";
			break;

			case "Date":
				HTML += "<input class='dateQ' type='date' name='q"+ID+"'' />";
			break;
								
			case "DateText":
				HTML += "<input class='dateQ day' maxlength='2' type='number' name='q"+ID+"' placeholder='dd' />/";
				HTML += "<input class='dateQ month' maxlength='2' type='number' name='q"+ID+"' placeholder='mm' />/";
				HTML += "<input class='dateQ year' maxlength='4' type='number' name='q"+ID+"' placeholder='yyyy' />";
			break;

			case "Time":
				HTML += "<input class='timeQ' type='time' name='q"+ID+"' />";
			break;

			case "Dropdown":
				HTML += "<select class='dropQ' name='q"+ID+"' >";
				labels = labelData.split(";");
				labels.forEach(function(label) {
					HTML += "<option value='"+label+"'>"+label+"</option>";
				});
				HTML += "</select>";
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
			case "ShortText":
			case "LongText":
			case "Dropdown":
			case "Date":
			case "Time":
			case "Slider":
				$$("#questions [name='"+ID+"']").removeClass("required");
				info.val = $$("#questions [name='"+ID+"']").val();
				if(info.val === "" && required === "1")
				{
					$$("#questions [name='"+ID+"']").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
				
			case "DateText":
				$$("#questions [name='"+ID+"'].day").removeClass("required");
				$$("#questions [name='"+ID+"'].month").removeClass("required");
				$$("#questions [name='"+ID+"'].year").removeClass("required");
				var day = $$("#questions [name='"+ID+"'].day").val();
				var month = $$("#questions [name='"+ID+"'].month").val();
				var year = $$("#questions [name='"+ID+"'].year").val();
				if((day !== "" && month !== "" && year !== "") || required !== "1")
				{
					info.val = day+"/"+month+"/"+year;
				}
				else
				{
					$$("#questions [name='"+ID+"'].day").addClass("required");
					$$("#questions [name='"+ID+"'].month").addClass("required");
					$$("#questions [name='"+ID+"'].year").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
				
			case "Select":
			case "Likert":
				$$("#questions .selectContainer[name='"+ID+"']").removeClass("required");
				if($$("#questions input[name='"+ID+"']:checked").length > 0)
				{
					info.val = $$("#questions input[name='"+ID+"']:checked").val();
				}
				else if(required === "1")
				{
					$$("#questions .selectContainer[name='"+ID+"']").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
				
			case "MultiSelect":
				if($$("#questions input[name='"+ID+"']:checked").length > 0)
				{
					$$("#questions .selectContainer[name='"+ID+"']").removeClass("required");
					$$("#questions input[name='"+ID+"']:checked").each(function(key){
					if(key > 0) info.val += ",%20";
						info.val += $$(this).val();
					});
				}
				else if(required === "1")
				{
					$$("#questions .selectContainer[name='"+ID+"']").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
		}
		
		return info;
	};
	
	//module specific functions
	this.sliderOutput = function(qID)
	{
		$$("output[name='f"+qID+"']").html($$("input[name='q"+qID+"']").val());
	};
}
modules.push(basicQuestionsManager);