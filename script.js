"use strict";

let cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");
const locationBtn = document.querySelector(".location-btn");
const weatherCardDiv = document.querySelector(".weather-cards");
const currentWeatherDiv = document.querySelector(".current-weather");
const error = document.querySelector(".error");

const apiKey = "3647f591de1fe55afe7dc1483380fc85";

const createWeatherCard = (cityName, weatherItem, index) => {
  if (index === 0) {
    // HTML for the Main card
    return `
    <div class="details">
    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
    <h4>Temperature: ${(weatherItem.main.temp - 273, 15).toFixed(2)}°c</h4>
    <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
  </div>
  <div class="icon">
    <img
    src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@4x.png"
      alt="Weather icon"
    />
    <h4>${weatherItem.weather[0].description}</h4>
  </div>    
    `;
  } else {
    // HTML for the forecast card
    return `
   <li class="card">
   <h2>(${weatherItem.dt_txt.split(" ")[0]})</h2>
    <img
    src="https://openweathermap.org/img/wn/${
      weatherItem.weather[0].icon
    }@2x.png"
    alt="Weather icon"
    />
   <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°c</h4>
   <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
   <h4>Humidity: ${weatherItem.main.humidity}%</h4>
</li>
`;
  }
};

const getWetherDetails = (cityName, lon, lat) => {
  const WEATHER_DEATILS_API = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  fetch(WEATHER_DEATILS_API)
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      // Filter the forecast to get only forecast per days
      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          return uniqueForecastDays.push(forecastDate);
        }
      });

      cityInput.value = "";
      currentWeatherDiv.innerHTML = "";
      weatherCardDiv.innerHTML = "";

      // Creating Forecast Cards and adding them to the DOM
      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        } else {
          weatherCardDiv.insertAdjacentHTML(
            "beforeend",
            createWeatherCard(cityName, weatherItem, index)
          );
        }
      });
    })
    .catch((err) => {
      console.error(
        `An error occured while cathching the coordinates - ${err}`
      );
    });
};

const getCityCoordinates = () => {
  const cityName = cityInput.value.trim();

  if (!cityName) return;

  const GEOCODING_API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  fetch(GEOCODING_API_URL)
    .then((res) => {
      if (!res.ok) {
        /* throw new Error("Invalid city name!"); */
        error.style.display = "block";
      }
      return res.json();
    })
    .then((data) => {
      const { name } = data;
      const { lon, lat } = data.coord;

      getWetherDetails(name, lon, lat);
      error.style.display = "none";
    })
    .catch((err) => {
      console.error(`An error occured while catching the coordinates - ${err}`);
    });
};

const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;

    // get city name from the coordinates using reverse geocoding API
    const CURRENT_LOCATION = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

    fetch(CURRENT_LOCATION)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Invalid city name!");
        }
        return res.json();
      })
      .then((data) => {
        const { name } = data[0];

        getWetherDetails(name, longitude, latitude);
      })
      .catch((err) => {
        console.error(
          `An error occured while catching the coordinates - ${err}`
        );
      });
  });
};

searchBtn.addEventListener("click", getCityCoordinates);
locationBtn.addEventListener("click", getCurrentLocation);
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    getCityCoordinates();
  }
});
