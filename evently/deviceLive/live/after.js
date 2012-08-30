function (data) {
    $.log("evently/deviceLive/after.js" );
	if (!$firstview_deviceLive) {$("#deviceLive").trigger("create");}
   	$firstview_deviceLive = false;
    return data;
}
