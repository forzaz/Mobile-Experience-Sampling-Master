var geoLocationManager = new function()
{
	this.qID = -1;
	
	this.getCurrentLocation = function(qID){
		if(geoLocationManager.qID === -1){
			geoLocationManager.qID = qID;
    		navigator.geolocation.getCurrentPosition(geoLocationManager.onRetrieveCurrentPosition, geoLocationManager.onFailCurrentPosition, { timeout: 1000, enableHighAccuracy: true });
		}
	};
	
	this.onRetrieveCurrentPosition = function(position){
		var Latitude = "Lat: "+position.coords.latitude;
    	var Longitude = "Lng: "+position.coords.longitude;
		
		$$("#shareLoc input[name='"+geoLocationManager.qID+"']").attr("value",Latitude+", "+Longitude);
		
		geoLocationManager.qID = -1;

	};
	
	this.onFailCurrentPosition = function(error){
		myApp.alert("Not able to determine device's position, check if GPS is enabled.", "GPS turned off");
		$$("#shareLoc input[name='"+geoLocationManager.qID+"']").prop('checked', false);
		geoLocationManager.qID = -1;
	};
	
	this.getMapsLocation = function(qID){
		
	};
}