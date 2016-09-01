var data_url='https://s3.amazonaws.com/dengue-barrel/data.json';
var data =getdata(data_url);
var barrel_area = null;
var picked_date = '';

var markerArray = [];
var mymap;
var heatPointArray = [];
var dateKeyArray = [];
var heat;
var mapPos;
var map_center;

for( var d in data){
	dateKeyArray.push(d);
}
dateKeyArray.sort();

$('.ui.dropdown').dropdown();

$(document).ready(function(){
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1;  //January is 0!
	var yyyy = today.getFullYear();
	today = yyyy+"-"+mm+"-"+dd;
	picked_date = today;
	append_card(data,today,0);
});

$('#datepicker').calendar({
  type: 'date',
  onChange: function(date){
  	var date_string = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate();
  	picked_date = date_string;
  	remove_cards();
  	barrel_area = getDistrictArea();
  	console.log(barrel_area);
  	console.log("datepicker "+ barrel_area + " "+ picked_date);
  	append_card(data,date_string,barrel_area);
  	setTimeout(function () {
        document.activeElement.blur();
    }, 15);
  },
});

$('.dropdown').dropdown({
    onChange: function(value,text) {
      remove_cards();
      console.log(picked_date+' '+text);
      append_card(data,picked_date,value);
    }
  })
;
$('body').prepend('<a href="javascript:" id="return-to-top"><i class="icon-chevron-up"></i></a>');
$(window).scroll(function() {
		    if ($(this).scrollTop() >= 500) {        // If page is scrolled more than 50px
		        $('#return-to-top').fadeIn(200);    // Fade in the arrow
		    } else {
		        $('#return-to-top').fadeOut(200);   // Else fade out the arrow
		    }
});



function getdata(data_url){
	var tmp  = null;
	$.ajax({
		'async': false,
		url: data_url,
		type: 'GET',
		success: function(data) {
        	tmp = data;
        }
	});
	return tmp;
}
function getDistrictArea(){
	var area = null;
  	area = $('#district_area').dropdown('get value');
	return area;
}

function getLiArea(){
	var area = null;
  	area = $('#li_area').dropdown('get value');
	return area;
}

function remove_cards(){
	$('.card').remove();
	$('.no_content').remove();
	$('#mapid').remove();

	if(mymap != null){
		for(i in markerArray) {
    	mymap.removeLayer(markerArray[i]);
    	} 
	    markerArray = [];
	    mymap.remove();
	}
	if(heat != null){
		heat.remove();
	}
}

function Cal_TWD97_To_lonlat( x, y)
    {

    	var a = 6378137.0;
	    var b = 6356752.314245;
	    var lon0 = 121 * Math.PI / 180;
	    var k0 = 0.9999;
	    var dx = 250000;

        var dy = 0;
        var e = Math.pow((1- Math.pow(b,2)/Math.pow(a,2)), 0.5);

        x -= dx;
        y -= dy;

        // Calculate the Meridional Arc
        var M = y/k0;

        // Calculate Footprint Latitude
        var mu = M/(a*(1.0 - Math.pow(e, 2)/4.0 - 3*Math.pow(e, 4)/64.0 - 5*Math.pow(e, 6)/256.0));
        var e1 = (1.0 - Math.pow((1.0 - Math.pow(e, 2)), 0.5)) / (1.0 + Math.pow((1.0 - Math.pow(e, 2)), 0.5));

        var J1 = (3*e1/2 - 27*Math.pow(e1, 3)/32.0);
        var J2 = (21*Math.pow(e1, 2)/16 - 55*Math.pow(e1, 4)/32.0);
        var J3 = (151*Math.pow(e1, 3)/96.0);
        var J4 = (1097*Math.pow(e1, 4)/512.0);

        var fp = mu + J1*Math.sin(2*mu) + J2*Math.sin(4*mu) + J3*Math.sin(6*mu) + J4*Math.sin(8*mu);

        // Calculate Latitude and Longitude

        var e2 = Math.pow((e*a/b), 2);
        var C1 = Math.pow(e2*Math.cos(fp), 2);
        var T1 = Math.pow(Math.tan(fp), 2);
        var R1 = a*(1-Math.pow(e, 2))/Math.pow((1-Math.pow(e, 2)*Math.pow(Math.sin(fp), 2)), (3.0/2.0));
        var N1 = a/Math.pow((1-Math.pow(e, 2)*Math.pow(Math.sin(fp), 2)), 0.5);

        var D = x/(N1*k0);

        // 計算緯度
        var Q1 = N1*Math.tan(fp)/R1;
        var Q2 = (Math.pow(D, 2)/2.0);
        var Q3 = (5 + 3*T1 + 10*C1 - 4*Math.pow(C1, 2) - 9*e2)*Math.pow(D, 4)/24.0;
        var Q4 = (61 + 90*T1 + 298*C1 + 45*Math.pow(T1, 2) - 3*Math.pow(C1, 2) - 252*e2)*Math.pow(D, 6)/720.0;
        var lat = fp - Q1*(Q2 - Q3 + Q4);

        // 計算經度
        var Q5 = D;
        var Q6 = (1 + 2*T1 + C1)*Math.pow(D, 3)/6;
        var Q7 = (5 - 2*C1 + 28*T1 - 3*Math.pow(C1, 2) + 8*e2 + 24*Math.pow(T1, 2))*Math.pow(D, 5)/120.0;
        var lon = lon0 + (Q5 - Q6 + Q7)/Math.cos(fp);

        lat = (lat * 180) / Math.PI; //緯
        lon = (lon * 180) / Math.PI; //經

        var result =[];
        result.push(lat);
        result.push(lon);

        return result;
    }

function getIconStyle(amount){
	var style;
	if(amount==0){
		style = 'legend1';
	}else if(amount > 0 && amount <= 49){
		style = 'legend2';
	}else if(amount >= 50 && amount <= 99){
		style = 'legend3';
	}else if(amount >= 100 && amount <= 149){
		style = 'legend4';
	}else if(amount >= 150 && amount <= 199){
		style = 'legend5';
	}else if(amount >= 200){
		style = 'legend6';
	}
	return 'image/'+style+'.svg';
}
function getIconStyleRGBA(amount){
	var style;
	if(amount==0){
		style = '#00FF9D';
	}else if(amount > 0 && amount <= 49){
		style = '#33CC7E';
	}else if(amount >= 50 && amount <= 99){
		style = '#66995E';
	}else if(amount >= 100 && amount <= 149){
		style = '#99663F';
	}else if(amount >= 150 && amount <= 199){
		style = '#CC331F';
	}else if(amount >= 200){
		style = '#FF0000';
	}
	return style;
}

function getHeapMapLegend(amount){
	var legend;
	if(amount > 80){
		legend = 1;
	}else{
		legend = Math.round(amount/80*10)/10;
	}
	return legend;
}
function getHeapMapColor(amount){
	var style;
	if(amount>=0 && amount <=49){
		style = "Gold";
	}else if(amount >= 50 && amount <= 99){
		style = "SlateBlue";
	}else if(amount >= 100){
		style = "red";
	}
	return style;
}
function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}
function PopupMarker(tag){
	var id = tag.innerText;
	markerArray[id].openPopup();
	mymap.setView(map_center, 16);
	$("html, body").animate({scrollTop: mapPos }, 'fast');
	console.log(mapPos)
}

function append_card(text_data,date,area){

	var isAreaHasData = false;
	if(text_data.hasOwnProperty(date))
	for (var i=0; i<text_data[date]['barrel_list'].length;i++){
			var barrel = text_data[date]['barrel_list'][i];
			var address = barrel['address'];
			if(address.indexOf(area)!== -1 || area==""){   //
				isAreaHasData = true;
			}
	}

	if(text_data.hasOwnProperty(date) && isAreaHasData){				//if 有調查資料
		var summarized_info = '\
				<div>本日調查資料共有： '+ text_data[date]['barrel_list'].length+' 筆</div>';
			//	$('#summarized_info').append(summarized_info);

			/******** map ******/
			
			map_center = [0,0];

			$('#cards_content').append('<div id="mapid"></div>');
			if(detectmob()==true){
				mymap = L.map('mapid').setView([22.9971,120.2126 ], 16);
			}else{
				mymap = L.map('mapid').setView([22.9971,120.2126 ], 16);
			}

			L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
			    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
			    maxZoom: 18,
			    id: 'ching56.17hng6ja',
			    accessToken: 'pk.eyJ1IjoiY2hpbmc1NiIsImEiOiJjaXNiZmYydGMwMTN1MnpwbnNqNWVqM2plIn0.k7h-PUGX7Tl5xLwDH3Qpsg'
			}).addTo(mymap);

		/**heatmap**/
		
		if(heat != null){
			heat.remove();
			heatPointArray = [];
		}
		var dateCount = 0;
		for( var d in dateKeyArray){
			if(dateKeyArray[d] === date)break;
			dateCount++;
			for (var i=0; i<text_data[dateKeyArray[d]]['barrel_list'].length;i++){
					var barrel = text_data[dateKeyArray[d]]['barrel_list'][i];
					var lat = barrel['lat'];
					var lng = barrel['lng'];
					var egg_count = barrel['egg_count'];
					var barrel_id = barrel['barrel_id'].substring(4);
					var lonlat = Cal_TWD97_To_lonlat(lng,lat);

						if(!(barrel_id in heatPointArray))
						{
							lonlat.push(egg_count);
							// console.log("push: "+egg_count);
							// console.log(lonlat)
							heatPointArray[barrel_id] = lonlat;
						}else{
							heatPointArray[barrel_id][2] = parseInt(heatPointArray[barrel_id][2]) +parseInt(egg_count) ;
							// console.log(heatPointArray[barrel_id][2]+"+"+egg_count+"="+(heatPointArray[barrel_id][2]-egg_count));
						}
			}
		}

		/***heatmap calcuate***/
		
		for (var i=0; i<text_data[date]['barrel_list'].length;i++){	
			//*******取得需要的欄位**********
			var barrel = text_data[date]['barrel_list'][i];

			var image_list = barrel['image_list'];
			var barrel_image_url = '';
			var barrel_image_tag = '';


			if (image_list.length == 0){
				//source: Crying Out Loud by Alfredo Hernandez from the Noun Project
				barrel_image_url = 'image/no_image.png';
				//barrel_image_tag = '<img src="'+  barrel_image_url + '">';
				barrel_image_url = '';
			}
			else{
				barrel_image_url = image_list[0];
				barrel_image_tag = '<img src="'+  barrel_image_url + '">';
			}
			var lat = barrel['lat'];
			var lng = barrel['lng'];
			var barrel_id = barrel['barrel_id'].substring(4);
			var barrel_notes = barrel['barrel_notes'];
			var egg_date = barrel['egg_date'];
			var mosquito_date = barrel['mosquito_date'];
			var postive_negative = barrel['postive_negative'];
			var address = barrel['address'];
			var egg_count = barrel['egg_count'];
			var egypt_dengue_adult = barrel['egypt_mosquito_adult'];
			var white_dengue_adult = barrel['white_mosquito_adult'];
			

			//*******要加進html 的部分**********
			//	<a class="header">' + text_data[date]['barrel_list'][i]['barrel_id'] + '. '+ 
							//text_data[date]['barrel_list'][i]['address'] +'</a>\
			var card = '\
					<div class="card" id=card-'+barrel_id+'>\
						<div class="image">' 
							+ barrel_image_tag +
						'</div> \
						<div class="content"> \
							<a class="header" title="誘卵桶編號" href="#" onclick="PopupMarker(this);return false;">' + barrel_id +'</a>\
						<div class="meta">\
							<div title="地址">' + address + '</div>\
							<span class="date" title="調查日期">' + date + ' /</span> ' + 
							'<span class="egg_date" title="卵數回報日期">' + egg_date +' /</span>'+
							'<span class="mosquito_date" title="成蟲回報日期">' + mosquito_date +' /</span>'+
							'<span class="postive_negative" title="容器性質"> (' + postive_negative + ')' + '</span>\
						</div>\
				 		</div>\
				 		<div class="extra content source_detail">\
				 			<div>\
				 				<a>卵數：' +  egg_count + '</a>\
				 			</div>\
				 			<div>\
				 				<a>過去平均卵數：' +  ((barrel_id in heatPointArray)?heatPointArray[barrel_id][2]/dateCount:'無過去資料')+ '</a>\
				 			</div>\
			  				<div>\
					    		<a> 埃及斑蚊成蟲：' + egypt_dengue_adult+ '</a>\
							</div>\
					   		<div>\
						    	<a> 白線斑蚊成蟲：' + white_dengue_adult + '</a>\
							</div>\
						</div>\
					</div>';
			card = card.replace(/undefined/g,"暫無資料");
			//$('#cards_content').append(card);

			if(address.indexOf(area)!== -1 || area==""){   //
				$('#cards_content').append(card);
			}
			else if (area == null){					//initial state
				$('#cards_content').append(card);	
			}
			else{
				var no_content = '\
				<div class="no_content">\
					<img src="image/no_content.png"> \
					<h4>本日無調查資料</h4>\
				</div>';
			$('#cards_content').append(no_content);
			break;
			}

			/******** map ******/
			var lonlat = Cal_TWD97_To_lonlat(lng,lat);
			map_center[0] = map_center[0] + lonlat[0];
			map_center[1] = map_center[1] + lonlat[1];

			var icon = L.icon({
			    iconUrl: getIconStyle(egg_count),
			    iconSize: [45,80], // size of the icon
			    popupAnchor: [0,-40],
			    iconAnchor:   [22, 60]
			});
			
			var marker = L.marker(lonlat, {icon: icon})
			.bindPopup('<table>\
						  <tr>\
						    <th>id</th>\
						    <td><a href="#card-'+barrel_id+'">'+barrel_id+'</td>\
						  </tr>\
						  <tr>\
						    <th>卵數</th>\
						    <td>'+egg_count+'</td>\
						  </tr>\
						</table>\
			')
			.addTo(mymap);
			markerArray[barrel_id] = marker;
			/******** map ******/
		}

		heat = L.heatLayer([],{
			minOpacity:0.4,
			radius: 50,
			blur:30,
			gradient: {
				0.4: 'SlateBlue',
			  	0.6: 'Gold',
				1: 'red',
		    }
		});
		var maxValueOfEgg = 0;
		var maxValueOfID = 0;
		for(i in heatPointArray){
			heatPointArray[i][2] = heatPointArray[i][2]/dateCount;
			// console.log(Object.keys(heatPointArray).length);
			// console.log(heatPointArray[i][2]);
			// console.log(heatPointArray)
			if(heatPointArray[i][2]>maxValueOfEgg){
				maxValueOfEgg = heatPointArray[i][2];
				maxValueOfID = i;
			}
		}
		// console.log(heatPointArray);
		// console.log(maxValueOfEgg);
		// console.log(maxValueOfID);
		for(i in heatPointArray){
			heatPointArray[i][2] = getHeapMapLegend(heatPointArray[i][2]);
			if(heatPointArray[i][2]!=0)
				// console.log(heatPointArray[i][2]);
				// console.log('*');
				if(heatPointArray[i][2]!=0)
					heat.addLatLng(heatPointArray[i]);
			
		}
		heat.addTo(mymap);

		map_center[0] = map_center[0]/text_data[date]['barrel_list'].length;
		map_center[1] = map_center[1]/text_data[date]['barrel_list'].length;

		mymap.setView(map_center, 16);

		var legend = L.control({position: 'bottomright'});
		var legend2 = L.control({position: 'bottomright'});
		var legendButton = L.control({position: 'bottomright'});

			legend.onAdd = function (mymap) {

			    var div = L.DomUtil.create('div', 'info legend legend-heat'),
			        grades = [0,50,100],
			        labels = [];

			    div.innerHTML+='<span class = "legend-header"><img src="image/heat.svg" width="18px" height="18px">&emsp;過去平均卵數（個）</span><HR>'

			    // loop through our density intervals and generate a label with a colored square for each interval

			    div.innerHTML += '<i style="background:linear-gradient(to bottom, rgba(106,90,205,0.7) 0%,rgba(255,215,0,0.4) 50%,rgba(255,0,0,1) 100%);"></i>';
			   
			    div.innerHTML += '0<br>&#8768;<br>80 +'

			    return div;
			};
			legend2.onAdd = function (mymap) {

			    var div = L.DomUtil.create('div', 'info legend'),
			        grades = [0,1, 50, 100, 150, 200],
			        labels = [];

			    div.innerHTML+='<span class = "legend-header"><img src="image/location.svg" width="18px" height="18px">&emsp;&emsp;&emsp;卵數（個）&emsp;&emsp;</span><HR>'

			    // loop through our density intervals and generate a label with a colored square for each interval
			    for (var i = 0; i < grades.length; i++) {
			    	if(grades[i]==0){
			    		div.innerHTML += '<i style="background:' + getIconStyleRGBA(grades[i]) + '"></i> ' + grades[i]+ '<br>';
			    	}else{
			    		div.innerHTML +=
			            '<i style="background:' + getIconStyleRGBA(grades[i]) + '"></i> ' +
			            grades[i] + (grades[i + 1] ? ' &ndash; ' + (grades[i + 1]-1) + '<br>' : ' +');
			    	}
			    }
			    return div;
			};

			legendButton.onAdd = function (mymap){
				var div = L.DomUtil.create('div', 'ui button');
				div.innerHTML+='圖例展開 / 收合';
				return div;
			}
				var GoTopButton = L.control({position: 'bottomright'});
				GoTopButton.onAdd = function (mymap){
					var div = L.DomUtil.create('div', 'ui button gotop');
					div.innerHTML+='查詢其他日期';
					return div;
				}
				GoTopButton.addTo(mymap);
				$(document).on("click", ".ui.button.gotop", function () {
				$("html, body").animate({scrollTop: 0 }, 'fast');
				remove_cards();
			});
			

			legendButton.addTo(mymap);
			legend.addTo(mymap);
			legend2.addTo(mymap);
			var isShow = true;
			$(document).on("click", ".ui.button", function () {
				var divs = document.querySelectorAll('.legend');

				if(isShow){
					[].forEach.call(divs, function(div){div.style.visibility = 'hidden';});
					isShow = false;
				}else{
					[].forEach.call(divs, function(div){div.style.visibility = 'visible';});
					isShow = true;
				}
			});
			/**legned**/
			/******* map *******/

			var height = $("#mapid").height();
			mapPos = $('#mapid').offset().top-screen.height*0.025;
		$("html, body").animate({scrollTop: mapPos }, 'fast');
		console.log($('#mapid').offset().top+height/2);
		$('#return-to-top').click(function() {      // When arrow is clicked
			$("html, body").animate({scrollTop: mapPos }, 'fast');
		});
			}
	else{							//else 沒有調查資料，則顯示沒有調查資料
		var no_content = $('\
				<div class="no_content">\
					<img src="image/no_content.png"> \
					<h4>本日無調查資料</h4>\
				</div>')
			$('#cards_content').append(no_content);
			console.log("no content");
	}
}