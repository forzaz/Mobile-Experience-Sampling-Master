<?php

//Check if incoming request is valid
require 'php/conf.php';
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