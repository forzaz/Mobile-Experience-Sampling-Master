<?php

//Check if incoming request is valid
require 'php/conf.php';
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
			echo $row["Question"] . "::";
			echo $row["Type"] . "::";
			
			$temp = $row["Labels"];
			echo ($temp == "" ? '0' : $row["Labels"]);
			echo "<br/>";
		}
	}
	
	//close database
	$db->close();
}

?>