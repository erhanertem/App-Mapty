'use strict';
///////////////////////////////////
//CREATE CLASSES FOR THE MAPTY DATA
//--> PARENT DATA CLASS
class Workout {
  date = new Date();
  id = String(Date.now()).slice(-10); // id = (Date.now() + '').slice(-10)
  // clicks = 0;

  constructor(coords, distance, duration) {
    // this.date =...
    // this.id = ...
    this.coords = coords; // [lat, lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  // click() {
  //   this.clicks++;
  // }
}

//-->CHILD DATA CLASSES
class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace(); //NOTE: INSERT INTO CONSTRUCTOR FUNCTION TO IMMEDIATELY CALC THE PACE
    this._setDescription(); //NOTE: WE PLACED HERE AS WE REQUIRE TYPE VARIABLE DEFINED AND PARENT CONSTRUCTOR() IS NOT THE PALCE ITS DEFINED BUT HERE.
  }

  calcPace() {
    this.pace = this.duration / this.distance; //min/km
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed(); //NOTE: INSERT INTO CONSTRUCTOR FUNCTION TO IMMEDIATELY CALC THE SPEED
    this._setDescription(); //NOTE: WE PLACED HERE AS WE REQUIRE TYPE VARIABLE DEFINED AND PARENT CONSTRUCTOR() IS NOT THE PALCE ITS DEFINED BUT HERE.
  }

  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); //km/hr
    return this.speed;
  }
}
///////////////////////////////////
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
///////////////////////////////////
//APPLICATION ARCHITECTURE
class App {
  //NOTE: INCORPORATE THE GLOBAL VARIABLES RELATED TO CLASS FUNCTIONS INTO THE CLASS
  #map; //records of workouts kept in this array
  #leafletEvent;
  #workouts = []; //data arr for saving workouts to - privatized via #
  #mapZoomLevel = 13; //set leaflet map zoom level

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
    //EVENTHANDLER WORKOUT FOCUS ON CLICK
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this)); //NOTE: we call _moveToPopup as a call back function in our event listener in which we utilize this. this for callback is limited to containerWorkouts not the app object itself. So we need to use bind(this) to link to App object this
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        //VERY IMPORTANT! we do not invoke it just pass the function name so that we dont use  _loadMap(position) ---- <bind(this)> is used because a call-back function has its no this defined by its nature. In order to assign this , we need to bind it.
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
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
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
    // console.log(this.#leafletEvent);
    form.classList.toggle('hidden');
    form.classList.toggle('form--transition');
    inputDistance.focus(); //by default focus on distance
  }

  _hideForm() {
    //-->CLEAR INPUT FIELDS ON THE FORM
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.classList.toggle('hidden');
    form.classList.toggle('form--transition');
  }

  _toggleElevationField() {
    ////////code
  }

  _newWorkout(e) {
    //-->PREVENT DEFAULT AUTO SUBMIT BEHAVIOUR
    e.preventDefault(); //to disable auto submit
    ////////////////////////////////////////////////
    //HELPERFUNCTION FOR VALIDITY CHECK OF ALL ITEMS
    const validInputs = (...inputs) =>
      inputs.every(input => Number.isFinite(input));
    //HELPERFUNCTION FOR VALIDITY CHECK OF ALL ITEMS
    const allPositive = (...inputs) => inputs.every(input => input > 0);
    ///////////////////////////////////////////////
    //-->GET DATA FROM THE FORM
    const type = inputType.value;
    const distance = +inputDistance.value;
    //NOTE: input elements always returns strings so we need to convert them to numbers immediately
    const duration = +inputDuration.value;
    // console.log(this.#leafletEvent);
    const { lat, lng } = this.#leafletEvent.latlng;
    let workout; //we define it here so both if caluses can reach this variable

    //-->IF WORKOUT IS RUNNING, CREATE RUNNING OBJECT
    if (type === 'running') {
      const cadence = +inputCadence.value;
      //-->CHECK IF DATA IS VALID - guard clause
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');
      //-->SAVE THE RUNNING OBJECT TO WORKOUT DATA ARRAY
      workout = new Running([lat, lng], distance, duration, cadence); //required inputs coords,duration,cadence
    }
    //-->IF WORKOUT IS CYCLING, CREATE CYCLING OBJECT
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      //-->CHECK IF DATAT IS VALID - guard clause
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');
      //-->SAVE THE RUNNING OBJECT TO WORKOUT DATA ARRAY
      workout = new Cycling([lat, lng], distance, duration, elevation); //required inputs coords,duration,cadence
    }

    //-->ADD NEW OBJECT TO WORKOUT ARRAY
    this.#workouts.push(workout);
    console.log(workout);
    //-->RENDER WORKOUT ON MAP AS MARKER
    // console.log(workout);
    this._renderWorkoutMarker(workout);
    //-->RENDER WORKOUT ON LIST
    this._renderWorkout(workout);
    //-->HIDE THE FORM + CLEAR INPUT FIELDS
    this._hideForm();
    //-->SET LOCAL STORAGE TO ALL WORKOUTS
    this._setLocalStorage();
  }

  _renderWorkoutMarker(workout) {
    // L.marker([lat, lng])
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`, //Override custom CSS provided by us on top of the leaflet.css.
          //NOTE: type has been lost during coding refactoring and in order to retain the type value at all times, it is incporporated into the data as a field.
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = ` 
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
        `;

    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    if (workout.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
      `;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToPopup(event) {
    const workoutEl = event.target.closest('.workout'); //find the closest li element whenever the item is clicked
    // console.log(workoutEl);
    if (!workoutEl) return; //GUARD CLAUSE

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id //workoutEl <li> element has data-id!
    );
    // console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    }); //setView() leaflet library function(coords, zoomlevel, options)

    // workout.click();
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts)); //localstorage(name of the storage, convert JS object(in this case our private array of workouts) to a keep JSON string)
  }
}

//APPLICATION
//-->CREATE THE APP CLASS INSTANCE
const app = new App();
