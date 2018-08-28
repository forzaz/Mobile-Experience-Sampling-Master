<?php
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

//Check if incoming request is valid
require 'php/Config.php';
require 'php/Autorize.php';
require_once 'php/Utilities.php';
if(Autorize::check())
{
	//connect to database
	$db = new Database();
	
	//retrieve metadata of response
	$UID = Utilities::getAndSanitize('UID');
	$start_date = Utilities::stringFormat(Utilities::getAndSanitize('sd'));
	$end_date   = Utilities::stringFormat(Utilities::getAndSanitize('ed'));

	//insert response
	$result = $db->query("INSERT INTO Responses(Uid,StartDate,EndDate) VALUES (".$UID.",".$start_date.",".$end_date.")");
	if($result === TRUE)
	{
		$RID = $db->lastID();

		//process questionaire data for saving into database
		$data = array();
		$result = $db->query("SELECT Qid, Type FROM Questions");
		if ($result->num_rows > 0) {
			// output data of each row
			while($row = $result->fetch_assoc()) {
				$ID = $row["Qid"];
				$type = $row["Type"];
				//do not save data if question type is Instruction
				if($type == "Instruction") 
				{	
				}
				else 
				{
					$val = Utilities::getAndSanitize('q'.$ID);
					array_push($data, [ $ID , $RID, Utilities::stringFormat($val) ]);
				}
			}
		}

		//save all questionaire data using multi-query method
		$result = $db->multiQuery(Utilities::multiInsertBuilder('Answers',['Qid','Rid','Value'],$data));
		
		if($result === TRUE) 	echo 'success::'.$RID;
		else 					echo 'failed';
	}
	else
	{
		echo 'failed';
	}
	
	//close database
	$db->close();
}

?>