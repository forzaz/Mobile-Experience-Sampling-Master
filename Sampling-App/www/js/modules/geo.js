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

/*
 * Geolocation module
 * This module handles geographical input types, like finding the current position of 
 * the device or selecting a location on the map.
 */

var geoLocationManager = new function()
{
	this.qID = -1;
	this.locating = false;
	this.map;
	this.marker = "";
	
	this.currentLat = 0;
	this.currentLng = 0;
	
	//standard functions
	this.initModule = function() {
		
	};
	
	this.initOnPage = function() {
		HTML = "<div id='map' class='preview'><div id='closeMap'>Set location</div></div>";
		$$(".page[data-page='survey'] .page-content").append(HTML);
		$$("#shareLoc").on('click',function(){
			if($$("input",this).is(':checked')) $$("input",this).attr("value", "");
			else geoLocationManager.getCurrentLocation($$("input",this).attr("name"));
		});
		$$(".button.marker").each(function( index ) {
  			$$(this).on('click',function(){
				geoLocationManager.openMapsWindow($$(this).attr("name"));
			});
		});
		$$("#closeMap").on('click',geoLocationManager.closeMapsWindow);
	};
	
	this.renderQuestions = function(type,ID,labelData){
		var HTML = "";
		switch(type)
		{
			case "ShareLocation":
				HTML = "<div class='selectContainer' name='q"+ID+"'>";
				HTML += "<label id='shareLoc' class='checkContainer'>I accept to share my current location";
				HTML += "<input type='checkbox' name='q"+ID+"' id='accept' value='' />";
				HTML += "<span class='checkmark'></span>";
				HTML += "</label>";
				HTML += "</div>"
			break;
								
			case "ChooseLocation":
				HTML = "<div class='fileContainer Location' name='q"+ID+"' data-value=''>";
				HTML += "	<p id='location'>No location selected</p>";
				HTML += "	<div class='optionContainer'>";
				HTML += "		<div id='openMap' class='button marker' name='q"+ID+"'></div>";
				HTML += "		<p class='label'>Choose a location</p>";
				HTML += "	</div>";
				HTML += "</div>";
			break;
		}
		return HTML;
	};
	
	this.validate = function(type,ID,required,rID){
		var info = {};
		info.val = "";
		info.error = false;
		info.checked = false;
		
		switch(type)
		{
			case "ShareLocation":
				if($$("#questions #shareLoc input[name='"+ID+"']:checked").length > 0)
				{
					$$("#questions .selectContainer[name='"+ID+"']").removeClass("required");
					info.val = $$("#questions #shareLoc input[name='"+ID+"']:checked").val();
				}
				else
				{
					if(required === "1")
					{
						$$("#questions .selectContainer[name='"+ID+"']").addClass("required");
						info.error = true;
					}
					info.val = "Not agreed";
				}
				info.checked = true;
			break;
			
			case "ChooseLocation":
				$$(".fileContainer[name='"+ID+"']").removeClass("required");
				info.val = $$(".fileContainer[name='"+ID+"']").attr("data-value");
				if(info.val === "" && required === "1")
				{
					$$(".fileContainer[name='"+ID+"']").addClass("required");
					info.error = true;
				}
				info.checked = true;
			break;
		}
		return info;
	};
	
	//module specific functions
	this.getCurrentLocation = function(qID){
		if(geoLocationManager.qID === -1){
			geoLocationManager.qID = qID;
			$$(".messageOverlay span").html("Determining position of device, hold on...");
			$$(".messageOverlay").css("display","table");
    		navigator.geolocation.getCurrentPosition(geoLocationManager.onRetrieveCurrentPosition, geoLocationManager.onFailCurrentPosition, { timeout: 3000, enableHighAccuracy: true });
		}
	};
	
	this.onRetrieveCurrentPosition = function(position){
		geoLocationManager.currentLat = position.coords.latitude;
		geoLocationManager.currentLng = position.coords.longitude;
		var Latitude = "Lat: "+position.coords.latitude;
    	var Longitude = "Lng: "+position.coords.longitude;
		
		if(!geoLocationManager.locating){
			$$("#shareLoc input[name='"+geoLocationManager.qID+"']").attr("value",Latitude+", "+Longitude);
			geoLocationManager.qID = -1;
		} else {
			geoLocationManager.initMap();
		}
		
		$$(".messageOverlay").css("display","none");
		geoLocationManager.locating = false;
	};
	
	this.onFailCurrentPosition = function(error){
		myApp.alert("Not able to determine device's position, check if GPS is enabled.", "GPS turned off");
		if(!geoLocationManager.locating){
			$$("#shareLoc input[name='"+geoLocationManager.qID+"']").prop('checked', false);
			geoLocationManager.qID = -1;
		} else {
			//cannot locate current user, set it on Eindhoven
			geoLocationManager.currentLat = STANDARD_LAT;
			geoLocationManager.currentLng = STANDARD_LNG;
			geoLocationManager.initMap();
		}
		
		$$(".messageOverlay").css("display","none");	
		geoLocationManager.locating = false;
	};
	
	this.openMapsWindow = function(qID)
	{
		if(geoLocationManager.qID === -1){
			$$('#map').css('display','block');
			if(geoLocationManager.currentLat !== 0 || geoLocationManager.currentLng !== 0)
			{
				$$(".fileContainer[name='"+qID+"']").attr("data-value","");
				$$(".fileContainer[name='"+qID+"'] #location").html("No location selected");
				geoLocationManager.initMap();
			}
			else
			{
				geoLocationManager.locating = true;
				$$(".messageOverlay span").html("Determining position of device, hold on...");
				$$(".messageOverlay").css("display","table");
				navigator.geolocation.getCurrentPosition(geoLocationManager.onRetrieveCurrentPosition, geoLocationManager.onFailCurrentPosition, { timeout: 3000, enableHighAccuracy: true });
			}
			geoLocationManager.qID = qID;
		}
	};
	
	this.initMap = function() {
		$$('.page[data-page="survey"] .content-block').css('visibility','hidden').css('position','absolute');
		$$('.page[data-page="menu"]').css('visibility','hidden');
		geoLocationManager.map = plugin.google.maps.Map.getMap(document.getElementById('map'), {
  			camera: {
    			target: {"lat": geoLocationManager.currentLat, "lng": geoLocationManager.currentLng},
    			zoom: 10
  			}
		});
		geoLocationManager.map.addEventListener(plugin.google.maps.event.MAP_READY, geoLocationManager.onMapReady);
	}
	
	this.onMapReady = function() {
		geoLocationManager.map.addEventListener(plugin.google.maps.event.MAP_CLICK, function(latLng){
			
			var Latitude = "Lat: "+latLng.lat;
    		var Longitude = "Lng: "+latLng.lng;
			
			$$(".fileContainer[name='"+geoLocationManager.qID+"']").attr("data-value",Latitude+", "+Longitude);
			$$(".fileContainer[name='"+geoLocationManager.qID+"'] #openMap + p.label").html("Choose a new location");
			
			if(geoLocationManager.marker !== "") geoLocationManager.marker.remove();
			geoLocationManager.map.addMarker({
				"position": latLng
			}, function(marker){
				plugin.google.maps.Geocoder.geocode({
					"position": latLng
				}, function(results){
					if(results.length === 0){
						myApp.alert("Please select another location","Location not found");
						return;
					}
					
					var adress = [
						results[0].thoroughfare+", " || "",
						results[0].subThoroughfare+", " || "",
						results[0].postalCode+", " || "",
						results[0].locality+", " || "",
						results[0].adminArea+", " || "",
						results[0].country || ""];
					
					var adressString = "";
					for(i = 0; i < adress.length; i++)
					{	if(adress[i] !== "" && adress[i] !== "undefined, " && adress[i] !== "(null), " && adress[i] !== ", ") adressString += adress[i];	}
					
					geoLocationManager.marker = marker;
					marker.setTitle(adressString).showInfoWindow();
					$$(".fileContainer[name='"+geoLocationManager.qID+"'] #location").html("You selected " + adressString);
				});
			});
		});
	};
	
	this.closeMapsWindow = function()
	{
		if(geoLocationManager.marker === ""){
			myApp.alert("Please choose a location on the map to answer this question.","You did not choose a location");
			$$(".fileContainer[name='"+geoLocationManager.qID+"'] #openMap + p.label").html("Choose a location");
		}
		geoLocationManager.marker = "";
		geoLocationManager.map.remove();
		geoLocationManager.map = null;
		
		$$('#map').css('display','none');
		$$('.page[data-page="survey"] .content-block').css('visibility','visible').css('position','relative');
		$$('.page[data-page="menu"]').css('visibility','visible');
		
		geoLocationManager.qID = -1;
	};
}
modules.push(geoLocationManager);