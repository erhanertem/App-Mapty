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

//APPLICATION ARCHITECTURE
class App {
  //NOTE: INCORPORATE THE GLOBAL VARIABLES RELATED TO CLASS FUNCTIONS INTO THE CLASS
  #map;
  #leafletEvent;

  constructor() {
    //-->GET THE POSITION OF THE USER
    //NOTE: CONSTRUCTOR FUNCTION IS EXECUTED THE MOMENT AN INSTANCE OF APP IS CREATED. SO INSTEAD OF DECLARING THIS OUTSIDE AS <this._getPosition();>, WE CAN INLCUDE THIS INSIDE THE CONSTRUCTOR TO EXECUTE IMMEDIATELY.
    this._getPosition();

    //EVENTHANDLER WORKOUT TYPE CHANGE
    //NOTE: EVENTLISTENERS NEEDS TO BE RUN IMMEDIATELY WHEN THEPAGE/APP LOADS SO THATS WHY WE INCLUDE IN THE CONSTRUCTOR FUNCTION OF THE CLASS
    inputType.addEventListener('change', function () {
      inputElevation
        .closest('.form__row')
        .classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });

    //EVENTHANDLER WORKOUT SUBMIT FORM
    form.addEventListener('submit', this._newWorkout.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), //VERY IMPORTANT! we do not invoke it just pass the function name so that we dont use  _loadMap(position) ---- <bind(this)> is used because a call-back function has its no this defined by its nature. In order to assign this , we need to bind it.
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
  }
  _loadMap(position) {
    //-->GEO API SUCCESS CALL-BACK FUNCTION
    // console.log(position, this);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(latitude, longitude);
    //-->GET GEOLOCATION FROM GEO WEB API
    const coords = [latitude, longitude];
    //-->LEAFLET RENDER MAP PER COORDS
    this.#map = L.map('map').setView(coords, 13);
    // console.log(map);
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //EVENTHANDLER BUILT-IN LEAFLET
    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(lEvent) {
    //-->SHOW THE FORM UPON CLICK ON THE MAP
    this.#leafletEvent = lEvent; //Assign as class private variable
    form.classList.remove('hidden'); //reveal the input form
    inputDistance.focus(); //by default focus on distance
  }
  _toggleElevationField() {
    ////////code
  }
  _newWorkout(e) {
    //-->PREVENT DEFAULT AUTO SUBMIT BEHAVIOUR
    e.preventDefault(); //to disable auto submit

    //HELPERFUNCTION FOR VALIDITY CHECK OF ALL ITEMS
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    //HELPERFUNCTION FOR VALIDITY CHECK OF ALL ITEMS
    const allPositive = (...inputs) => inputs.every(input => input > 0);

    //-->GET DATA FROM THE FORM
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    //-->IF WORKOUT RUNNING, CREATE RUNNING OBJECT
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //-->CHECK IF DATAT IS VALID - guard clause
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');
    }
    //-->IF WORKOUT CYCLING, CREATE CYCLING OBJECT
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
    }
    //-->ADD NEW OBJECT TO WORKPOUT ARRAY

    //-->RENDER WORKOUT ON LIST

    //-->RENDER WORKOUT ON MAP AS MARKER
    // console.log(this.#leafletEvent);
    const { lat, lng } = this.#leafletEvent.latlng;
    L.marker([lat, lng])
      .addTo(this.#map)
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
    //-->HIDE THE FORM

    //-->CLEAR INPUT FIELDS ON THE FORM
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }
}

//CREATE CLASSES FOR THE MAPTY DATA
//--> PARENT DATA CLASS
class Workout {
  date = new Date();
  id = String(Date.now()).slice(-10); // id = (new Date() + '').slice(-10)

  constructor(coords, distance, duration) {
    // this.date =...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }
}
//-->CHILD DATA CLASSES
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); //NOTE: INSERT INTO CONSTRUCTOR FUNCTION TO IMMEDIATELY CALC THE PACE
  }

  calcPace() {
    this.pace = this.duration / this.distance; //min/km
    return this.pace;
  }
}
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed(); //NOTE: INSERT INTO CONSTRUCTOR FUNCTION TO IMMEDIATELY CALC THE SPEED
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); //km/hr
    return this.speed;
  }
}

//APPLICATION
//-->CREATE THE APP CLASS INSTANCE
const app = new App();
