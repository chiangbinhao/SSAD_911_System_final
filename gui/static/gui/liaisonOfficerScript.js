function UpdatePKFunction(reportPk) {
    jQuery.ajax({
        url: '/lo/' + sessionStorage.getItem('loPk') + '/' + sessionStorage.getItem('loId') + '/retrieve/report/' + reportPk + '/',
        success: function (data) {
			var tabID = document.getElementById(reportPk).parentNode.id;
            var addclass = 'highlightDiv';
            $('#reportDetails').html(data);
            $('.individualTabContent').removeClass(addclass);
            $('#'+reportPk).addClass(addclass);
			sessionStorage.setItem('reportPk', reportPk);
			sessionStorage.setItem('tabID', tabID);
            $("#reportDetails").show();
        }
    });
};

$(function () {
	if (!Notification) 
		alert('Desktop notifications not available in your browser. Try Chromium.'); 

	if (Notification.permission !== "granted")
		Notification.requestPermission();
	
    var ws_path = "/stream/";
    console.log("Connecting to " + ws_path);
    var webSocketBridge = new channels.WebSocketBridge();
    webSocketBridge.connect(ws_path);
    webSocketBridge.listen();
    webSocketBridge.demultiplex('report', function (payload, streamName) {
        // Handle different actions
        if (payload.action == "create") {
			var notification = new Notification("911 Ops Alert", {
				icon: logo,
				body: payload.data.Priority + " alert\n" + payload.data.Title,
			});
			
			setTimeout(notification.close.bind(notification), 5000);
	
            var content = "<div class=\"individualTabContent\" id=\"" + payload.pk + "\"><a onclick='UpdatePKFunction("+ payload.pk + ")' class=\"nav-link\" href=\"#\">" + payload.data.Title + "</a></div>"

            if (payload.data.Priority =="red") {
                $("#redTab").append(content);
                var redcount = $("#redTab div").length;
                $("#redcount").html(redcount);
                // Remove empty message
                $("#redTab .empty").remove();
            }
            if (payload.data.Priority == "yellow") {
                $("#yellowTab").append(content);
                var yellowcount = $("#yellowTab div").length;
                $("#yellowcount").html(yellowcount);
                // Remove empty message
                $("#yellowTab .empty").remove();
            }
            if (payload.data.Priority == "green") {
                $("#greenTab").append(content);
                var greencount = $("#greenTab div").length;
                $("#greencount").html(greencount);
                // Remove empty message
                $("#greenTab .empty").remove();
            }
        } else if (payload.action == "update") {
            $("div[id=" + payload.pk + "]").remove();
            updatecount();
        } else if (payload.action == "delete") {
            $("div[id=" + payload.pk + "]").remove();
        } else {
            console.log("Unknown action " + payload.action);
        }
    });

    // Helpful debugging
    webSocketBridge.socket.addEventListener('open', function () {
        console.log("Connected to notification socket");
    });
    webSocketBridge.socket.addEventListener('close', function () {
        console.log("Disconnected to notification socket");
    });
});

window.setTimeout(function() {
    $(".alert").fadeTo(1500, 0).slideUp(1500, function(){
        $('.alert').hide();
    });
}, 5000);

window.addEventListener('load',function(){
    var url = window.location.href;
    url = url.split('lo/')[1];
    var loPk = url.split('/')[0];
    var loId = url.split('/')[1];
    loId = loId.split('/')[0];
    sessionStorage.setItem('loPk', loPk);
    sessionStorage.setItem('loId', loId);
    if(sessionStorage.getItem('first')) {
        var tabid = sessionStorage.getItem('first');
        $('#reportTabs a[href=\"' + tabid + '\"]').tab('show')
        $(tabid).find('a').first().trigger('click');
        sessionStorage.removeItem('first');
    } else {
        var firstDiv = $("#redTab:first-child").attr("id");
        $('#' + firstDiv).find('a').first().trigger('click');
    }
    updatecount();

});

$(document).on('submit','#lo_noncrisis_button_form',function(e){
    e.preventDefault();
    var reportPK = sessionStorage.getItem('reportPk');
	var tabID = sessionStorage.getItem('tabID');
    $.ajax({
        type:'POST',
        url:'update/report/' + reportPK + '/',
        data:{
            crisis: "n",
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success:function(data){
            if(data) {
                var numOfItems = $("#"+tabID).children().length;
                if(numOfItems >= 0) {
                    sessionStorage.setItem('first', '#' + tabID);
                }
                location.reload();
            }
        }
    });
});

$(document).on('submit','#lo_crisis_button_form',function(e){
    e.preventDefault();
	var lat = document.getElementById("lat").innerHTML;
	var lng = document.getElementById("lng").innerHTML;
	lng = lng.substring(0,12);
	var descrip = document.getElementById("description").innerHTML;
	var date_time = document.getElementById("date").innerHTML;
	var rad = document.getElementById("radius").innerHTML;
	rad = rad.split('ius: ')[1];
	rad = rad.split(' metre')[0];
    $.ajax({
        type:'POST',
        url: 'http://172.21.148.168/api/crisisreports/',
        data:{
            datetime: date_time,
			latitude: lat,
			longitude: lng,
			description: descrip,
			radius: rad,
            csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
        },
        success:function(data){
			var reportPK = sessionStorage.getItem('reportPk');
			var tabID = sessionStorage.getItem('tabID');
			$.ajax({
				type:'POST',
				url:'update/report/' + reportPK + '/',
				data:{
					crisis: "y",
					csrfmiddlewaretoken:$('input[name=csrfmiddlewaretoken]').val(),
				},
				success:function(data){
					if(data) {
						var numOfItems = $("#"+tabID).children().length;
						if(numOfItems >= 0) {
							sessionStorage.setItem('first', '#' + tabID);
						}
						location.reload();
					}
				}
			});
        }
    });
});

function updatecount(){
    var redcount = $("#redTab div").length;
    $("#redcount").html(redcount);
    var yellowcount = $("#yellowTab div").length;
    $("#yellowcount").html(yellowcount);
    var greencount = $("#greenTab div").length;
    $("#greencount").html(greencount);
}