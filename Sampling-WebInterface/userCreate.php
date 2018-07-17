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