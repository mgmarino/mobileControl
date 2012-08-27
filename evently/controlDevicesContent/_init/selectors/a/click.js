function(event, name, pass) {
		$.log("evently/controlDevicesContent/_init/selectors/a/click.js");
        var target = $(event.target);
		var tmpdevicearray = target.attr("id").split("_");
		$("#dbListContent").trigger("dbList",tmpdevicearray);
}
