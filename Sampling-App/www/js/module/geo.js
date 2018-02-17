/**
 * Geolocation module
 * This module handles geographical input types, like finding the current position of 
 * the device or selecting a location on the map.
 * 
 * This module is developed by BOSONIC.design in assignment of the department 
 * of Human-Technology Interaction @ Eindhoven, University of Technology.
 * 
 * info@bosonic.design || http://www.bosonic.design/
 * hti@tue.nl || https://www.tue.nl/en/university/departments/industrial-engineering-innovation-sciences/research/research-groups/human-technology-interaction/
 * 
 * Released on: March, 2018 in Experience Sampling App 1.0.0
 */

var geoLocationManager = new function()
{
	this.qID = -1;
	this.locating = false;
	this.map;
	this.marker = "";
	
	this.currentLat = 0;
	this.currentLng = 0;
	
	this.init = function(div){
		geoLocationManager.openMapsWindow();
	};
	
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
			geoLocationManager.currentLat = 51.44164199999999;
			geoLocationManager.currentLng = 5.469722499999989;
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
					{	if(adress[i] !== "" && adress[i] !== "undefined, ") adressString += adress[i];	}
					
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