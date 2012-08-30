function(event, name, pass) {
    $.log("evently/dbListContent/dbList/selectors/a");
    var target = $(event.target);
	var tmpdevicearray = target.attr("id").split("_");
	var controldevice = tmpdevicearray[0];
	var database = tmpdevicearray[1];
	var device = tmpdevicearray[2];
	var subdevice = tmpdevicearray[3];
	
	$("#deviceParameters").trigger("getParameters",tmpdevicearray);
	$("#deviceData").trigger("setRange",tmpdevicearray);
	$("#deviceLive").trigger("live",tmpdevicearray);

}
