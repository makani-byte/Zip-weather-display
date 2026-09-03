const API_BASE_URL = 'https://api.open-meteo.com/v1';
const GEO_BASE_URL = 'https://geocoding-api.open-meteo.com/v1';

const zipInput = document.getElementById('zipInput');
const searchBtn = document.getElementById('searchBtn');
const errorMessage = document.getElementById('errorMessage');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherDisplay = document.getElementById('weatherDisplay');

const cityName = document.getElementById('cityName');
const lastUpdated = document.getElementById('lastUpdated');
const weatherIcon = document.getElementById('weatherIcon');
const weatherCondition = document.getElementById('weatherCondition');
const currentTemp = document.getElementById('currentTemp');
const feelsLike = document.getElementById('feelsLike');
const highTemp = document.getElementById('highTemp');
const lowTemp = document.getElementById('lowTemp');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');
const precipitation = document.getElementById('precipitation');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');

searchBtn.addEventListener('click', handleSearch);
zipInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

zipInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

async function handleSearch() {
    const zip = zipInput.value.trim();

    if (!validateZipCode(zip)) {
        showError('Please enter a valid 5-digit U.S. ZIP code');
        return;
    }

    hideError();
    showLoading();

    try {
        const weatherData = await fetchWeatherByZip(zip);
        displayWeather(weatherData);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

function validateZipCode(zip) {
    const zipRegex = /^\d{5}$/;
    return zipRegex.test(zip);
}

async function fetchWeatherByZip(zip) {
    try {
        const geocodeUrl = `${GEO_BASE_URL}/search?name=${encodeURIComponent(zip)}&count=1&language=en&format=json`;
        const geocodeResponse = await fetch(geocodeUrl);

        if (!geocodeResponse.ok) {
            throw new Error('Unable to retrieve weather data. Please try again.');
        }

        const geocodeData = await geocodeResponse.json();
        const location = geocodeData.results && geocodeData.results[0];

        if (!location) {
            throw new Error('ZIP code not found. Please enter a valid U.S. ZIP code.');
        }

        const weatherUrl = `${API_BASE_URL}/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`;
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error('Unable to retrieve weather data. Please try again.');
        }

        const weatherData = await weatherResponse.json();

        return {
            current: weatherData.current,
            daily: weatherData.daily,
            location,
            timezone: weatherData.timezone
        };
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

function displayWeather(data) {
    const { current, daily, location } = data;

    const city = location.name || 'Location';
    const region = location.admin1 || location.country || 'USA';
    cityName.textContent = `${city}, ${region}`;

    const now = new Date();
    lastUpdated.textContent = `Last updated: ${formatTime(now)}`;

    const weatherCode = current.weather_code;
    const description = getWeatherDescription(weatherCode);
    weatherIcon.src = getWeatherIconDataUri(weatherCode);
    weatherIcon.alt = description;
    weatherCondition.textContent = description;

    currentTemp.textContent = `${Math.round(current.temperature_2m)}°`;
    feelsLike.textContent = `${Math.round(current.apparent_temperature)}°`;
    highTemp.textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    lowTemp.textContent = `${Math.round(daily.temperature_2m_min[0])}°`;

    humidity.textContent = `${Math.round(current.relative_humidity_2m)}%`;

    const windSpeed = Math.round(current.wind_speed_10m);
    const windDirection = getWindDirection(current.wind_direction_10m);
    wind.textContent = `${windSpeed} mph ${windDirection}`;

    precipitation.textContent = `${Math.round(current.precipitation || 0)} mm`;

    sunrise.textContent = formatTime(new Date(daily.sunrise[0]));
    sunset.textContent = formatTime(new Date(daily.sunset[0]));

    hideLoading();
    weatherDisplay.classList.remove('hidden');
}

function getWeatherDescription(code) {
    const descriptions = {
        0: 'Clear sky',
        1: 'Mostly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Rime fog',
        51: 'Light drizzle',
        53: 'Drizzle',
        55: 'Heavy drizzle',
        56: 'Freezing drizzle',
        57: 'Heavy freezing drizzle',
        61: 'Light rain',
        63: 'Rain',
        65: 'Heavy rain',
        66: 'Freezing rain',
        67: 'Heavy freezing rain',
        71: 'Light snow',
        73: 'Snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Rain showers',
        81: 'Heavy rain showers',
        82: 'Violent rain showers',
        85: 'Snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with hail',
        99: 'Heavy thunderstorm with hail'
    };

    return descriptions[code] || 'Weather conditions';
}

function getWeatherIconDataUri(code) {
    const emojiMap = {
        0: '☀️',
        1: '🌤️',
        2: '⛅',
        3: '☁️',
        45: '🌫️',
        48: '🌫️',
        51: '🌦️',
        53: '🌦️',
        55: '🌧️',
        56: '🌧️',
        57: '🌧️',
        61: '🌦️',
        63: '🌧️',
        65: '🌧️',
        66: '🌧️',
        67: '🌧️',
        71: '🌨️',
        73: '❄️',
        75: '❄️',
        77: '❄️',
        80: '🌦️',
        81: '🌧️',
        82: '🌧️',
        85: '🌨️',
        86: '🌨️',
        95: '⛈️',
        96: '⛈️',
        99: '⛈️'
    };

    const emoji = emojiMap[code] || '🌤️';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="20" fill="#eaf4ff"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="64">${emoji}</text></svg>`;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showLoading() {
    loadingSpinner.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

