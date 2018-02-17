<?php

//Check if incoming request is valid
require 'php/conf.php';
require 'php/Autorize.php';
require_once 'php/Utilities.php';
if(Autorize::check())
{
	//connect to database
	$db = new Database();
	
	//retrieve metadata of response
	$UID = Utilities::getAndSanitize('UID');
	$start_date = Utilities::stringFormat(Utilities::getAndSanitize('sd'));
	$end_date   = Utilities::stringFormat(date("Y-m-d H:i:s"));

	//insert response
	$result = $db->query("INSERT INTO Responses(Uid,StartDate,EndDate) VALUES (".$UID.",".$start_date.",".$end_date.")");
	if($result === TRUE)
	{
		$RID = $db->lastID();

		//process questionaire data for saving into database
		$data = array();
		$result = $db->query("SELECT Qid FROM Questions");
		if ($result->num_rows > 0) {
			// output data of each row
			while($row = $result->fetch_assoc()) {
				$ID = $row["Qid"];
				$val = Utilities::getAndSanitize('q'.$ID);
				array_push($data, [ $ID , $RID, Utilities::stringFormat($val) ]);
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