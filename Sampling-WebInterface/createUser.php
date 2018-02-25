<?php
/**
 * Experience Sampling Web-interface 1.0.0
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
	
	//get filled in credentials
	$a_user = Utilities::stringFormat(Utilities::getAndSanitize('appUser'));
	$a_pass = Utilities::stringFormat(Utilities::getAndSanitize('appPass'));
	$a_token = Utilities::stringFormat(Utilities::getAndSanitize('token'));
	
	$result = $db->query("INSERT INTO Users(Username,Password,Token) VALUES (".$a_user.",".$a_pass.",".$a_token.")");
	
	if($result === TRUE)
	{
		$UID = $db->lastID();
		echo "true::".$UID;
	} else echo "false::Username already taken";
	
	//close database
	$db->close();
}

?>