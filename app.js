/**
 * ZIP Weather Display – app.js
 *
 * Data sources (no API key required):
 *   • ZIP → lat/lon/city/state : https://api.zippopotam.us/us/{zip}
 *   • Weather                  : https://api.open-meteo.com/v1/forecast
 */

'use strict';

// ─── DOM refs ───────────────────────────────────────────────────────────────
const searchForm    = document.getElementById('searchForm');
const zipInput      = document.getElementById('zipInput');
const errorMsg      = document.getElementById('errorMsg');
const loading       = document.getElementById('loading');
const weatherCard   = document.getElementById('weatherCard');

const cityName      = document.getElementById('cityName');
const stateZip      = document.getElementById('stateZip');
const weatherIcon   = document.getElementById('weatherIcon');
const tempMain      = document.getElementById('tempMain');
const conditionLabel= document.getElementById('conditionLabel');
const feelsLike     = document.getElementById('feelsLike');
const tempHigh      = document.getElementById('tempHigh');
const tempLow       = document.getElementById('tempLow');
const humidity      = document.getElementById('humidity');
const wind          = document.getElementById('wind');
const precipitation = document.getElementById('precipitation');
const sunriseEl     = document.getElementById('sunrise');
const sunsetEl      = document.getElementById('sunset');
const lastUpdated   = document.getElementById('lastUpdated');

// ─── WMO weather code → { label, icon, theme } ──────────────────────────────
const WMO_CODES = {
  0:  { label: 'Clear Sky',        icon: '☀️',  theme: 'sunny'  },
  1:  { label: 'Mainly Clear',     icon: '🌤️', theme: 'sunny'  },
  2:  { label: 'Partly Cloudy',    icon: '⛅',  theme: 'cloudy' },
  3:  { label: 'Overcast',         icon: '☁️',  theme: 'cloudy' },
  45: { label: 'Foggy',            icon: '🌫️', theme: 'fog'    },
  48: { label: 'Icy Fog',          icon: '🌫️', theme: 'fog'    },
  51: { label: 'Light Drizzle',    icon: '🌦️', theme: 'rain'   },
  53: { label: 'Drizzle',          icon: '🌦️', theme: 'rain'   },
  55: { label: 'Heavy Drizzle',    icon: '🌧️', theme: 'rain'   },
  56: { label: 'Freezing Drizzle', icon: '🌨️', theme: 'snow'   },
  57: { label: 'Freezing Drizzle', icon: '🌨️', theme: 'snow'   },
  61: { label: 'Light Rain',       icon: '🌧️', theme: 'rain'   },
  63: { label: 'Rain',             icon: '🌧️', theme: 'rain'   },
  65: { label: 'Heavy Rain',       icon: '🌧️', theme: 'rain'   },
  66: { label: 'Freezing Rain',    icon: '🌨️', theme: 'snow'   },
  67: { label: 'Heavy Freezing Rain', icon: '🌨️', theme: 'snow'},
  71: { label: 'Light Snow',       icon: '❄️',  theme: 'snow'   },
  73: { label: 'Snow',             icon: '❄️',  theme: 'snow'   },
  75: { label: 'Heavy Snow',       icon: '❄️',  theme: 'snow'   },
  77: { label: 'Snow Grains',      icon: '🌨️', theme: 'snow'   },
  80: { label: 'Light Showers',    icon: '🌦️', theme: 'rain'   },
  81: { label: 'Showers',          icon: '🌧️', theme: 'rain'   },
  82: { label: 'Heavy Showers',    icon: '🌧️', theme: 'rain'   },
  85: { label: 'Snow Showers',     icon: '🌨️', theme: 'snow'   },
  86: { label: 'Heavy Snow Showers', icon: '🌨️', theme: 'snow' },
  95: { label: 'Thunderstorm',     icon: '⛈️',  theme: 'storm'  },
  96: { label: 'Thunderstorm w/ Hail', icon: '⛈️', theme: 'storm'},
  99: { label: 'Thunderstorm w/ Hail', icon: '⛈️', theme: 'storm'},
};

const FALLBACK_CONDITION = { label: 'Unknown', icon: '🌡️', theme: 'cloudy' };

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCondition(code) {
  return WMO_CODES[code] || FALLBACK_CONDITION;
}

/** Convert wind degrees (0–360) to a compass label */
function degreesToCompass(deg) {
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE',
                'S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

/** Format an ISO datetime string (e.g. "2024-06-15T06:23") to "6:23 AM" */
function formatTime(isoStr) {
  const date = new Date(isoStr);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** Return true if current local time is between sunrise and sunset */
function isDaytime(sunriseIso, sunsetIso) {
  const now     = Date.now();
  const sunrise = new Date(sunriseIso).getTime();
  const sunset  = new Date(sunsetIso).getTime();
  return now >= sunrise && now <= sunset;
}

function round(val) { return Math.round(val); }

function showError(msg) {
  errorMsg.textContent = msg;
}

function clearError() {
  errorMsg.textContent = '';
}

function setTheme(theme) {
  document.body.className = theme ? `theme-${theme}` : '';
}

function showLoading(show) {
  loading.hidden  = !show;
  weatherCard.hidden = show || weatherCard.dataset.loaded !== 'true';
}

// ─── Fetch ZIP → location ────────────────────────────────────────────────────
async function fetchLocation(zip) {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) throw new Error('ZIP_NOT_FOUND');
  const data = await res.json();
  const place = data.places[0];
  return {
    city:      place['place name'],
    state:     place['state'],
    stateAbbr: place['state abbreviation'],
    lat:       parseFloat(place.latitude),
    lon:       parseFloat(place.longitude),
  };
}

// ─── Fetch weather ────────────────────────────────────────────────────────────
async function fetchWeather(lat, lon) {
  const params = new URLSearchParams({
    latitude:  lat,
    longitude: lon,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'wind_speed_10m',
      'wind_direction_10m',
    ].join(','),
    daily: [
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'sunrise',
      'sunset',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit:  'mph',
    timezone:         'auto',
    forecast_days:    1,
  });

  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error('WEATHER_FETCH_FAILED');
  return res.json();
}

// ─── Render ───────────────────────────────────────────────────────────────────
function renderWeather(location, weather, zip) {
  const cur   = weather.current;
  const daily = weather.daily;

  const code      = cur.weather_code;
  const condition = getCondition(code);

  // Adjust icon / theme for night-time clear skies
  const sunriseIso = daily.sunrise[0];
  const sunsetIso  = daily.sunset[0];
  let   icon  = condition.icon;
  let   theme = condition.theme;

  if (!isDaytime(sunriseIso, sunsetIso)) {
    if (code === 0) { icon = '🌙'; theme = 'clear-night'; }
    else if (code === 1) { icon = '🌙'; theme = 'night'; }
    else if (theme === 'sunny') { theme = 'night'; }
  }

  // Location
  cityName.textContent = location.city;
  stateZip.textContent = `${location.state} (${location.stateAbbr}) · ${zip}`;

  // Hero
  weatherIcon.textContent   = icon;
  tempMain.textContent      = `${round(cur.temperature_2m)}°F`;
  conditionLabel.textContent = condition.label;

  // Detail cards
  feelsLike.textContent     = `${round(cur.apparent_temperature)}°F`;
  tempHigh.textContent      = `${round(daily.temperature_2m_max[0])}°F`;
  tempLow.textContent       = `${round(daily.temperature_2m_min[0])}°F`;
  humidity.textContent      = `${cur.relative_humidity_2m}%`;
  wind.textContent          = `${round(cur.wind_speed_10m)} mph ${degreesToCompass(cur.wind_direction_10m)}`;
  precipitation.textContent = `${daily.precipitation_probability_max[0]}%`;
  sunriseEl.textContent     = formatTime(sunriseIso);
  sunsetEl.textContent      = formatTime(sunsetIso);

  // Last updated
  const now = new Date(cur.time);
  lastUpdated.textContent   = `Last updated: ${now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  // Theme
  setTheme(theme);

  // Show card
  weatherCard.dataset.loaded = 'true';
  weatherCard.hidden = false;
}

// ─── Main handler ─────────────────────────────────────────────────────────────
async function handleSearch(zip) {
  clearError();
  showLoading(true);
  weatherCard.hidden = true;

  try {
    const location = await fetchLocation(zip);
    const weather  = await fetchWeather(location.lat, location.lon);
    renderWeather(location, weather, zip);
  } catch (err) {
    if (err.message === 'ZIP_NOT_FOUND') {
      showError(`"${zip}" is not a valid U.S. ZIP code. Please try again.`);
    } else {
      showError('Unable to retrieve weather data. Please check your connection and try again.');
    }
    weatherCard.hidden = true;
    setTheme('');
  } finally {
    showLoading(false);
  }
}

// ─── Events ───────────────────────────────────────────────────────────────────
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const zip = zipInput.value.trim();

  if (!/^\d{5}$/.test(zip)) {
    showError('Please enter a valid 5-digit U.S. ZIP code.');
    return;
  }

  handleSearch(zip);
});

// Only allow digits to be typed
zipInput.addEventListener('input', () => {
  zipInput.value = zipInput.value.replace(/\D/g, '').slice(0, 5);
  clearError();
});
