var $UpdateTimer;
var $charts = []; // List of charts, helpful, if you want to plot multiple data in one chart
var $zoomlevel = ['no zoom'];  // for dynamic data zoom feature


function plotSubmit(controldevicename, databasename, devicename,subdevicename,sT,eT) {
	clearInterval($UpdateTimer);
	automaticupdate = false;
	$("#container").text("Loading..");
	starttime = parseInt(sT);
	endtime = parseInt(eT);
	$.log(controldevicename);
	getData(controldevicename,databasename,devicename,subdevicename,starttime,endtime);
	
}

function getData(controldevicename, databasename, devicename,subdevicename,starttime,endtime) {
	
	if (controldevicename == undefined) return;
	var startdate = new Date(starttime*1000);
	var enddate = new Date(endtime*1000);
	
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
	if ((endtime-starttime) > 3*3600) {grouplevel=7;} 
	if ((endtime-starttime) > 10*24*3600) {grouplevel=6;}
	
	var viewname;
	if (controldevicename == 'DataGenerators') {
		viewname = "Skeleton/bytime";
	}
	if (controldevicename == 'Labjacks') {
		viewname = "Labjack/bytime";
	}
	$("dingdong");
	$.couch.db(databasename).view(viewname, {startkey:[devicename,subdevicename,y1,m1,d1,h1,min1,s1,ms1], endkey:[devicename,subdevicename,y2,m2,d2,h2,min2,s2,ms2], group_level:grouplevel, success: function(data) {
			var d = [];
			for (var i in data.rows) {
				for (j=0;j<8;j++) {if (data.rows[i].key[j]==undefined){data.rows[i].key[j]=0;}}
				d[i]= [new Date(data.rows[i].key[2],data.rows[i].key[3],data.rows[i].key[4],data.rows[i].key[5],data.rows[i].key[6],data.rows[i].key[7]), data.rows[i].value['avg']];
			}
			$.log('doing');
			plotData(controldevicename+"_"+databasename+"_"+devicename+"_"+subdevicename,d, starttime,endtime,grouplevel);
	}});
}

function plotData(chart_name, devicedata,starttime,endtime,grouplevel) {
	$.log('plotData');
	$.log(chart_name);
	chartname = chart_name;
	var tmparray = chartname.split('_');
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
	var mi2 = ("0" + startDate.getMinutes()).slice(-2);
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
			sigFigs : 3,										// number of significant figures
			clickCallback: function(e, x, pts) {
					if ($zoomlevel[0] != 'no zoom') {
						$.log($zoomlevel);
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
						$.log($zoomlevel);
						getData(controldevicename, databasename, devicename,subdevicename,start,end);
			}}});
			$("#container").width($(window).width()-50);
			$charts[chart_name].resize();
			$(window).resize(function(){
   			$("#container").width($(window).width()-50);
   			$.log($(window).width());
			});
	}	
}
