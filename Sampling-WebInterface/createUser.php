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

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

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
	$a_email = Utilities::stringFormat(Utilities::getAndSanitize('appEmail'));
	$a_token = Utilities::stringFormat(Utilities::getAndSanitize('token'));
	
	$a_pass = Utilities::getAndSanitize('appPass');
	$a_pass = Utilities::stringFormat(password_hash($a_pass, PASSWORD_DEFAULT));
	
	$result = $db->query("INSERT INTO Users(Username,Email,Password,Token) VALUES (".$a_user.",".$a_email.",".$a_pass.",".$a_token.")");
	
	if($result === TRUE)
	{
		$UID = $db->lastID();
		echo "true::".$UID;
	} else echo "false::username";
	
	//close database
	$db->close();
}

?>