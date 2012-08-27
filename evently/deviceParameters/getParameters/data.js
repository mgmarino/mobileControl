function(data,e, controldevicename,databasename,devicename,subdevicename) {
	$("#deviceName").text(controldevicename+" - "+databasename+" - "+devicename+" - "+subdevicename);
	if(controldevicename=='Labjacks') {
		controldocname = 'ControlDoc';
	}
	if(controldevicename=='DataGenerators') {
		controldocname = 'Parameter';
	}
	var parameterlist = [];
	if(data[devicename] != undefined && data[devicename][subdevicename]!=undefined) {
		for(i in data[devicename][subdevicename]) {
					parameterlist.push({'parameter' : i, 'value' : data[devicename][subdevicename][i],'subdevicename' : subdevicename, 'devicename' : devicename});
		}			
		return { parameters : parameterlist, controldevicename : controldevicename, databasename : databasename, devicename : devicename, subdevicename : subdevicename, doc : JSON.stringify(data), ControlDocName : controldocname};
	}
	else {
		$("#deviceParameters").html("<div data-role='collapsible' data-collapsed='false''> <h3>Parameters</h3><p> No parameters found</p></div>");
		$("#deviceParameters").trigger("create");
		return;
	}
}
