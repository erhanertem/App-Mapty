'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

//GLOBAL VARIABLES
let map, leafletEvent;

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    //-->GEO API SUCCESS CALL-BACK FUNCTION
    function (position) {
      // console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      // console.log(latitude, longitude);
      //-->GET GEOLOCATION FROM GEO WEB API
      const coords = [latitude, longitude];
      // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
      //-->LEAFLET RENDER MAP PER COORDS
      map = L.map('map').setView(coords, 13);
      // console.log(map);
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
      //EVENTHANDLER BUILT-IN LEAFLET
      map.on('click', function (lEvent) {
        //-->SHOW THE FORM UPON CLICK ON THE MAP
        leafletEvent = lEvent; //Assign as global variable
        form.classList.remove('hidden'); //reveal the input form
        inputDistance.focus(); //by default focus on distance
      });
    },
    //-->GEO API ERROR CALL-BACK FUNCTION
    function () {
      alert('Could not get your location');
    },
    //-->GEO API OPTIONS
    {
      enableHighAccuracy: true, //WHEN POSSIBLE GET THE BEST RESULT
      timeout: 5000, //WAIT FOR XXX mls TO RETURN LOCATION @MAX
      maximumAge: 0, //RETURN REAL POSITION NOT CACHED POSITION
    }
  );
}
//EVENTHANDLER WORKOUT SUBMIT FORM
form.addEventListener('submit', function (e) {
  e.preventDefault(); //to disable auto submit
  //-->CLEAR INPUT FIELDS ON THE FORM
  inputDistance.value =
    inputDuration.value =
    inputCadence.value =
    inputElevation.value =
      '';
  //-->DISPLAY THE LEAFLET MARKER
  console.log(leafletEvent);
  const { lat, lng } = leafletEvent.latlng;
  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: 'running-popup', //Override custom CSS provided by us on top of the leaflet.css
      })
    )
    .setPopupContent('Workout')
    .openPopup();
});
