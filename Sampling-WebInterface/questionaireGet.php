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