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

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // console.log(position);
      const { latitude } = position.coords;
      const { longitude } = position.coords;
      // console.log(latitude, longitude);

      const coords = [latitude, longitude];

      // console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);

      const map = L.map('map').setView(coords, 13);
      // console.log(map);

      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      //EVENTHANDLER BUILT-IN LEAFLET
      map.on('click', function (leafletEvent) {
        // console.log(leafEvent);
        const { lat, lng } = leafletEvent.latlng;

        L.marker([lat, lng], {
          opacity: 0.75,
          riseOnHover: true,
          riseOffset: 1,
        })
          .addTo(map)
          .bindPopup(
            L.popup({
              maxWidth: 150,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: 'running-popup',
            })
          )
          .setPopupContent('Workout')
          .openPopup();
      });
    }, //SUCCESS FUNCTION
    function () {
      alert('Could not get your location');
    }, //ERROR FUNCTION
    {
      enableHighAccuracy: true, //WHEN POSSIBLE GET THE BEST RESULT
      timeout: 5000, //WAIT FOR XXX mls TO RETURN LOCATION @MAX
      maximumAge: 0, //RETURN REAL POSITION NOT CACHED POSITION
    } //OPTIONS
  );
}
