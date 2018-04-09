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
if(Autorize::check())
{
	//connect to database
	$db = new Database();

	//execute some database code
	$result = $db->query("SELECT * FROM Questions");
	if ($result->num_rows > 0) {
		// output data of each row
		while($row = $result->fetch_assoc()) {
			echo $row["Qid"] . "::";
			echo $row["Qname"] . "::";
			echo $row["Question"] . "::";
			echo $row["Type"] . "::";
			
			$temp = $row["Labels"];
			echo ($temp == "" ? '0' : $row["Labels"]);
			
			echo "::" . $row["Required"];
			echo "::" . $row["Frequency"];
			echo "::" . $row["Page"];
			echo "<br/>";
		}
	}
	
	//close database
	$db->close();
}

?>