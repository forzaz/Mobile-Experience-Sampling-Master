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
	$format = Utilities::getAndSanitize('format');
	$new_file_name = Utilities::getPostAndSanitize('filename');
	$loc = "files/";
	
	switch($format)
	{
		case "img":
			$loc .= "images/";
		break;
		case "audio":
			$loc .= "recordings/";
		break;
	}
	
	move_uploaded_file ($_FILES["file"]["tmp_name"], $loc.$new_file_name);
}

?>