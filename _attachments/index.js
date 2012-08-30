var updateDatabaseInfo; // timer for collecting databases 
var refreshControlDevicesPage; //timer for updating the main page
var $DevicesList = {};			// THE MAIN LIST in which are stored all the found devices
var FoundALabjack = false;
var FoundASkeleton = false;
var firstLoad = true;
var $firstview = true; // to prevent a bug in the theme
var $firstview_deviceData = true; // 
var $firstview_deviceLive = true; 

$(document).bind('pagebeforecreate', function() {	// jQuery mobile uses this function instead of  $(document).ready()
	collectDBs();
	updateHTML();
});

$.couch.app(function (app) {
        $("#dbListContent").evently("dbListContent", app);
        $("#deviceParameters").evently("deviceParameters", app);
        $("#deviceData").evently("deviceData", app);
        $("#deviceLive").evently("deviceLive", app);
});

function collectDBs() {
	clearInterval(updateDatabaseInfo);
    $.couch.allDbs( { success : function(dbs) { loadDBList(dbs); } });
    updateDatabaseInfo = setInterval('collectDBs()', 2000);
}

function loadDBList(dbs) {
    dbs.forEach(function(db1) {
        var aDB = $.couch.db(db1);
		aDB.allDocs( { keys : ['Parameter'] , 				// for data generator 
			success: function(data) {
				for(var i in data.rows) {
					if (data.rows[i]['error']) return;
				}
				foundSkeleton(db1);
			}, error : function(data){$.log(data);}});

		if(db1.match("labjack")){							// for LabJack
			foundLabJack(db1);
		}
    });
}

function foundSkeleton(aDataBaseName) {
	FoundASkeleton = true;
	if($DevicesList['DataGenerators']==undefined) {
	$DevicesList['DataGenerators'] = {};
	}
	getView(aDataBaseName,"Skeleton/bykey",'DataGenerators');
}

function foundLabJack(aDataBaseName) {
	FoundALabjack = true;
	if($DevicesList['Labjacks']==undefined) {
	$DevicesList['Labjacks'] = {};
	}
	getView(aDataBaseName,"Labjack/bykey", 'Labjacks');
}

function getView(aDataBaseName,aViewName,id) {

	var aDataBase = $.couch.db(aDataBaseName);
	
	aDataBase.view(aViewName, {group_level : 2, stale : 'update_after', success : function(doc) {
		if ($DevicesList[id][aDataBaseName]==undefined) {
			$DevicesList[id][aDataBaseName] = {};
		}
		for (i in doc.rows) {
			if ($DevicesList[id][aDataBaseName][doc.rows[i].key[0]] == undefined) {
				$DevicesList[id][aDataBaseName][doc.rows[i].key[0]] = {};	
			}
			$DevicesList[id][aDataBaseName][doc.rows[i].key[0]][doc.rows[i].key[1]] = doc.rows[i].value;
		}
		$.couch.app(function (app) {
	});
	}});
}

function updateHTML() {
// this functions renders the Lists of devices to HTML collapsible list
	
    // var content = '<div data-role="collapsible-set">';
    var content = "";
    var count = 0;
    
  	if (FoundASkeleton) {
  		content += '<div data-role="collapsible">';
  		content += '<h3>Data generators</h3>';
  		content += '<ul data-role="listview" data-theme="b">';
		for (var dbName in $DevicesList['DataGenerators']) {
			count = count+1;
			content += '<li><a href="#dbListPage" data-transition="slide" id="DataGenerators_'+dbName+'">' + dbName +'</a></li>';
		}
		content += '<ul>';	
		content += '</div>';
	}
	if (FoundALabjack) {
  		content += '<div data-role="collapsible">';
  		content += '<h3>Labjacks</h3>';
  		content += '<ul data-role="listview" data-theme="b">';
		for (var dbName in $DevicesList['Labjacks']) {
			count = count+1;
			content += '<li> <a href="#dbListPage" data-transition="slide" id="Labjacks_'+dbName+'">' + dbName +'</a></li>';
		}
		content += '<ul>';	
		content += '</div>';
	}
	//content += '</div>'
	// Labview, etc?

    if(count>0){
		clearInterval(refreshControlDevicesPage);
		clearInterval(updateDatabaseInfo);
		
        $('#controlDevicesContent').html(content);
        $.couch.app(function (app) {
        $("#controlDevicesContent").evently("controlDevicesContent", app);
		});
        $("#controlDevicesContent").trigger("create");
    }
	else {
		clearInterval(refreshControlDevicesPage);
	    refreshControlDevicesPage = setInterval('updateHTML()', 2000);
        if(firstLoad){
            $('#controlDevicesContent').text("Loading");
            firstLoad = false;
        }
        else {
            $('#controlDevicesContent').innerHTML = "There are no devices in CouchDB";
        }
    }
}

function getParameters(controldevicename, dbname,devicetype,devicename, ControlDocName,callback) {
// get Parameters from doc file
	$.couch.db(dbname).openDoc(ControlDocName, {async : false,
		success : function(data) {
				callback(data);
		},
		error : function(error) {
			alert("Error");
			$.log(error);
		}	
	});
}

function doView (view, json, callback) {
        $.log("dbViewWithKey ");
        $.log(json);
        $db.view(($appname + "/" + view),
                XXmerge (json, {
                        async : false,
                        success: function (data) {
                                callback(data);
                        },
                        error: function () {
                                alert("Cannot find the document with id " + keyvalue);
                        }
    })
        );
}
function doStoreDocument(document) {
        $db.saveDoc(document, {
                async : false,
                success: function (data) {
                        $("body").data.docEdited = data.id;
        $.log("store - success" + data.id + " " +  data.rev);
                        //  $.mobile.changePage("#editPage", "slidedown", true, true);
                },
    error: function () {
        alert("Cannot save new document.");
    }
});
}
