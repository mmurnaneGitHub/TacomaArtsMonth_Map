  var gmap = null; //map
  var overlay;  //to get map pixel location
  var MY_MAPTYPE_ID = 'gray';  // map style
  var bounds;  //map extent
  var dialog;  //lightbox

  var panorama;   //street view
  
  //for clickable side panel - link to markers
  var studioMarker = ["0"];  //empty a placeholder for first record [0], so that i matches Studio Number
  
//for Itinerary directions
  var Itinerary;  //Itinerary list
  var directionDisplay;
  var directionsService = new google.maps.DirectionsService();
  var directionsService;
  var origin = null;
  var destination = null;
  var waypoints = [];
  var markers = [];
  var directionsVisible = false;

  //=== Set marker attributes ===
  var imageOver = new google.maps.MarkerImage('images/mapIcons/Highlight.png');  //marker highlight
  var myMarker = false;  //marker for mobile location

  function initialize() {
    //Buttons - create programmatically:
    var button = new dijit.form.Button({
        label: "Get Directions!",
        onClick: function() {
            reset();calcRoute();
        }
    },
    "buttonDirections");

    var button = new dijit.form.Button({
        label: "Reset",
        onClick: function() {
            reset();destroyAll();
        }
    },
    "buttonRemove");

    var button = new dijit.form.Button({
        label: "Delete selected Studio(s)",
        onClick: function() {
            deleteSelected();
        }
    },
    "buttonDelete");



  //mobile device check
    var useragent = navigator.userAgent;  

    var myLatlng = new google.maps.LatLng(47.250138520439556, -122.47643585205077); //Studio Tour center    -  START HERE!!!!

    //map style----------
      var styleGray = [
      {
        featureType: "administrative",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      },{
        featureType: "landscape",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      },{
        featureType: "poi",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      },{
        featureType: "road",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      },{
        featureType: "transit",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      },{
        featureType: "water",
        elementType: "all",
        stylers: [
          { saturation: -100 }
        ]
      }
      ];
    //end map style ------

    var myOptions = {
      zoom: 19,
      center: myLatlng,
      panControl: false,
      zoomControl: true,
        zoomControlOptions: {
          style: google.maps.ZoomControlStyle.SMALL,
          position: google.maps.ControlPosition.RIGHT_TOP
        },
      mapTypeControl: true,
        mapTypeControlOptions: {
           mapTypeIds: [MY_MAPTYPE_ID,google.maps.MapTypeId.HYBRID]
        },
      scaleControl: true,
      streetViewControl: true,
      overviewMapControl: false,
      //mapTypeId: google.maps.MapTypeId.ROADMAP
      mapTypeId: MY_MAPTYPE_ID
    }

    gmap = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    // Get the map's default Street View panorama - Note that we don't yet set it visible.
    panorama = gmap.getStreetView();

    //Map button
    var styledMapOptions = {
      name: "Map"
    };

    //Set background map  
    var GrayMapType = new google.maps.StyledMapType(styleGray, styledMapOptions);
    gmap.mapTypes.set(MY_MAPTYPE_ID, GrayMapType);

    //Add LOGO as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 0px 10px 10px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'white';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '2px';
      controlUI.style.borderColor = '#b2b2b2';
      controlUI.style.cursor = 'pointer';
      
      //Add logo image
      var myLogo = document.createElement("img");
          myLogo.src = "images/TA_ArtatWork_Logo2009sm.jpg";
          myLogo.style.width = '69px';
          myLogo.style.height = '69px';
          myLogo.title = "Tacoma Arts Month website";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add logo control to map
      gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
      
      // Set logo as link to website
      google.maps.event.addDomListener(controlUI, 'click', function() {
        //URL to official website
        window.open('http://tacomaartsmonth.com/');
      });
    //End Add LOGO as a control------------------------

    //Add Itinerary button as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 0px 0px 10px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.title = 'Toggle Itinerary panel';
      controlUI.style.backgroundColor = 'black';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderColor = '#b2b2b2';
      controlUI.style.textAlign = "center";
      controlUI.style.width = '69px';
      controlUI.style.cursor = 'pointer';

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'white';
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = 'ITINERARY';
      controlUI.appendChild(controlText);
      controlDiv.appendChild(controlUI);
      
      //Add Itinerary button to map legend
      gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
      //Add events
      google.maps.event.addDomListener(controlUI, 'click', function() {
        dijit.byId('myExpando').toggle();  //Toggle Itinerary panel
      });
      google.maps.event.addDomListener(controlUI, 'mouseover', function() {
      });

    //End Legend as a control------------------------

    //Add SAT - SUN Legend as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 0px 0px 10px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = '#011689';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderColor = '#b2b2b2';
      controlUI.style.textAlign = "center";
      controlUI.style.width = '69px';

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'white';
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = 'SAT - SUN';
      controlUI.appendChild(controlText);
      controlDiv.appendChild(controlUI);
      
      //Add SATURDAY - SUNDAY to map legend
      gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);

    //End Legend as a control------------------------

    //Add SATURDAY Legend as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 0px 0px 10px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = '#CE8904';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderColor = '#b2b2b2';
      controlUI.style.textAlign = "center";
      controlUI.style.width = '69px';

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'white';
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = 'SATURDAY';
      controlUI.appendChild(controlText);
      controlDiv.appendChild(controlUI);
      
      //Add SATURDAY to map legend
      gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);

    //End Legend as a control------------------------

    //Add SUNDAY Legend as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 0px 0px 10px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = '#CF152D';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderColor = '#b2b2b2';
      controlUI.style.textAlign = "center";
      controlUI.style.width = '69px';

      // Set CSS for the control interior.
      var controlText = document.createElement('div');
      controlText.style.color = 'white';
      controlText.style.fontFamily = 'Arial,sans-serif';
      controlText.style.fontSize = '12px';
      controlText.style.paddingLeft = '4px';
      controlText.style.paddingRight = '4px';
      controlText.innerHTML = 'SUNDAY';
      controlUI.appendChild(controlText);
      controlDiv.appendChild(controlUI);
      
      //Add SUNDAY to map legend
      gmap.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);

    //End Legend as a control------------------------

    //Add Zoom Home image as a control------------------------
      // Create a div to hold the control.
      var controlDiv = document.createElement('DIV');
      
      // Offset the control from the edge of the map
      controlDiv.style.padding = '0px 10px 5px 5px';
      
      // Set CSS for the control border
      var controlUI = document.createElement('DIV');
      controlUI.style.backgroundColor = 'rgba(102,102,102,0.80)';
      controlUI.style.borderStyle = 'solid';
      controlUI.style.borderWidth = '1px';
      controlUI.style.borderRadius = '2px';
      controlUI.style.borderColor = '#D2D4D7';
      controlUI.style.cursor = 'pointer';
      controlUI.style.width = '38px';
      controlUI.style.height = '38px';
      
      //Add logo image
      var myLogo = document.createElement("img");
          myLogo.src = "images/homeWhite2.png";
          myLogo.style.width = '32px';
          myLogo.style.height = '32px';
          myLogo.style.margin = '3px 0px 0px 3px';
          myLogo.title = "Zoom to All Studios";
          //Append to each div
          controlUI.appendChild(myLogo);
          controlDiv.appendChild(controlUI);
      
      //Add logo control to map
      gmap.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

      // Set logo as link to website
      google.maps.event.addDomListener(controlUI, 'click', function() {
        gmap.fitBounds(bounds);
        //dijit.byId('myExpando').toggle();      //Toggle - Create Itinerary   !!!!Use this for Itinerary button
      });

      
    //End Zoom Home as a control------------------------


    //Add overlay to map to get pixel location for mouse hover
    overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(gmap); //add empty OverlayView and link the map div to the overlay 

    //Mobile device check
  			// allow iPhone or Android to track movement (watchPosition)
  			if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1) {
  				navigator.geolocation.watchPosition(displayLocation, handleError);					
  
  			// or let other geolocation capable browsers to get their static position (W3C Geolocation method)
  			} else if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(displayLocation, handleError);
  			// all other devices
  			} else {
          //default location
          displayLocation('default');
  			};

    //Update html text in tab windows -
    var tabText = "<div><b>Create your own itinerary:</b>";
    tabText += "<ul><li>Enter Starting Point information</li>";
    tabText += "<li>Click map marker</li>";
    tabText += "<li>Select <i>Add to my Itinerary</i> <br>(up to 9 Studios)</li>";
    tabText += "</ul></div>";

    tabText += "<div style='border-top:1px solid #C0C0C0;background:#EEEEEE;padding:4px 4px 4px 4px;'>";
    tabText += "<b>Starting Point:</b>";
    tabText += "</div>";

    tabText += "<div style='float:right;'>Address: <input type='text' name='StartAddress1' id='StartAddress1' value='747 Market St' /></div>";
    tabText += "<div style='float:right;'>City: <input type='text' name='StartAddress2' id='StartAddress2' value='Tacoma' /><br />&nbsp;</div>";

    tabText += "<div style='clear:both;background:#EEEEEE;padding:4px 4px 4px 4px;'><b>Itinerary: </b></div>";
    tabText += "<div class='Itinerary Container' style='clear:both;width:230px;'><ol id='Itinerary Node' class='container'></ol></div>";

    dojo.byId("theItinerary1").innerHTML = tabText;
    dojo.byId("theItinerary2").innerHTML = "<i>No Studios selected.</i>";
    dojo.byId("directions1").innerHTML = "<a href='javascript:PrintContent();'>Print Directions</a>";
    dojo.byId("directions2").innerHTML = "<a href=\"javascript:togglePane('rightPane','rightTabs','ItineraryTab');\">Modify Itinerary</a>";

//for Itinerary list
		Itinerary  = new dojo.dnd.Source("Itinerary Node");
		Itinerary.insertNodes(false, []);

    // replace the avatar string to make it more readable
    dojo.dnd.Avatar.prototype._generateText = function(){
      return (this.manager.copy ? "copy" : "Move to here");
    };


    //for Itinerary directions
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(gmap);
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));

    //for updating map extent to marker extent
    bounds = new google.maps.LatLngBounds();
                
  }

			function displayLocation(position){
			 //mobile device marker
				if (position=="default") {
  				  var myLatLng = new google.maps.LatLng(47.255851508377994, -122.4417709827423); //TMB
  				  var myTitle = "Tacoma Arts";
        } else {
  				  var myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  				  var myTitle = "You are here";
        };

    				// build entire marker first time thru
    				if (! myMarker) {
    
    
    					// define the 'you are here' marker image
    					var image = new google.maps.MarkerImage('images/bounce.gif',
    						new google.maps.Size(27, 38), // size
    						new google.maps.Point(0, 0), // origin
    						new google.maps.Point(14, 19) // anchor
    					);
    
    					// then create the new marker
    					myMarker = new google.maps.Marker({
    						position: myLatLng,
    						map: gmap,
    						icon: image,
    						flat: true,
    						draggable: true,
    						title: myTitle
    					});
    					
    				// just change marker position on subsequent passes
    				} else {
    					myMarker.setPosition(myLatLng);
    				}

				// center map view on every pass
				//map.setCenter(myLatLng);

			}

			function handleError(error){
			 //mobile device error messages
				switch (error.code){
					case error.TIMEOUT:
						alert('Sorry. Timed out.');
						break;
					case error.PERMISSION_DENIED:
						//For now comment out. Next year when HTTPS available added back in for Chrome browsers
            //alert('Sorry. Permission to find your location has been denied.');
						break;
					case error.POSITION_UNAVAILABLE:
						alert('Sorry. Position unavailable.');
						break;
					default:
						alert('Sorry. Error code: ' + error.code);
						break;
				}
			}
			
  function getFilePreventCache() {
      //The parameters to pass to xhrGet, the url, how to handle it, and the callbacks.
      var xhrArgs = {
          url: "StudioTours.txt?v=20190826",
          handleAs: "json",
          preventCache: true,
          load: function(jsonData) {

              //Title/Description/Studio# variables
              var sum_content = "";
              var detail_content = "";
              var previousStudioNumber = 0;
              var theThumbnails = "";
              
              //Format the data into html - loop through each record
              for (var i=0; i<jsonData.items.length; i++) {
                // only attempt to add markers with Latitude
                if(jsonData.items[i].Latitude != null) {

                  //Studio thumbnail summary - use array of studio markers (studioMarker) for click event
                  
                  //2017 Fix -  remove in 2018!!!!
                  //if (jsonData.items[i].StudioNumber==42){
                  //theThumbnails += "<img src=\"images/studios/" + jsonData.items[i].PhotoFileName +"T.jpg\" style=\"width:75px;height:100px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\" title='Studio " + jsonData.items[i].StudioNumber + " - " + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName + "' onclick='google.maps.event.trigger(studioMarker[41], \"click\")' onmouseover='google.maps.event.trigger(studioMarker[41], \"mouseover\")'  onmouseout='google.maps.event.trigger(studioMarker[41], \"mouseout\")' />";
                  //} else {
                  theThumbnails += "<img src=\"images/studios/" + jsonData.items[i].PhotoFileName +"T.jpg\" style=\"width:75px;height:100px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\" title='Studio " + jsonData.items[i].StudioNumber + " - " + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName + "' onclick='google.maps.event.trigger(studioMarker[" + jsonData.items[i].StudioNumber + "], \"click\")' onmouseover='google.maps.event.trigger(studioMarker[" + jsonData.items[i].StudioNumber + "], \"mouseover\")'  onmouseout='google.maps.event.trigger(studioMarker[" + jsonData.items[i].StudioNumber + "], \"mouseout\")' />";
                  //}
                  //End 2017 fix

                  //Check for multiple artists and the same Studio
                  //StudioNumber needs to be converted from string to number -  parseInt()
                  if (parseInt(jsonData.items[i].StudioNumber) > previousStudioNumber) {
                    if (previousStudioNumber != 0) {//add markers for PREVIOUS Studio (just once, multiple artists)
                      
                      //Set marker color
                        if (jsonData.items[i-1].DayPreference=="Saturday" || jsonData.items[i-1].DayPreference=="Sunday") {
                          imageIcon = 'images/mapIcons/' + jsonData.items[i-1].DayPreference + '.png';
                        } else {
                          imageIcon = 'images/mapIcons/BothSS.png';  //default Saturday & Sunday
                        }

                      //Add marker to map - just one per studio
                      addMarker(jsonData.items[i-1].Latitude, jsonData.items[i-1].Longitude, sum_content, detail_content, title_content, imageIcon, (parseInt(jsonData.items[i].StudioNumber) - 1).toString());
                      
                      //Extend map extent for marker
                      bounds.extend(new google.maps.LatLng(jsonData.items[i-1].Latitude, jsonData.items[i-1].Longitude));
                    }
                    
                    //empty out descriptions
                    sum_content = "";
                    detail_content = "";
                    
                  }
                  
                  //SUMMARY
                  if (jsonData.items[i].StudioNumber > previousStudioNumber) {
                    sum_content += "<div style='color:rgb(56,64,142); font-weight:bold; font-style:italic; text-align:center; '>Studio " + jsonData.items[i].StudioNumber + "</div>";
                  }
                  sum_content += "<div style=\"text-align:center;\"><b>" + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName + "</b>";
                  sum_content += "<br><img src=\"images/studios/" + jsonData.items[i].PhotoFileName +"T.jpg\" style=\"width:75px;height:100px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\" />";

                  if (jsonData.items[i].StudioNumber > previousStudioNumber) {
                    sum_content += "<br><i>Click marker for details</i></div>";
                  }

                  //TITLE BAR
                  var title_content = "<span style='color:rgb(56,64,142);'>Studio " + jsonData.items[i].StudioNumber + "</span>"
                  
                      title_content += "<span>";
                 
                      if (jsonData.items[i].GroupStudioName != "") {
                       title_content += " - <i>" + jsonData.items[i].GroupStudioName + "</i>"; 
                      }

                      title_content += "</span>";


                //DETAILED DESCRIPTIONS---------------------------------------
                  detail_content += "<div style='clear:both;float:left;width: 260px;'>";  //start address header - adjust width based on myDlg (280-20)
                  
                      if (jsonData.items[i].StudioNumber > previousStudioNumber) {
                        detail_content += "<div style='clear:both;'>";
                          detail_content += "<span style='color:rgb(56,64,142);'>" + jsonData.items[i].StudioAddress + "</span>";
                          //Special Directions
                          if (jsonData.items[i].AccessDirection != "") {
                            detail_content += "<div style='color:rgb(56,64,142);'><i>Additional Directions: " + jsonData.items[i].AccessDirection + "</i></div>";
                          }

  
                        //Address fixes for links
                        //remove extra notes from address and use first item in resulting array - , & (
                        var iAddress = jsonData.items[i].StudioAddress.split(/,|\(/)[0];  //address for Itinerary & Get Directions

                        //Opera Alley & Steele fix
                        if (jsonData.items[i].StudioAddress.search(/opera/i)!=-1) {
                          iAddress = "705 Court C";
                        } else if (jsonData.items[i].StudioAddress.search(/2926 S. Steele St./i)!=-1) {
                          iAddress = "2926 S. Steele St.";
                        } else if (jsonData.items[i].StudioAddress.search(/1901 Commerce St./i)!=-1) {
                          iAddress = "1901 Commerce St.";
                        }
                        
                        //replace &
                        iAddress = iAddress.replace("&","and")

                        //Address and driving directions
                        detail_content += "<br><a href=\"http://maps.google.com/maps?daddr=" + iAddress + ", Tacoma, WA\" target='_blank'  onfocus='this.blur();' title='Get driving directions.'>Directions</a>";
  
                        //Add to Calendar 
                        var theDay=3; //default Saturday & Sunday
                          if (jsonData.items[i].DayPreference=="Saturday") {                        
                              theDay=1;
                          } else if (jsonData.items[i].DayPreference=="Sunday") {
                              theDay=2;
                          }
                        detail_content += "&nbsp;|&nbsp;<a href=\"https://wspdsmap.cityoftacoma.org/website/HistoricMap/scripts/calendar/Calendar.asp?Day=" + theDay + "&Studio=" + jsonData.items[i].StudioNumber + "&Address=" + iAddress + "&Name=" + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName + "\" target='_blank' title='Open file to add appointment to your calendar.'>Calendar</a>";

                        //Zoom to Studio
                        detail_content += "&nbsp;|&nbsp;<a href='javascript:go2studio(" + jsonData.items[i].Latitude + ", " + jsonData.items[i].Longitude + ")' title='Close this window and zoom map to Studio.'>Zoom</a>";

                        //Street View
                        detail_content += "&nbsp;|&nbsp;<a href='javascript:toggleStreetView(" + jsonData.items[i].Latitude +"," + jsonData.items[i].Longitude + ")'  title='View Studio from nearest street.'>Street View</a><br>";
                        
                        //Itinerary!!!!!!!!!!!!!!!!
                        var iStudio = "Studio " + jsonData.items[i].StudioNumber + " - " + iAddress;  //Itinerary Studio Address
                        detail_content += "<span style=clear:both;float:right;'><b>Add to my Itinerary?</b> <input type='radio' name='Itinerary' id='y' onclick='addStudio(\"" + iStudio + "\");togglePane(\"rightPane\",\"rightTabs\",\"ItineraryTab\");'/>Yes&nbsp;&nbsp;&nbsp;</span><br>";
  
                        detail_content += "</div>";  //end address header

                        //Update studio# - convert string to number - parseInt()
                        previousStudioNumber = parseInt(jsonData.items[i].StudioNumber);
                      }

                      //Separator
                      detail_content += "<div style='clear:both;'><hr color='#ACB1DB'></div>";

                      //Start individual artist images & icons
                      detail_content += "<div style='clear:both;float:left;'>";
                      
                        //Image
                          //format lightbox string for names like D'Agostino, Chandler O'Leary
                          detail_content += "<a href=\"javascript:myLightbox('images/studios/" + jsonData.items[i].PhotoFileName.replace(/'/g,"\\'") +".jpg','" + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName.replace(/'/g,"\\'") + "')\"><img style ='float:left;margin:2px 5px 5px 5px;border:solid 1px #999;padding:2px' src=\"images/studios/" + jsonData.items[i].PhotoFileName +"T.jpg\" title='Click to enlarge photo' height='100px' width='75px'></a>";
  
                            detail_content += "<div style='float:left;width:35px;'>";
                              //ICONS for special categories--------------------
                              //Wheelchair & Funded
                              if (jsonData.items[i].Wheelchair == "Yes") {
                               detail_content += "<a href=\"javascript:showIconLegend('iconWheelchair');\"><img src=\"images/Logo/Wheelchair.jpg\" title=\"wheelchair accessible studio\" style=\"width:20px;height:20px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\"></a>"; 
                              }
      
                              //TAC funded  
                              if (jsonData.items[i].FundedByTAC == "Yes") {
                               detail_content += "<a href=\"javascript:showIconLegend('iconTACfunded');\"><img src=\"images/Logo/TACfunded.jpg\" title=\"artist funded by Tacoma Arts Commission in 2019\" style=\"width:20px;height:20px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\"></a>"; 
                              }
                              
                              //GTCF
                              if (jsonData.items[i].GTCF == "Yes") {
                               detail_content += "<a href=\"javascript:showIconLegend('iconGTCF');\"><img src=\"images/Logo/GTCF.jpg\" title=\"artist nominated for Greater Tacoma Community Foundation\'s Foundation of Art Award\" style=\"width:20px;height:20px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\"></a>"; 
                              }

                              //Passport
                              if (jsonData.items[i].PassportItem == "Yes") {
                               detail_content += "<a href=\"javascript:showIconLegend('iconPassport');\"><img src=\"images/Logo/Passport.jpg\" title=\"artwork by these artists are included in Studio Tour Passport prize packages\" style=\"width:20px;height:20px;margin:2px 5px 5px 0px;border:solid 1px #999;padding:2px\"></a>"; 
                              }
                              
                              //Fix for IE - put blank space if no icons
                              if (jsonData.items[i].Wheelchair != "Yes" && jsonData.items[i].FundedbyTAC != "Yes" && jsonData.items[i].GTCF != "Yes") {
                               detail_content += "&nbsp;"; 
                              }
                              
                            detail_content += "</div>";
                      
                      detail_content += "</div>";
  
                      //Start individual artist descriptions
                      detail_content += "<div style='width: 240px;float:left;'>";  //leave room for vertical scroll bar (250-10)
                          detail_content += "<b>" + jsonData.items[i].FirstName + " " + jsonData.items[i].LastName;
                      
                          if (jsonData.items[i].BusinessName != "") {
                           detail_content += " | " + jsonData.items[i].BusinessName; 
                          }
                          detail_content += "</b><br>";
    
                          detail_content += "<i>" + jsonData.items[i].Media + "</i><br>";
                          
                          detail_content += jsonData.items[i].ArtistStatement.replace(/""/g,"\"") + "<br>";      //replace any "" with "
                          detail_content += "<b>Open " + jsonData.items[i].DayPreference + "</b><br>";
    
                          //Phone
                          if (jsonData.items[i].Phone != "" & jsonData.items[i].Email != "") {
                            detail_content += jsonData.items[i].Phone + "<br>"; 
                          }
    
                          //Email & website
                          detail_content += "<a href='mailto:" + jsonData.items[i].Email + "?subject=Art At Work Studio Tour'>" + jsonData.items[i].Email + "</a><br>"; 
                          detail_content += "<a href=\"http://" + jsonData.items[i].Website + "\" target='_blank'>" + jsonData.items[i].Website + "</a>";
                          
                          //Demo
                          if (jsonData.items[i].Demo != "") {
                            detail_content +=  "<br><b>DEMO: </b>" + jsonData.items[i].Demo; 
                          }
                          
                      detail_content += "</div>";
                     
                    detail_content += "</div>";

                //end DETAILED DESCRIPTIONS-------------------------------------

                  //Last artist record - add LAST Studio marker to map
                  if ((i+1)==jsonData.items.length) {
                      //Set marker color
                        if (jsonData.items[i].DayPreference=="Saturday" || jsonData.items[i].DayPreference=="Sunday") {
                          imageIcon = 'images/mapIcons/' + jsonData.items[i].DayPreference + '.png';
                        } else {
                          imageIcon = 'images/mapIcons/BothSS.png';  //default Saturday & Sunday
                        }

                    //Add marker to map - just one per studio
                    addMarker(jsonData.items[i].Latitude, jsonData.items[i].Longitude, sum_content, detail_content, title_content, imageIcon, jsonData.items[i].StudioNumber);

                    
                    //Extend map extent for last marker
                    bounds.extend(new google.maps.LatLng(jsonData.items[i].Latitude, jsonData.items[i].Longitude));
                    
                    //Adjust map extent to all markers
                    gmap.fitBounds(bounds); 

                  }
                }
              }


            //update thumbnail panel
            dojo.byId("Studios1").innerHTML = theThumbnails;

          },
          error: function(error) {
              alert("An unexpected error occurred: " + error);
          }
      }

      //Call the asynchronous xhrGet - asynchronous call to retrieve data
      var deferred = dojo.xhrGet(xhrArgs);
  }

 function showIconLegend(icon) {
    dijit.byId(icon).show();
 }

  function addMarker(Latitude, Longitude, sum, info, title, imageIcon, studioNumber) {
    //!! 2017 Fix for Studio 41 dropping out at last moment.  REMOVE THIS SECTION IN 2018 !!
    /*
    if (studioNumber==41){
    	studioNumber = '40';
    }
    */

    //END 2017 FIX

    var location = new google.maps.LatLng(Latitude, Longitude);

    //Marker label color - Studio #
	//if (imageIcon.indexOf("Sunday") !== -1) {
	    var markerColor = 'white';
	//} else {
	    //var markerColor = 'black';
	//}

    //Add marker to map
    var marker = new google.maps.Marker({
      position: location,
	  label: {
	    text: studioNumber,
	    color: markerColor,
	    fontSize: '11px',
	    fontWeight: 'bold'
	  },
      icon: imageIcon,
      optimized: false,  //so draggable marker can be put behind theses markers
      map: gmap
    });

    //Add marker events
    google.maps.event.addListener(marker, 'mouseover', function() {
      //show popup, highlight marker if currently visible on map - no popups if zoomed in, etc
      if (gmap.getBounds().contains(marker.getPosition())) {
      
        marker.setIcon(imageOver);  //highlight marker

      //map tip - summary window
        var evt = marker.getPosition();
        var containerPixel = overlay.getProjection().fromLatLngToContainerPixel(evt);

        closeDialog();  //close any open map tips

        var dialog = new dijit.TooltipDialog({
          id: "tooltipDialog",
          content: sum,
          style: "position: absolute;z-index:100"
        });

        dialog.startup();
        dojo.style(dialog.domNode, "opacity", 0.85);
        //summary popup offset
        dijit.placeOnScreen(dialog.domNode, {x: containerPixel.x, y: containerPixel.y}, ["BL","TL","BR","TR"], {x: 15, y: 10});
      }
    });

    google.maps.event.addListener(marker, 'mouseout', function() {
      marker.setIcon(imageIcon);
      //marker.setIcon(myMarker);
      closeDialog();
    });

    google.maps.event.addListener(marker, 'click', function() {
      myDialog(info, title);
    });


    //for clickable side panel - started w/ record 0, so first one pushed in is i=1
    studioMarker.push(marker);

  }

  function closeDialog() {
    //close any open map tips
    var widget = dijit.byId("tooltipDialog");
    if (widget) {
      widget.destroy();
    }
  }
      
  function myDialog(info, title){
    myDlg = new dijit.Dialog({
        //title: title,
        //style: "width: 550px;background:#DEDBDE;",
        //style: "width: 650px; overflow:auto;",
        //style: "max-width: 270px; overflow:auto;",  //set max for iPhone 6/7/8 Chrome Dev Tools
        style: "width: 280px; overflow:auto;",  //set max for iPhone 6/7/8 Chrome Dev Tools
        draggable: true
    });
    //add additional attributes...
    myDlg.titleNode.innerHTML = title;
    myDlg.attr("content", info);
    myDlg.show();

    //Close dialog when underlay (outside window) is clicked
    //dojo.connect(dijit._underlay , "onClick", function(e){ myDlg.hide(); });
    dojo.connect(dijit._underlay , "onClick", function(e){ myDlg.destroy(); });

  }


  function myLightbox(url,title){
   dialog.show({ href: url, title:title});
  }

//start direction functions ---------------------------------------------------

  function calcRoute() {
    directionsDisplay.setPanel(document.getElementById("directionsPanel"));

      origin = dojo.byId("StartAddress1").value + "," + dojo.byId("StartAddress2").value;
    
      //get all studios from Itinerary list - loop
	  var list = dojo.byId("Itinerary Node"),
		  items = list.getElementsByTagName("li");

      for (i=0;i<items.length;i++) {
        destination = items[i].innerHTML + ",Tacoma,WA";  //last in list becomes destination

        if (i+1!=items.length) {
          waypoints.push({ location: destination, stopover: true });
        }
      }

    var mode = google.maps.DirectionsTravelMode.DRIVING;
    
    var request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: mode,
        optimizeWaypoints: document.getElementById('optimize').checked
    };

    if ( items.length==0) {
      //no Studios
      alert("No Studios in Itinerary.");
    } else if (dojo.byId("StartAddress1").value=="") {
      alert("Please enter a Starting Point Address.");
    } else {
      //get directions
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          //console.error(dojo.toJson(response));
          directionsDisplay.setDirections(response);  //send address to Google to return turn-by-turn directions to panel (directionsPanel)

          //change panel to results
          togglePane('rightPane','rightTabs','DirectionsTab');

          //replace # with Studio in directions - https://github.com/padolsey/findAndReplaceDOMText (js/findAndReplaceDOMText.js)
          //need to pause until direction panel updated (must be a better way - future enhancement as a deferred)
		  setTimeout(function(){
	          findAndReplaceDOMText(document.getElementById('directionsPanel'), {
	          	find: '#',
	          	wrap: 'em',
	          	replace: '- Studio '
	          });
          }, 300);

        }
      });

      clearMarkers();
      directionsVisible = true;
    }    
    
  }

  function clearMarkers() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }
  }
  
  function clearWaypoints() {
    markers = [];
    origin = null;
    destination = null;
    waypoints = [];
    directionsVisible = false;
  }
  
  function reset() {
    clearMarkers();
    clearWaypoints();
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(gmap);
    directionsDisplay.setPanel(document.getElementById("theDirections"));
    gmap.fitBounds(bounds);  //Adjust map extent to all markers   
  }

  function togglePane(panel,tab,tabPick) {

    if (!(dijit.byId('myExpando')._showing)) { dijit.byId('myExpando').toggle();}  //show Expando panel

      if (!(dijit.byId(panel)._showing)) {
          //open panel & show tab
          dijit.byId(tab).selectChild(tabPick);
      } else { 
          if (dijit.byId(tab).selectedChildWidget.id != tabPick) {
              //change tab
              dijit.byId(tab).selectChild(tabPick);
          } else {
              //close panel
              dijit.byId(panel).toggle();
          }
      }
  }

//end direction functions ---------------------------------------------------

//begin Itinerary list functions---------------------
	function destroyAll(){
		dojo.empty("Itinerary Node");
		//show No Studios
    dojo.byId("theItinerary2").style.display = 'block' 
    //hide direction buttons
    dojo.byId("theItinerary3").style.display = 'none';
    dojo.byId("theItinerary4").style.display = 'none';
	}

	function addStudio(studio){
    var exist = "No";
		var list = dojo.byId("Itinerary Node"),
			items = list.getElementsByTagName("li");

      if (items.length == 9) {
        alert("Itinerary limited to 9 Studios.  Please remove a Studio from Itinerary before adding additional Studios.")
      } else {
        for (i=0;i<items.length;i++) {
    		  if (items[i].innerHTML == studio){
            exist = "Yes";
          }
        }
        if (exist == "No") {
          Itinerary.insertNodes(false, [
      			studio
      		]);
        }
      }

      if (dojo.byId("theItinerary2").style.display = 'block') {
        //hide No Studios
        dojo.byId("theItinerary2").style.display = 'none' 
        //show direction buttons
        dojo.byId("theItinerary3").style.display = 'block';
        dojo.byId("theItinerary4").style.display = 'block';
      }

	}

	function deleteSelected(){
		Itinerary.deleteSelectedNodes();
	} 

//end Itinerary list functions ----------------------


  function PrintContent(){
    var DocumentContainer = document.getElementById("directionsPanel");
    var WindowObject = window.open('', 'PrintWindow','width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
    WindowObject.document.writeln(DocumentContainer.innerHTML);
    WindowObject.document.close();
    WindowObject.focus();
    WindowObject.print();
    //WindowObject.close();
  }

  function go2studio(lat,lon) {
    //Close dialog when underlay (outside window) is clicked
    //dojo.connect(dijit._underlay , "onClick", function(e){ myDlg.destroy(); });

    //Close open details dialog
    myDlg.destroy();

    //New map limits
    var studio_bounds = new google.maps.LatLngBounds();
    var studio_location = new google.maps.LatLng(lat,lon);
        studio_bounds.extend(studio_location);
        gmap.setZoom(17); //minimum zoom
        gmap.setCenter(studio_bounds.getCenter());
  }

//Start Street View functions    -----------------------------------------------
function toggleStreetView(newLat,newLong) {
 
    //Close open details dialog
    myDlg.destroy();
    
    addLatLng = new google.maps.LatLng(newLat,newLong);   //coord for new location

    //Zoom map to location
    var studio_bounds = new google.maps.LatLngBounds();
        studio_bounds.extend(addLatLng);
        gmap.setZoom(19); //zoom level (better for phone than 20)
        gmap.setCenter(studio_bounds.getCenter());

    //Get Street View for location
    var service = new google.maps.StreetViewService();
    service.getPanoramaByLocation(addLatLng, 50, showPanoData);

}

function showPanoData(panoData, status) {
    if (status != google.maps.StreetViewStatus.OK) {
      alert("Street View data not found for this location.");
      return;
    }
    var angle = computeAngle(addLatLng, panoData.location.latLng);

    //no max screen control button available yet
    var panoOptions = {
      position: addLatLng,
      addressControl: true,
      linksControl: true,
      panControl: true,
      zoomControlOptions: {
       style: google.maps.ZoomControlStyle.SMALL
      },
      pov: {
        heading: angle,
        pitch: 10,
        zoom: 0
      },
      enableCloseButton: true,
      imageDateControl: true,
      visible:true
    };

  panorama.setOptions(panoOptions);
}


  function computeAngle(endLatLng, startLatLng) {
      var DEGREE_PER_RADIAN = 57.2957795;
      var RADIAN_PER_DEGREE = 0.017453;

      var dlat = endLatLng.lat() - startLatLng.lat();
      var dlng = endLatLng.lng() - startLatLng.lng();
      // We multiply dlng with cos(endLat), since the two points are very closeby,
      // so we assume their cos values are approximately equal.
      var yaw = Math.atan2(dlng * Math.cos(endLatLng.lat() * RADIAN_PER_DEGREE), dlat)
             * DEGREE_PER_RADIAN;
      return wrapAngle(yaw);
   }

   function wrapAngle(angle) {
    if (angle >= 360) {
        angle -= 360;
    } else if (angle < 0) {
        angle += 360;
    }
    return angle;
    }
//end Street View functions     ------------------------------------------------  

  
  //Load map & markers after dojo load
	require([
    "dojo/parser", 
    "dijit/layout/BorderContainer", 
    "dijit/layout/TabContainer", 
    "dijit/layout/ContentPane",
    "dijit/form/Button", 
    "dojox/image/Lightbox", // image lightbox 
    "dijit/Dialog",  //details window
    "dijit/TooltipDialog",  //summary window
   	"dojo/dnd/Source",  //Itinerary list
    "dojox/layout/ExpandoPane",  //Expando panel
    "dojo/domReady!"
    ], 
  
    function(parser){
  		parser.parse();
        // script code that needs to run after parse
  
        //Create map
        initialize();
        
        //Put spacework locations on map
        getFilePreventCache();
            
        //FF fix for lightbox
        dialog = new dojox.image.LightboxDialog().startup();
        
        //Show Map Welcome
        dijit.byId('mapWelcome').show();
              
        //Toggle open Expando panel - started closed to avoid gray area on map under panel
        //dijit.byId('myExpando').toggle(); 
        //alert(dijit.byId('myExpando')._showing);
        
        
  
  	  }
  );


