function (data) {
	var theDate = new Date();
	var y = theDate.getFullYear();
	var m = ("0" + (theDate.getMonth() + 1)).slice(-2);
	var d = ("0" + theDate.getDate()).slice(-2);
	var h = ("0" + theDate.getHours()).slice(-2);
	var mi = ("0" + theDate.getMinutes()).slice(-2);
	$('#startpoint').val(y-1+"/"+m+"/"+d+" "+h+":"+mi);
	$('#endpoint').val(y+"/"+m+"/"+d+" "+h+":"+mi);
	if (!$firstview_deviceData) {$("#deviceData").trigger("create");}
   	$firstview_deviceData = false;
	return data;
}


