var $UpdateTimer;
var $charts = []; // List of charts, helpful, if you want to plot multiple data in one chart or multiple charts on one page
var $zoomlevel = ['no zoom'];  // for dynamic data zoom feature
var currentTime = new Date();
var $UTCOffset = (currentTime.getTimezoneOffset()) * 60; // the view should show the date in UTC, therefore we need to convert our date
var $changes; // for the Live update


function plotSubmit(controldevicename, databasename, devicename,subdevicename,sT,eT) {
	clearInterval($UpdateTimer);
	automaticupdate = false;
	$("#container").text("Loading..");
	starttime = parseInt(sT);
	endtime = parseInt(eT);
	getData(controldevicename,databasename,devicename,subdevicename,starttime,endtime);
	
}

function getData(controldevicename, databasename, devicename,subdevicename,starttime,endtime) {
	
	if (controldevicename == undefined) return;
	var startdate = new Date((starttime+$UTCOffset)*1000);
	var enddate = new Date((endtime+$UTCOffset)*1000);
	
	var y1 = startdate.getFullYear();
	var m1 = startdate.getMonth();
	var d1 = startdate.getDate();
	var h1 = startdate.getHours();
	var min1 = startdate.getMinutes();
	var s1 = startdate.getSeconds();
	var ms1 = startdate.getMilliseconds();
	
	var y2 = enddate.getFullYear();
	var m2 = enddate.getMonth();
	var d2 = enddate.getDate();
	var h2 = enddate.getHours();
	var min2 = enddate.getMinutes();
	var s2 = enddate.getSeconds();
	var ms2 = enddate.getMilliseconds();
	var grouplevel = 8;
	if ((endtime-starttime) > 3*3600) {grouplevel=7;} 		//minutes
	if ((endtime-starttime) > 10*24*3600) {grouplevel=6;}  // hours
	
	var viewname;
	if (controldevicename == 'DataGenerators') {
		viewname = "Skeleton/bytime";
	}
	if (controldevicename == 'Labjacks') {
		viewname = "Labjack/bytime";
	}
	$.couch.db(databasename).view(viewname, {startkey:[devicename,subdevicename,y1,m1,d1,h1,min1,s1,ms1], endkey:[devicename,subdevicename,y2,m2,d2,h2,min2,s2,ms2], group_level:grouplevel, stale:'update_after', success: function(data) {
			var d = [];
			for (var i in data.rows) {
				for (j=0;j<8;j++) {if (data.rows[i].key[j]==undefined){data.rows[i].key[j]=0;}}
				d[i]= [new Date((new Date(data.rows[i].key[2],data.rows[i].key[3],data.rows[i].key[4],data.rows[i].key[5],data.rows[i].key[6],data.rows[i].key[7])).getTime()-$UTCOffset*1000), data.rows[i].value['avg']];
			}
			plotData(controldevicename+"_"+databasename+"_"+devicename+"_"+subdevicename,d, starttime,endtime,grouplevel);
	}});
}

function plotData(chart_name, devicedata,starttime,endtime,grouplevel) {
	$charts[chart_name] = undefined;
	var tmparray = chart_name.split('_');
	var controldevicename = tmparray[0];
	var databasename = tmparray[1];
	var devicename = tmparray[2];
	var subdevicename = tmparray[3];
	
	var startDate = new Date(starttime*1000);
	var endDate = new Date(endtime*1000);
	
	var y1 = startDate.getFullYear();
	var m1 = ("0" + (startDate.getMonth() + 1)).slice(-2);
	var d1 = ("0" + startDate.getDate()).slice(-2);
	var h1 = ("0" + startDate.getHours()).slice(-2);
	var mi1 = ("0" + startDate.getMinutes()).slice(-2);
	var sDate =  y1+"/"+m1+"/"+d1+" "+h1+":"+mi1
	
	var y2 = endDate.getFullYear();
	var m2 = ("0" + (endDate.getMonth() + 1)).slice(-2);
	var d2 = ("0" + endDate.getDate()).slice(-2);
	var h2 = ("0" + endDate.getHours()).slice(-2);
	var mi2 = ("0" + endDate.getMinutes()).slice(-2);
	var eDate = y2+"/"+m2+"/"+d2+" "+h2+":"+mi2

	
	if(devicedata.length == 0) {
		$('#container').text('No Data');
	}
	else {
		$charts[chart_name] = new Dygraph(
			document.getElementById('container'),			// div Element, in which chart will be created
			devicedata,										// data
			{												// Chart Options
			labels: ['Time', subdevicename],
			title: "<h4>"+ sDate +" - "+ eDate +"<h4>",
			sigFigs : 4,										// number of significant figures
			clickCallback: function(e, x, pts) {
					if ($zoomlevel[0] != 'no zoom') {
						var s = $zoomlevel[0][0];
						var e = $zoomlevel[0][1];
						$zoomlevel.shift();
						$("#container").text('Loading...');
				        getData(controldevicename, databasename, devicename,subdevicename,s,e);
				    }
				    else {return;}
		    },									
			zoomCallback : function(minDate, maxDate, yRanges) {				// acquires new data points if zoomed
					var range = $charts[chart_name].xAxisRange();
					var start = minDate/1000;
					var end = maxDate/1000;
					if (grouplevel!=8 && ((end-start) < 5*3600 || (end - start) < 10*24*3600) ) {
						$("#container").text('Loading..');
						$zoomlevel.unshift([starttime, endtime]);
						getData(controldevicename, databasename, devicename,subdevicename,start,end);
			}}});
			$("#container").width($(window).width()-50);
			$charts[chart_name].resize();
			$(window).resize(function(){
   			$("#container").width($(window).width()-50);
			});
	}	
}

function Last5MinsviaChangesfeed(controldevicename,databasename,devicename,subdevicename) {
	$charts[controldevicename+"_"+databasename+"_"+devicename+"_"+subdevicename+'_live'] = undefined;
	$("#livecontainer").text("Loading..");
	theTime = new Date();
	start = (theTime.getTime()+$UTCOffset*1000) - (1000 *5*60);
	starttime = new Date(start);

	var viewname;
	var datavalue;
	
	if (controldevicename == 'DataGenerators') {
		viewname = "Skeleton/bytime";
		datavalue = 'data';
	}
	if (controldevicename == 'Labjacks') {
		viewname = "Labjack/bytime";
		datavalue = 'value';
	}
	
	var y1 = starttime.getFullYear();
	var m1 = starttime.getMonth();
	var d1 = starttime.getDate();
	var h1 = starttime.getHours();
	var min1 = starttime.getMinutes();
	var s1 = starttime.getSeconds();
	var ms1 = starttime.getMilliseconds();
	
	$.couch.db(databasename).view(viewname, {startkey:[devicename,subdevicename,y1,m1,d1,h1,min1,s1,ms1], endkey:[devicename,subdevicename,{}], group:true, success: function(data) {
			var d = [];
			for (var i in data.rows) {
				d[i]= [new Date((new Date(data.rows[i].key[2],data.rows[i].key[3],data.rows[i].key[4],data.rows[i].key[5],data.rows[i].key[6],data.rows[i].key[7])).getTime()-$UTCOffset*1000), data.rows[i].value['avg']];
			}
			plotUpdateData(controldevicename+"_"+databasename+"_"+devicename+"_"+subdevicename+'_live',d);
			$changes = $.couch.db(databasename).changes();
			$("#deviceLive").on("blur", function() {$.log('blur');$changes.stop();});
			$changes.onChange(function(data) {
				for (l in data.results) {
					$.couch.db(databasename).openDoc(data.results[l].id, {success: function(resp) {
						if(resp['time'] != undefined) {
							while ((new Date(d[0][0])).getTime() < (new Date()).getTime()-5*60*1000) {d.shift();}
	   						d.push([new Date(resp['time']*1000),resp[devicename][subdevicename][datavalue]]);
	   						plotUpdateData(controldevicename+"_"+databasename+"_"+devicename+"_"+subdevicename+'_live',d);
	   					}
   					}});	
				}
			});
	}});
}

function plotUpdateData(chart_name,devicedata) {
	var tmparray = chart_name.split('_');
	if(devicedata.length == 0) {
		$('#livecontainer').text('No Data');
	}
	else {
		if($charts[chart_name]==undefined) {
			$charts[chart_name] = new Dygraph(
				document.getElementById('livecontainer'),			// div Element, in which chart will be created
				devicedata,										// data
				{												// Chart Options
				labels: ['Time', tmparray[3]],
				title: "<h4> Last 5 minutes <h4>",
				sigFigs : 4
			});
			$("#livecontainer").width($(window).width()-50);
			$charts[chart_name].resize();
			$(window).resize(function(){
   			$("#livecontainer").width($(window).width()-50);
			});	
		}
		else {
		$charts[chart_name].updateOptions( { 'file': devicedata });
		$charts[chart_name].resize();
		}
	}
}
