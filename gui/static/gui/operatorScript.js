var map, infoWindow;
var marker = null;
var mapCircle = null;

window.addEventListener('load',function(){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyB1Vj3dEqjSUukuDpbkNkA7di9CvUJ1nZ4&libraries=places&callback=activatePlacesSearch';
    document.body.appendChild(script);
	var pk = window.location.href;
    console.log(pk);
    pk = pk.split('op/')[1];
    pk = pk.split('/')[0];
    sessionStorage.setItem('pk', pk);
});

function activatePlacesSearch(){
	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(1.464993,103.578175),
		zoom: 11,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	}
	map = new google.maps.Map(mapCanvas, mapOptions);
	
    var options = {
        componentRestrictions: {country: "SG"}
    };

    var input = document.getElementById("address");
    var autocomplete = new google.maps.places.Autocomplete(input, options);
    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
		var lat = place.geometry.location.lat();
		var lng = place.geometry.location.lng()
        sessionStorage.setItem('templat', lat);
        sessionStorage.setItem('templng', lng);
		geocodePosition(lat, lng);
    });
}

function geocodePosition(lat, lng) {
	var geocoder= new google.maps.Geocoder();
	geocoder.geocode({
		latLng: new google.maps.LatLng(lat,lng)
	}, function(responses) {
		if (responses && responses.length > 0) {
			//var marker = addMarker(lat, lng, markerlogo, "<h4>"+responses[0].formatted_address+"</h4>");
			var marker = addMarker(lat, lng, "", "<h4>"+responses[0].formatted_address+"</h4>");
			var rad = document.getElementById('maprad').value;
			if(rad == "")
				rad = 0;
			addRadius(lat, lng, rad);
			document.getElementById("address").value = responses[0].formatted_address;
			map.setZoom(17);
			map.panTo(marker.getPosition());
		} else {
			alert('Cannot determine address at this location.');
		}
	});
}

// Add Marker Function
function addMarker(lat, lng, imageUrl, content){
	if(marker != null) {
		marker.setMap(null);
	}
	
	marker = new google.maps.Marker({
		position:new google.maps.LatLng(lat, lng),
		map:map,
		//icon:imageUrl
	});

	// Check for customicon
	if(imageUrl){
		// Set icon image
		marker.setIcon(imageUrl);
	}

	// Check content
	if(content){
		infoWindow = new google.maps.InfoWindow({
			content:content
		});

		marker.addListener('click', function(){
			infoWindow.open(map, marker);
		});
		
	}
	return marker;
}

// Add radius circle
function addRadius(lat, lng, rad){
	if(mapCircle != null) {
		mapCircle.setMap(null);
	}
	
	// Add theradius circle to the map.
	mapCircle = new google.maps.Circle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.7,
		strokeWeight: 1,
		fillColor: '#FF0000',
		fillOpacity: 0.3,
		map: map,
		center: new google.maps.LatLng(lat, lng),
		radius: parseFloat(rad)
	});
	if(marker == null)
		document.getElementById("radBtn").disabled = true;
	else
		document.getElementById("radBtn").disabled = false;
}

function changeButtonText(){
    var submitButton = document.getElementById("submitButton");
    if (document.getElementById("crisis").checked) {
        submitButton.innerHTML = "Submit";
    } else {
        submitButton.innerHTML = "Save";
    }
    showCasulty(document.getElementById("crisis").checked);
}

function showCasulty(bool){
    if (bool) {
        document.getElementById('casualtyDiv').style.display = 'block';
    } else {
        document.getElementById('casualtyDiv').style.display = 'none';
    }
}

function validateNric() {
    var nric = document.getElementById('identity').value;

    if (nric.length != 9) {
        if(nric.length === 0){
    	    return;
    	} else {
    	    document.getElementById('identity').value = "";
            alert("Invalid NRIC/FIN \"" + nric.toUpperCase() + "\" Please retype");
            document.getElementById('identity').focus();
            return;
    	}
    }

	nric = nric.toUpperCase();

    var i,
    icArray = [];
    for(i = 0; i < 9; i++) {
        icArray[i] = nric.charAt(i);
    }

    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;

    var weight = 0;
    for(i = 1; i < 8; i++) {
        weight += icArray[i];
    }

   	var offset = (icArray[0] == "T" || icArray[0] == "G") ? 4:0;
    var temp = (offset + weight) % 11;

    var st = ["J","Z","I","H","G","F","E","D","C","B","A"];
    var fg = ["X","W","U","T","R","Q","P","N","M","L","K"];

    var theAlpha;
    if (icArray[0] == "S" || icArray[0] == "T") { theAlpha = st[temp]; }
    else if (icArray[0] == "F" || icArray[0] == "G") { theAlpha = fg[temp]; }

    if(icArray[8] != theAlpha) {
    	document.getElementById('identity').value = "";
        alert("Invalid NRIC/FIN \"" + nric.toUpperCase() + "\" Please retype");
        document.getElementById('identity').focus();
    }
}

function detectOthers() {
    var choice = document.getElementById("category").value;
    if(choice == "Others") {
        document.getElementById('categoryDiv').style.display = 'block';
    }
    else {
        document.getElementById('categoryDiv').style.display = 'none';
        document.getElementById('otherCategory').value = "";
    }

}

function appendTitle() {
    var category = document.getElementById('category').value;
    var time = onTimeChange('timeInput');
    var location = document.getElementById('addressTB').value;

    if(category != "" && time != "" && location != "") {
        if(category == "Others") {
            var otherCategory = document.getElementById('otherCategory').value;
            document.getElementById('title').value = otherCategory + " @ " + location + " @ " + time;
        }
        else {
            document.getElementById('title').value = category + " @ " + location + " @ " + time;
        }
    }
}

function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("identity").value = "";
    document.getElementById("category").value = "";
    document.getElementById("otherCategory").value = "";
    document.getElementById("categoryDiv").style.display = 'none';
    document.getElementById("address").value = "";
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("green").checked = true;
    document.getElementById("casualty").value = "0";
	document.getElementById("radius").value = "0";
    getDateTimeNow();
}

function onTimeChange(timeInput) {
  var inputEle = document.getElementById(timeInput);
  var timeSplit = inputEle.value.split(':'),
    hours,
    minutes,
    meridian;
  hours = timeSplit[0];
  minutes = timeSplit[1];
  if (hours > 12) {
    meridian = 'PM';
    hours -= 12;
  } else if (hours < 12) {
    meridian = 'AM';
    if (hours == 0) {
      hours = 12;
    }
  } else {
    meridian = 'PM';
  }
  return (hours + ':' + minutes + ' ' + meridian);
}

window.setTimeout(function() {
    $(".alert").fadeTo(1500, 0).slideUp(1500, function(){
        $(this).remove();
    });
}, 5000);

$(document).on('submit','#operator_form',function(e){
    e.preventDefault();
    var cat = document.getElementById("category").value;
    if (cat == "Others") {
        cat = document.getElementById("otherCategory").value;
        if(cat == "")
        {
            document.getElementById("otherCategory").focus();
            return alert("Please fill in Other Category")
        }
    }
    var opId = document.getElementById("userId").innerText;
    opId = opId.split('ator ')[1];
    opId = opId.split(' ')[0];
    var pk = sessionStorage.getItem('pk');
    var inputLat = sessionStorage.getItem('lat');
    var inputLng = sessionStorage.getItem('lng');
    var inputTime = document.getElementById("timeInput").value;
    var inputDate = document.getElementById("dateInput").value;
    //var casualtyInput = document.getElementById("casualty").value;
	var radius = document.getElementById("radius").value;
    $.ajax({
        type:'POST',
        url:'/op/' + pk + '/' + opId + '/create/report/',
        data:{
            name: $('#name').val(),
            identity: $('#identity').val(),
            date: inputDate,
            time: inputTime,
            category: cat,
            address: $('#address').val(),
            title: $('#title').val(),
            description: $('#description').val(),
            priority: $('input[name=priority]:checked').val(),
            //casualty: casualtyInput,
            operatorId: opId,
            lat: inputLat,
            lng: inputLng,
            radius: $('#radius').val(),
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success:function(){
            location.reload();
            $('html, body').animate({ scrollTop: 0 }, 0);
        }
    });
});

function getDateTimeNow() {
    var date = moment().format('YYYY-MM-DD');
    var time = moment().format();
    document.getElementById('dateInput').value = date;
    document.getElementById('timeInput').value = time.slice(11,16);
}

$(document).ready(function(){
    getDateTimeNow();
});

$(window).on('shown.bs.modal', function(){
    google.maps.event.trigger(map, 'resize');
	if(!document.getElementById("address").value)
		document.getElementById("address").focus();
});

function clearAddress(){
	if(marker != null) {
		marker.setMap(null);
		marker = null;
		mapCircle.setMap(null);
		mapCircle = null;
		document.getElementById("radBtn").disabled = true;
	}
	document.getElementById("address").value = "";
}

function verifyLoc(){
	if(marker == null) {
		alert("Use the search function to get the Incident Location.\nOr press the Close button if you do not want any Incident Location.");
		return false;
	} else {
		sessionStorage.setItem('lat', sessionStorage.getItem('templat'));
		sessionStorage.setItem('lng', sessionStorage.getItem('templng'));
		var content = infoWindow.getContent();
		content = content.split("<h4>")[1];
		content = content.split("</h4>")[0];
		document.getElementById("addressTB").value = content;
		appendTitle();
		if(mapCircle != null || mapCircle != "") {
			document.getElementById("radius").value = mapCircle.radius;
		}
		$('#mapModal').modal('hide');
		return true;
	}
}

function validateInputs(){
	var cat = document.getElementById("category").value;
	if (cat == "Others") {
        cat = document.getElementById("otherCategory").value;
    }
	var date = document.getElementById("dateInput").value;
	var time = document.getElementById("timeInput").value;
	var loc = document.getElementById("addressTB").value;
	var radius = document.getElementById("radius").value;
	var title = document.getElementById("title").value;
	var description = document.getElementById("description").value;

	if(cat == "" || date == "" || time == "" || loc == "" || radius == "" || title == "" || description == "") {
		alert("Please check your inputs. There are some required fields not filled.");
		return false;
	}
	return true;
}

function updateAddress(){
	if(marker == null) {
		document.getElementById("addressTB").value = "";
	}
	if(mapCircle == null) {
		document.getElementById("radius").value = "";
	}
}

function checkKeyDown(radiusID){
	// Select your input element.
	var radius = document.getElementById(radiusID);

	// Listen for input event on numInput.
	radius.onkeydown = function(e) {
		if(!((e.keyCode > 95 && e.keyCode < 106)
			|| (e.keyCode > 47 && e.keyCode < 58) 
			|| e.keyCode == 8)) {
			return false;
		}
	}
	return true;
}

function updateRadius(){
	if(mapCircle != null) {
		mapCircle.setMap(null);
		mapCircle = null;
	}
	var rad = document.getElementById('maprad').value;
	addRadius(sessionStorage.getItem('templat'), sessionStorage.getItem('templng'), rad);
}
