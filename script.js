const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';

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

    if (API_KEY === 'YOUR_API_KEY_HERE') {
        showError('Please set your OpenWeatherMap API key in script.js');
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
        const currentWeatherUrl = `${API_BASE_URL}/weather?zip=${zip},US&appid=${API_KEY}&units=imperial`;
        const forecastUrl = `${API_BASE_URL}/forecast?zip=${zip},US&appid=${API_KEY}&units=imperial`;
        
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(currentWeatherUrl),
            fetch(forecastUrl)
        ]);

        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error('ZIP code not found. Please enter a valid U.S. ZIP code.');
            } else if (currentResponse.status === 401) {
                throw new Error('Invalid API key. Please check your API key.');
            } else {
                throw new Error('Unable to retrieve weather data. Please try again.');
            }
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        return {
            current: currentData,
            forecast: forecastData
        };
    } catch (error) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Network error. Please check your internet connection.');
        }
        throw error;
    }
}

function displayWeather(data) {
    const { current, forecast } = data;
    
    cityName.textContent = `${current.name}, ${getStateCode(current.sys.country)}`;
    
    const now = new Date();
    lastUpdated.textContent = `Last updated: ${formatTime(now)}`;
    
    const iconCode = current.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    weatherIcon.alt = current.weather[0].description;
    weatherCondition.textContent = capitalizeWords(current.weather[0].description);
    
    currentTemp.textContent = `${Math.round(current.main.temp)}°`;
    feelsLike.textContent = `${Math.round(current.main.feels_like)}°`;
    highTemp.textContent = `${Math.round(current.main.temp_max)}°`;
    lowTemp.textContent = `${Math.round(current.main.temp_min)}°`;
    
    humidity.textContent = `${current.main.humidity}%`;
    
    const windSpeed = Math.round(current.wind.speed);
    const windDirection = getWindDirection(current.wind.deg);
    wind.textContent = `${windSpeed} mph ${windDirection}`;
    
    const pop = forecast.list[0].pop || 0;
    precipitation.textContent = `${Math.round(pop * 100)}%`;
    
    sunrise.textContent = formatTime(new Date(current.sys.sunrise * 1000));
    sunset.textContent = formatTime(new Date(current.sys.sunset * 1000));
    
    hideLoading();
    weatherDisplay.classList.remove('hidden');
}

function getStateCode(country) {
    return country === 'US' ? 'USA' : country;
}

function getWindDirection(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
}

function capitalizeWords(str) {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
