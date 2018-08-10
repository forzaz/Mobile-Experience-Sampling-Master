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

	//process setup data for saving into database
	$data1 = "";
	//retrieve the columns from table Users
	$columns = $db->query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='Users'");
	if ($columns->num_rows > 0) {
		// loop through the columns to extract values
		while($row = $columns->fetch_assoc()) {
			$colname = $row["COLUMN_NAME"];
			if (!in_array($colname, ['Uid', 'Username', 'Email', 'Password', 'Tmp', 'Token'])) {
				$val = Utilities::stringFormat(Utilities::getAndSanitize('q'.$colname));
				$data1 .= $colname."=".$val.",";
			}
		}
	}
	$data1 = substr($data1, 0, -1);

	//update the setup data to the corresponding user
	$result1 = $db->query("UPDATE Users SET ".$data1." WHERE Uid = ".$UID);

	//process notification data
	$data2 =  array();
	for ($day=1; $day<=14; $day++) {
		for ($session=1; $session<=5; $session++) {
			$val = Utilities::getAndSanitize('n'.$day.'0'.$session);
			//$val = '2000-01-01 08:00:00';
			$DID = $day;
			$SID = $session;
			array_push($data2, [$UID, $DID, $SID, Utilities::stringFormat($val)]);
		}
	}

	//insert notification data
	$result2 = $db->multiQuery(Utilities::multiInsertBuilder('Notifications',['Uid','Did', 'Sid', 'Date'], $data2));
	//$result2 = TRUE;

	if($result1 === TRUE && $result2 === TRUE) 	echo 'success::'.$UID;
	else 					echo 'failed';
	
	//close database
	$db->close();
}

?>