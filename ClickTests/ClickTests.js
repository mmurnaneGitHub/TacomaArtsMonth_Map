    //Simulate mouse clicks for testing web page

   function simulateButtonClick(element) {
     var promise = new Promise(function(resolve, reject) { // do async operation and process the result
       console.error('Clicking ...', element);
       try {
         if (element == 'MAP') {
           setTimeout(simulateMapEvents, 4000); //Leave enough time to see the popup before closing
         } else {
           element.click(); //Simulate mouse click on element
         }
         setTimeout(function() {
           resolve('Done!'); //nothing to return
         }, 4000); //Wait 4 seconds for next DOM element to be available before moving on 
       } catch (error) {
         alert('Element ' + element + ' had the follow problem: \n' + error);
       }
     });
     return promise;
   }

   function simulateMapEvents() {
     console.error('Starting map events  ...');
     setTimeout(function() {
       console.error('Zooming in ...');
       gmap.setZoom(19);
       setTimeout(function() {
         console.error('Panning ...');  //Studio 1
         gmap.panTo({
           lat: 47.19294526,
           lng: -122.4150623
         });
         setTimeout(function() {
           console.error('Hovering over marker ...');
           google.maps.event.trigger(studioMarker[1],'mouseover');
           setTimeout(function() {
             console.error('Clicking marker ...');
             google.maps.event.trigger(studioMarker[1], 'mouseout');  //Close mouseover with mouseout
             google.maps.event.trigger(studioMarker[1], 'click');  //Click marker
             console.error('Automated testing done!');
             console.error('MANUAL TEST 1: CLICK HYBRID MAP BUTTON!');
           }, 4000);
         }, 4000);
       }, 4000);
     }, 4000); //Wait 4 seconds for next DOM element to be available before moving on 
   }

   function processArray(array, fn) {
     var index = 0;
     function next() {
       if (index < array.length) {
         fn(array[index++]).then(next); //Promises chained together - synchronize a sequence of promises with .then, don't run the next widget test until the previous test has finished
       } else {
       	 //console.error('Testing done!');
       }
     }
     next(); //start looping through array
   }

   setTimeout(function() {
     console.error('Waiting a specific time for page to be ready ...');
     var testElementsArray = []; //Array of items by ID to click
	     testElementsArray.push(document.querySelector('[id="dijit_form_Button_0_label"]'));  //Splash page
       testElementsArray.push(document.querySelector('[title="Toggle Itinerary panel"]'));  //Itinerary button - close
       testElementsArray.push(document.querySelector('[title="Toggle Itinerary panel"]'));  //Itinerary button - open
	     testElementsArray.push(document.querySelector('[title="Zoom in"]'));  //Zoom In  button
	     testElementsArray.push(document.querySelector('[title="Zoom out"]'));  //Zoom Out button
       testElementsArray.push(document.querySelector('[title="Zoom out"]'));  //Zoom Out button
       testElementsArray.push(document.querySelector('[title="Zoom to All Studios"]'));  //Home button
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_ItineraryTab"]'));  //Itinerary Tab
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_DirectionsTab"]'));  //Directions Tab
	     testElementsArray.push(document.querySelector('[id="rightTabs_tablist_StudiosTab"]'));  //Studio Tab
	     testElementsArray.push("MAP");  //Map Events 
     processArray(testElementsArray, simulateButtonClick); //Run a async operation on each item in array, but one at a time serially such that the next operation does not start until the previous one has finished.
   }, 10000);
