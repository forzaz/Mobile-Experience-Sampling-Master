<?php
/**
 * Experience Sampling Web-interface 1.0.1
 * This backend allows researchers to conduct surveys remotely using the mobile phone on Android and iOS.
 * 
 * This app is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: March, 2018
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
	$result = $db->query("SELECT Mid, Date, Content, ReadBy FROM Messages WHERE (Uid = '{$Uid}' OR AllUsers = '1') AND RetrievedBy LIKE '%{$Uid};%'");
	
	if ($result->num_rows > 0) {
		while($row = $result->fetch_assoc()) {
			
			echo $row["Mid"] . "::";
			echo $row["Date"] . "::";
			echo $row["Content"] . "--";
			
			if(strpos($row["ReadBy"], $Uid.';') !== false)
			{
				echo "1";
			} else echo "0";
			
			echo ";<br/>";
			
		}
	}
	
	//close database
	$db->close();
}

?>