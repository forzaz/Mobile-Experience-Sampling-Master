/**
 * Released on: April, 2018 in Experience Sampling App 1.0.1
 */

//give your plugin a unique name
var exampleManager = new function()
{
	//standard functions
	
	/*
		Is called when menu page opens, can be used to set global variables
	*/
	this.initModule = function() {
		//do something
	};
	
	/*
		Is called after questions are rendered to add extra functionality.
		Check "camera.js" for an example in how you can use it.
	*/
	this.initOnPage = function() {
		//do something
	};
	
	/*
		If type corresponds to this module, HTML will be generated to display it correctly on the page
		- @var type = question type to be rendered
		- @var ID = unique ID of the question to indentify it
		- @var labelData = label data to make input fit the question
		- @return HTML = HTML of the rendered question to be displayed in the survey
	*/
	this.renderQuestions = function(type,ID,labelData){
		var HTML = "";//variable to save HTML content
		
		//check for question type
		switch(type)
		{
			case "Example":
				//write HTML corresponding to the question
				HTML += "<input class='SOQ' type='text' name='q"+ID+"' />";
			break;
		}
		
		//return rendered question
		return HTML;
	};
	
	/*
		Validates module corresponding question types and provides validation information
		- @var type = question type to be rendered
		- @var ID = unique ID of the question to indentify it
		- @var required = indentifies if question is required as "0" (not required) or "1" (required)
		- @var rID = response ID of offline database (for saving external information, like files)
		- @return info = information object containing validation information; 
				val = value of input
				error = if there is a problem with the input
				checked = if question is checked within this module.
	*/
	this.validate = function(type,ID,required,rID){
		
		//create info object
		var info = {};
		info.val = "";
		info.error = false;
		info.checked = false;
		
		//check for question type
		switch(type)
		{
			case "Example":
				
				//remove error information
				$$("#questions [name='"+ID+"']").removeClass("required");
				
				//retrieve value
				info.val = $$("#questions [name='"+ID+"']").val();
				
				//check if required
				if(info.val === "" && required === "1")
				{
					//if so, display error information
					$$("#questions [name='"+ID+"']").addClass("required");
					
					//and notify system about the found error to prevent sending information
					info.error = true;
				}
				
				//this question is part of this module, so make sure we notify this to the system to reduce computation time.
				info.checked = true;
			break;
		}
		
		//return information
		return info;
	};
}

//IMPORTANT: add module to the global modules variable to make it part of the system.
modules.push(exampleManager);