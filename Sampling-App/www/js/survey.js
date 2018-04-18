/**
 * Experience Sampling App 1.0.1
 * This app allows researchers to conduct surveys remotely using the mobile phone on Android and iOS.
 * 
 * This app is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: April, 2018
 */

//this variable stores question ID and type.
var survey = new function() {
	
	//Set timestamp for when the questionaire was started
	this.startdate = null;
	
	//SQL database for saving information
	this.db = null;
	
	/*
		This function needs to be executed everytime the users opens the app.
		It will initialize the database and upload offline responses if these exist.
	*/
	this.init = function(){
		survey.db = window.sqlitePlugin.openDatabase({name: 'data.db', location: 'default'}, function (db) {
			db.executeSql('CREATE TABLE IF NOT EXISTS Questions (Qid, Question, Type, Labels, Required)');
			db.executeSql('CREATE TABLE IF NOT EXISTS Responses (Rid, SerializedString, StartDate, EndDate, Required)');
			db.executeSql('CREATE TABLE IF NOT EXISTS Uploads   (Rid, Name, Format, Uri)');
			
			survey.uploadResponses();
		}, function(error){
			myApp.alert("Something went wrong, please re-install the app.","Internal error");
		});
	};
	
	/*
		This function will retrieve the questionaire items and start rendering them accordingly to HTML.
	*/
	this.retrieveQuestions = function(){
		
		//Create loading screen
		$$(".messageOverlay span").html("Loading question, wait a moment...");
		$$(".messageOverlay").css("display","table");
		
		//Check for internet
		if(navigator.connection.type !== Connection.NONE)
		{
			//We are online, retrieve questions from server
			$$.ajax({
				url:WEB_BASE+"getQuestions.php"+AUTORIZATION,
				success: function(results){
					
					survey.renderQuestions(results);
				},
				error: function(xhr,status,error){
					//server could not be reached, then get questions offline
					survey.retrieveQuestionsOffline();
				}
			});
		}
		else
		{
			//We are offline, retrieve questions from offline database
			survey.retrieveQuestionsOffline();
		}
	};
	
	/*
		This function will get the questionaire items from the offline database and renders them accordingly.
		If no questions exists in the database yet, the user will be send back to the menu page with an internet warning.
	*/
	this.retrieveQuestionsOffline = function(){
		//start fetching from the database
		survey.db.transaction(function (db) {
			db.executeSql("SELECT * FROM Questions",[],function(db,results){
				if(results.rows.length > 0){
					//question are found, prepare them for render
					var resultsString = "";
					for(var x = 0; x < results.rows.length; x++) {
						var row = results.rows.item(x);
						resultsString += row.Qid + "::"+ row.Question + "::"+ row.Type + "::"+ row.Labels + "::"+ row.Required;
						resultsString += "<br/>";
					}
					
					//render questions
					survey.renderQuestions(resultsString);
				} else {
					//database is empty, send user back
					$$(".messageOverlay").css("display","none");
					myApp.alert("Please, make sure you have an internet connection so the questionaire can be downloaded.","No internet access");
					view.router.loadPage('menu.html');
				}
				
			}, function(error){
				//Error accessing table
				$$(".messageOverlay").css("display","none");
				myApp.alert("Something went wrong, please re-open the app.","Internal error");
				view.router.loadPage('menu.html');
			}); 
		}, function (error) {
			//error accessing database
			$$(".messageOverlay").css("display","none");
			myApp.alert("Something went wrong, please re-install the app.","Internal error");
			view.router.loadPage('menu.html');
		});
	};
	
	/*
		
	*/
	this.renderQuestions = function(result){
		//Empty offline saved questions
		survey.db.transaction(function (db) {
			db.executeSql("DELETE FROM Questions");
		});
		var HTML = '';
		var labels;
		var query = "INSERT INTO Questions (Qid, Question, Type, Labels, Required) VALUES (?,?,?,?,?)";
		
		$$(".messageOverlay span").html("Rendering questions...");
		
		//get parameters for the questions and loop over them.
		var questions = result.split("<br/>");

		questions.pop();
		questions.forEach(function(question) {
			var data = question.split("::");//get parameters; 0 = qID, 1 = question string, 2 = question type, 3 = labels, 4 = required boolean.
			
			survey.db.transaction(function (db) {
				db.executeSql(query,data,function(db,results){
					//myApp.alert("Question added");
				}, function(error){
					myApp.alert("INSERT error: " + error.message);
				}); 
			}, function (error) {
				myApp.alert('transaction error: ' + error.message);
			}, function () {
				//myApp.alert('transaction ok');
			});
			
			//check if question has to be rendered
			if(renderQuestion(data[0])){
				
				//render input
				qHTML = "";
				if(qHTML === "")
				{
					modules.forEach(function(module){
						if (typeof module.renderQuestions === "function" && qHTML === "") {
							qHTML = module.renderQuestions(data[2],data[0],data[3]);
						}
					});
				}
				
				if(qHTML === ""){
					console.log("WARNING: Question type not found for q"+data[0]);
				} 
				else {
					//render question
					HTML += "<p class='question'>"+data[1];
					if(data[4] === "1") HTML += " (required)";
					HTML += "</p>";
					HTML += qHTML;
				}
				
			}
		});
				
		//add survey to the screen
		HTML = $$("#questions #header").html()+HTML+$$("#questions #footer").html();
		$$("#questions").html(HTML);
		$$("#survey_submit").on('click', survey.saveResponse);
		
		//activate modules
		modules.forEach(function(module){
			if (typeof module.initOnPage === "function") {
				module.initOnPage();
			}
		});
		
		//clear loading screen
		$$(".messageOverlay").css("display","none");
	};
	
	/*
		Saves response in offline database.
	*/
	this.saveResponse = function(){
		//create loading overlay
		$$(".messageOverlay span").html("Saving response...");
		$$(".messageOverlay").css("display","table");
		
		//stop modules
		microphoneManager.stopPlay();
		
		//save response in offline database
		survey.db.transaction(function (db) {
			
			//get latest response ID
			db.executeSql("SELECT Rid FROM Responses ORDER BY Rid DESC LIMIT 1",[],function(db,results){
				
				//set a response ID
				var Rid = 0;
				if(results.rows.length > 0) Rid = parseInt(results.rows.item(0).Rid)+1;
				Rid = Rid.toString();
				
				//serialize form information
				survey.serialize(Rid,function(results){
					if(results){
						//everything is good, save the current date
						var date = new Date();
						var enddate = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();

						//save response in offline database
						survey.db.transaction(function (db) {
							db.executeSql("INSERT INTO Responses (Rid, SerializedString, StartDate, EndDate) VALUES (?,?,?,?)",[Rid, results, survey.startdate, enddate], function(db,results){
								//response is saved, continue app
								$$(".messageOverlay").css("display","none");
								myApp.alert("Your response is saved.","Thank you!");
								view.router.loadPage('menu.html');
							}, function(error){
								//there is something wrong with the input - unkown error
								
								//delete file information
								survey.db.transaction(function (db) {
									db.executeSql("DELETE FROM Uploads WHERE Rid = ?",[Rid]);
								});
								
								$$(".messageOverlay").css("display","none");
								myApp.alert('Your response is not saved, please try again','Unkown error');
							});
						});
					} else {
						//a required question is not answered
						
						//delete file information
						survey.db.transaction(function (db) {
							db.executeSql("DELETE FROM Uploads WHERE Rid = ?",[Rid]);
						});
						
						$$(".messageOverlay").css("display","none");
						myApp.alert("Pleae make sure you answer all the required questions (indicated in red).","Not all questions are answered");
					}
				});
				
			});
		});
	};
	
	/*
		Goes through all the questions and prepares a qID-value string to be send to the server.
		- @var rID = response ID for saving files offline
		- @var callBack = function with 1 parameter, this can either be false if an error occured or the ajax string containing all question values.
	*/
	this.serialize = function(rID,callBack){
		
		//get question data
		survey.db.transaction(function (db) {
			db.executeSql("SELECT Qid, Type, Required FROM Questions",[], function(db,questions){
				
				var string = "";
				var returnFalse = false;
				
				//loop through all questions and retrieve their values
				//if a question does not have an answer, but is required, returnFalse will be true.
				for(var x = 0; x < questions.rows.length; x++) {
					var q = questions.rows.item(x);
					q.name = 'q'+q.Qid;
					
					var info = {};
					info.val = "";
					info.checked = false;
					info.error = false;
					
					modules.forEach(function(module){
						if (typeof module.validate === "function" && info.checked === false) {
							info = module.validate(q.Type,q.name,q.Required,rID);
							if(info.error) returnFalse = true;
						}
					});
					
					if(info.val === ""){ info.val = "Empty";}
					string += "&"+q.name+"="+encodeURIComponent(info.val);
				}
				
				//return false if a error is found, otherwise return the string with values
				if(returnFalse) callBack(false);
				else callBack(string);
			});
		});
	};
	
	/*
		Saves file information in offline database
		- @var qID = question ID for question specified in database
		- @var format = either "img" or "audio" for image or audio upload respectively
		- @var rID = response ID as reference for files
		- @return string = file path as saved on the server
	*/
	this.saveFile = function(qID,format,rID){
		var filename, fileURI, path = "files/";
		
		//create parameters depending on file format
		switch(format)
		{
			case "img":
				path+="images/";
				filename = "image_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + ".jpg";
				fileURI = $$(".fileContainer[name='"+qID+"'] #preview").attr("src");
			break;
			case "audio":
				path+="recordings/";
				filename = "recording_" + survey.startdate.replace(/\s|:/g,"-") + "_" + Math.floor(Math.random()*10000) + AUD_EXTENSION;
				fileURI = $$(".fileContainer[name='"+qID+"']").attr("data-value");
			break;
		}
		
		//save file information in the offline database
		survey.db.transaction(function (db) {
			db.executeSql("INSERT INTO Uploads (Rid, Name, Format, Uri) VALUES (?,?,?,?)",[rID, filename, format, fileURI],function(db,results){
				//myApp.alert("File is saved in database");
			},function(error){
				//myApp.alert(error.message);
			});
		});
		
		//return file path
		return path+filename;
	};
	
	/*
		Uploads offline saved responses and files to the server if a internet connection is available.
	*/
	this.uploadResponses = function(){
		if(navigator.connection.type !== Connection.NONE && survey.db !== null){
			
			//internet is available, check for offline responses
			survey.db.transaction(function (db) {
				db.executeSql("SELECT * FROM Responses",[],function(db,results){
					
					if(results.rows.length > 0)
					{
						//responses found, lets send them to the server
						$$(".messageOverlay span").html("Sending response...");
						$$(".messageOverlay").css("display","table");
						
						var row;
						for(var x = 0; x < results.rows.length; x++) {
							row = results.rows.item(x);
							
							//start upload of response
							$$.ajax({
								url:WEB_BASE+"saveQuestions.php"+AUTORIZATION+survey.response(row.StartDate,row.EndDate)+row.SerializedString,
								success: function(result){
									var data = result.split("::");

									if(data[0] === "success")
									{
										//awnsers are uploaded, next upload corresponding files.. if there are
										survey.db.transaction(function (db) {
											
											//Check for files
											db.executeSql("SELECT * FROM Uploads WHERE Rid = ?",[row.Rid],function(db,results){
												if(results.rows.length > 0)
												{
													//files found, upload them
													var row;
													for(var x = 0; x < results.rows.length; x++) {
														row = results.rows.item(x);
														survey.uploadFile(row.Name,row.Uri,row.Format);
													}
													
													//Delete all file information from this response as it is uploaded.
													db.executeSql("DELETE FROM Uploads WHERE Rid = ?",[row.Rid]);
												}
											});
											
											//Delete response from the database
											db.executeSql("DELETE FROM Responses WHERE Rid = ?",[row.Rid],function(db,results){
												$$(".messageOverlay").css("display","none");
											});
										});
									}
									else
									{
										//There is something wrong with the response could not be uploaded now - try again later
										$$(".messageOverlay").css("display","none");
									}

								},
								error: function(xhr,status,error){
									//server not responding
									$$(".messageOverlay").css("display","none");
								}
							});
						}
					}
				}); 
			});
			
		}
	};
	
	/*
		Prepares meta information of the response to be send to the server
		- @var StartDate = start date of the questionaire
		- @var EndDate = end date of the questionaire
		- @return string = string including User ID, start date and end date
	*/
	this.response = function(StartDate, EndDate){
		return "&UID="+storage.getItem("Uid")+"&sd="+StartDate.replace(" ","%20")+"&ed="+EndDate.replace(" ","%20");
	};
	
	/*
		Uploads files (images, recordings) to the server, seperate from the questionaire awnsers.
		!-NOTE that errors in this function are not catched, and do not influence sending the rest of the information to the server.
		- @var fileName = filename saved as on the server
		- @var fileURI = path to the file on device
		- @var format = either "img" or "audio" for image or audio upload respectively
	*/
	this.uploadFile = function(filename,fileURI,format){
		var options = new FileUploadOptions();
		var path = "files/";
		
		switch(format)
		{
			case "img":
				//set parameters for sending image file
				path+="images/";
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "image/jpeg";
        		options.chunkedMode = false;
			break;
			case "audio":
				//set parameters for sending audio file
				path+="recordings/";
				options.fileKey = "file";
        		options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
        		options.mimeType = "audio/"+AUD_EXTENSION.substr(1, 3).toUpperCase();
        		options.chunkedMode = false;
			break;
		}
		
		//set file name, to read on server side
		var params = {};
        params.filename = filename;
		options.params = params;
		
		//send the file
		var ft = new FileTransfer();
        ft.upload(
			fileURI, WEB_BASE+"saveFiles.php"+AUTORIZATION+"&format="+format, 
			function(result){
        		//alert('result : ' + JSON.stringify(result));
        	}, function(error){
        		//alert('error : ' + JSON.stringify(error));
			}, options
		);
	};
};
