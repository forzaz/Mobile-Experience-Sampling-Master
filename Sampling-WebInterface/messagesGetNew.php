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
	
	//get user id
	$Uid = Utilities::getAndSanitize('UID');
	$result = $db->query("SELECT Mid, Date, Content FROM Messages WHERE 
									(Uid = '{$Uid}' OR AllUsers = '1') 
									AND Date <= CURRENT_TIMESTAMP() 
									AND (RetrievedBy IS NULL OR RetrievedBy NOT LIKE '%{$Uid};%')"
	);
	
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			
			echo $row["Mid"] . "::";
			echo $row["Date"] . "::";
			echo $row["Content"] . ";<br/>";
			
			$db->query("UPDATE Messages SET RetrievedBy = concat(IFNULL(RetrievedBy,''),'{$Uid};') WHERE Mid = {$row["Mid"]}");
			
		}
	}
	
	//close database
	$db->close();
}

?>