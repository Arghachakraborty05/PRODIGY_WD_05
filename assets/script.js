//const API_KEY = "640e30c6e5a14838b30123439252907";

// Global variables
let currentUnit = 'celsius';
let currentWeatherData = null;

// Enhanced weather condition mappings with theme info
const weatherConditions = {
    'clear': { icon: '☀️', bg: 'sunny', animation: 'sunny', theme: 'light' },
    'sunny': { icon: '☀️', bg: 'sunny', animation: 'sunny', theme: 'light' },
    'partly cloudy': { icon: '⛅', bg: 'partly-cloudy', animation: 'partly-cloudy', theme: 'mixed' },
    'cloudy': { icon: '☁️', bg: 'cloudy', animation: 'cloudy', theme: 'light' },
    'overcast': { icon: '☁️', bg: 'cloudy', animation: 'cloudy', theme: 'light' },
    'rain': { icon: '🌧️', bg: 'rain', animation: 'rain', theme: 'dark' },
    'light rain': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'heavy rain': { icon: '🌧️', bg: 'heavy-rain', animation: 'heavy-rain', theme: 'dark' },
    'drizzle': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'snow': { icon: '❄️', bg: 'snow', animation: 'snow', theme: 'light' },
    'light snow': { icon: '🌨️', bg: 'light-snow', animation: 'light-snow', theme: 'light' },
    'heavy snow': { icon: '❄️', bg: 'heavy-snow', animation: 'heavy-snow', theme: 'light' },
    'thunderstorm': { icon: '⛈️', bg: 'storm', animation: 'storm', theme: 'dark' },
    'storm': { icon: '⛈️', bg: 'storm', animation: 'storm', theme: 'dark' },
    'fog': { icon: '🌫️', bg: 'mist', animation: 'mist', theme: 'light' },
    'mist': { icon: '🌫️', bg: 'mist', animation: 'mist', theme: 'light' },
    'patchy rain possible': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'patchy light drizzle': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'moderate rain': { icon: '🌧️', bg: 'rain', animation: 'rain', theme: 'dark' },
    'patchy light rain': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'light rain shower': { icon: '🌦️', bg: 'light-rain', animation: 'light-rain', theme: 'mixed' },
    'moderate or heavy rain shower': { icon: '🌧️', bg: 'heavy-rain', animation: 'heavy-rain', theme: 'dark' },
    'torrential rain shower': { icon: '🌧️', bg: 'heavy-rain', animation: 'heavy-rain', theme: 'dark' },
    'patchy light snow': { icon: '🌨️', bg: 'light-snow', animation: 'light-snow', theme: 'light' },
    'light snow showers': { icon: '🌨️', bg: 'light-snow', animation: 'light-snow', theme: 'light' },
    'moderate or heavy snow showers': { icon: '❄️', bg: 'heavy-snow', animation: 'heavy-snow', theme: 'light' },
    'patchy light rain with thunder': { icon: '⛈️', bg: 'storm', animation: 'storm', theme: 'dark' },
    'moderate or heavy rain with thunder': { icon: '⛈️', bg: 'storm', animation: 'storm', theme: 'dark' },
    'thundery outbreaks possible': { icon: '⛈️', bg: 'storm', animation: 'storm', theme: 'dark' }
};

// WeatherAPI Integration Functions
const WEATHER_API_KEY = "640e30c6e5a14838b30123439252907";
const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1';

// Search suggestions functionality
let searchTimeout;
let currentSuggestions = [];

async function fetchLocationSuggestions(query) {
    if (query.length < 2) return [];

    try {
        const response = await fetch(`${WEATHER_API_BASE_URL}/search.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}`);
        if (response.ok) {
            const data = await response.json();
            return data.map(location => ({
                name: location.name,
                region: location.region,
                country: location.country,
                fullName: `${location.name}, ${location.region}, ${location.country}`,
                lat: location.lat,
                lon: location.lon
            }));
        }
    } catch (error) {
        console.log('Location search failed:', error);
    }
    return [];
}

function showSuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('suggestions');

    if (suggestions.length === 0) {
        suggestionsDiv.classList.add('hidden');
        return;
    }

    suggestionsDiv.innerHTML = '';
    suggestions.forEach(location => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
                    <div class="location-name">${location.name}</div>
                    <div class="location-details">${location.region}, ${location.country}</div>
                `;
        item.addEventListener('click', () => {
            document.getElementById('locationInput').value = location.fullName;
            suggestionsDiv.classList.add('hidden');
            searchWeather();
        });
        suggestionsDiv.appendChild(item);
    });

    suggestionsDiv.classList.remove('hidden');
}

function hideSuggestions() {
    setTimeout(() => {
        document.getElementById('suggestions').classList.add('hidden');
    }, 200);
}

async function fetchWeatherAPIData(location) {
    try {
        const response = await fetch(`${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&aqi=yes`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return formatWeatherAPIData(data);
        } else {
            const errorData = await response.json();
            throw new Error(`Unable to fetch weather data at this moment`);
        }
    } catch (error) {
        console.log('Weather service not available:', error);
        throw error;
    }
}

async function fetchWeatherAPIByCoords(lat, lon) {
    try {
        const response = await fetch(`${WEATHER_API_BASE_URL}/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&aqi=yes`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return formatWeatherAPIData(data);
        } else {
            const errorData = await response.json();
            throw new Error(`Unable to fetch weather data at this moment`);
        }
    } catch (error) {
        console.log('Weather service not available:', error);
        throw error;
    }
}

async function fetchWeatherAPIForecast(location) {
    try {
        const response = await fetch(`${WEATHER_API_BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=7&aqi=yes&alerts=yes`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else {
            const errorData = await response.json();
            throw new Error(`Unable to fetch forecast data at this moment`);
        }
    } catch (error) {
        console.log('Weather forecast not available:', error);
        throw error;
    }
}

function formatWeatherAPIData(apiData) {
    // Format WeatherAPI response to match our interface
    const current = apiData.current;
    const location = apiData.location;

    return {
        location: `${location.name}, ${location.region}, ${location.country}`,
        coordinates: {
            lat: location.lat,
            lon: location.lon
        },
        current: {
            temp: Math.round(current.temp_c),
            tempF: Math.round(current.temp_f),
            condition: current.condition.text.toLowerCase(),
            humidity: current.humidity,
            windSpeed: Math.round(current.wind_kph),
            windSpeedMph: Math.round(current.wind_mph),
            visibility: Math.round(current.vis_km),
            visibilityMiles: Math.round(current.vis_miles),
            pressure: Math.round(current.pressure_mb),
            uvIndex: current.uv,
            dewPoint: Math.round(current.dewpoint_c),
            dewPointF: Math.round(current.dewpoint_f),
            feelsLike: Math.round(current.feelslike_c),
            feelsLikeF: Math.round(current.feelslike_f),
            windDirection: current.wind_dir,
            gustSpeed: Math.round(current.gust_kph || 0),
            gustSpeedMph: Math.round(current.gust_mph || 0)
        },
        forecast: [],
        hourly: [],
        alerts: [],
        source: 'WeatherAPI.com',
        lastUpdated: current.last_updated
    };
}



function formatWeatherAPIForecast(forecastDays) {
    const days = ['Today', 'Tomorrow'];

    return forecastDays.map((day, index) => {
        const date = new Date(day.date);
        const dayName = index < 2 ? days[index] :
            date.toLocaleDateString('en-US', { weekday: 'short' });

        return {
            day: dayName,
            condition: day.day.condition.text.toLowerCase(),
            icon: getWeatherIcon(day.day.condition.text.toLowerCase()),
            high: Math.round(day.day.maxtemp_c),
            low: Math.round(day.day.mintemp_c),
            highF: Math.round(day.day.maxtemp_f),
            lowF: Math.round(day.day.mintemp_f),
            humidity: day.day.avghumidity,
            windSpeed: Math.round(day.day.maxwind_kph),
            chanceOfRain: day.day.daily_chance_of_rain,
            chanceOfSnow: day.day.daily_chance_of_snow
        };
    });
}

function formatWeatherAPIHourly(hourlyData) {
    return hourlyData.slice(0, 24).map(hour => {
        const time = new Date(hour.time);
        return {
            time: time.toLocaleTimeString('en-US', {
                hour: 'numeric',
                hour12: true
            }),
            temp: Math.round(hour.temp_c),
            tempF: Math.round(hour.temp_f),
            condition: hour.condition.text.toLowerCase(),
            icon: getWeatherIcon(hour.condition.text.toLowerCase()),
            humidity: hour.humidity,
            chanceOfRain: hour.chance_of_rain,
            windSpeed: Math.round(hour.wind_kph)
        };
    });
}

function formatWeatherAPIAlerts(alerts) {
    return alerts.map(alert => ({
        title: alert.headline,
        description: alert.desc,
        severity: alert.severity,
        areas: alert.areas,
        category: alert.category,
        certainty: alert.certainty,
        event: alert.event,
        note: alert.note,
        effective: alert.effective,
        expires: alert.expires,
        instruction: alert.instruction
    }));
}

function getWeatherIcon(condition) {
    const iconMap = {
        'sunny': '☀️',
        'clear': '☀️',
        'partly cloudy': '⛅',
        'cloudy': '☁️',
        'overcast': '☁️',
        'mist': '🌫️',
        'fog': '🌫️',
        'patchy rain possible': '🌦️',
        'light rain': '🌦️',
        'moderate rain': '🌧️',
        'heavy rain': '🌧️',
        'light snow': '🌨️',
        'moderate snow': '❄️',
        'heavy snow': '❄️',
        'thundery outbreaks possible': '⛈️',
        'moderate or heavy rain with thunder': '⛈️',
        'patchy light drizzle': '🌦️',
        'light drizzle': '🌦️',
        'freezing drizzle': '🌨️',
        'heavy freezing drizzle': '🌨️',
        'patchy light rain': '🌦️',
        'light rain shower': '🌦️',
        'moderate or heavy rain shower': '🌧️',
        'torrential rain shower': '🌧️',
        'light sleet': '🌨️',
        'moderate or heavy sleet': '🌨️',
        'patchy light snow': '🌨️',
        'light snow showers': '🌨️',
        'moderate or heavy snow showers': '❄️',
        'light showers of ice pellets': '🌨️',
        'moderate or heavy showers of ice pellets': '🌨️',
        'patchy light rain with thunder': '⛈️',
        'moderate or heavy rain with thunder': '⛈️',
        'patchy light snow with thunder': '⛈️',
        'moderate or heavy snow with thunder': '⛈️'
    };

    return iconMap[condition] || weatherConditions[condition]?.icon || '🌤️';
}





function updateWeatherBackground(condition) {
    const bg = document.getElementById('weatherBackground');
    const conditionData = weatherConditions[condition.toLowerCase()] || weatherConditions['sunny'];

    // Clear existing classes and animations
    bg.className = 'weather-bg';
    bg.innerHTML = '';

    // Update theme classes for containers
    updateThemeClasses(conditionData.theme);

    switch (conditionData.animation) {
        case 'sunny':
            bg.classList.add('sunny-bg');
            bg.innerHTML = '<div class="sun-rays"></div>';
            break;

        case 'partly-cloudy':
            bg.classList.add('partly-cloudy-bg');
            bg.innerHTML = '<div class="sun-rays" style="opacity: 0.6;"></div>';
            // Add some clouds
            for (let i = 0; i < 4; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                cloud.style.width = (Math.random() * 100 + 80) + 'px';
                cloud.style.height = (Math.random() * 50 + 40) + 'px';
                cloud.style.top = Math.random() * 40 + '%';
                cloud.style.left = Math.random() * 100 + '%';
                cloud.style.animationDelay = Math.random() * 6 + 's';
                cloud.style.animationDuration = (Math.random() * 8 + 12) + 's';
                cloud.style.opacity = Math.random() * 0.3 + 0.4;
                bg.appendChild(cloud);
            }
            break;

        case 'light-rain':
            bg.classList.add('light-rain-bg');
            // Create light rain drops
            for (let i = 0; i < 80; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + '%';
                drop.style.animationDuration = (Math.random() * 1.2 + 0.8) + 's';
                drop.style.animationDelay = Math.random() * 4 + 's';
                drop.style.opacity = Math.random() * 0.5 + 0.3;
                drop.style.height = (Math.random() * 15 + 20) + 'px';
                bg.appendChild(drop);
            }
            break;

        case 'rain':
        case 'heavy-rain':
            bg.classList.add(conditionData.animation === 'heavy-rain' ? 'heavy-rain-bg' : 'rain-bg');
            const rainIntensity = conditionData.animation === 'heavy-rain' ? 250 : 150;
            const rainSpeed = conditionData.animation === 'heavy-rain' ? 0.4 : 0.8;

            for (let i = 0; i < rainIntensity; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + '%';
                drop.style.animationDuration = (Math.random() * rainSpeed + 0.3) + 's';
                drop.style.animationDelay = Math.random() * 3 + 's';
                drop.style.opacity = Math.random() * 0.7 + 0.4;
                bg.appendChild(drop);
            }
            break;

        case 'light-snow':
            bg.classList.add('light-snow-bg');
            for (let i = 0; i < 50; i++) {
                const flake = document.createElement('div');
                flake.className = 'snowflake';
                flake.innerHTML = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
                flake.style.left = Math.random() * 100 + '%';
                flake.style.animationDuration = (Math.random() * 6 + 4) + 's';
                flake.style.animationDelay = Math.random() * 4 + 's';
                flake.style.fontSize = (Math.random() * 10 + 10) + 'px';
                flake.style.opacity = Math.random() * 0.6 + 0.3;
                bg.appendChild(flake);
            }
            break;

        case 'snow':
        case 'heavy-snow':
            bg.classList.add(conditionData.animation === 'heavy-snow' ? 'heavy-snow-bg' : 'snow-bg');
            const snowIntensity = conditionData.animation === 'heavy-snow' ? 120 : 80;

            for (let i = 0; i < snowIntensity; i++) {
                const flake = document.createElement('div');
                flake.className = 'snowflake';
                flake.innerHTML = ['❄', '❅', '❆'][Math.floor(Math.random() * 3)];
                flake.style.left = Math.random() * 100 + '%';
                flake.style.animationDuration = (Math.random() * 4 + 3) + 's';
                flake.style.animationDelay = Math.random() * 3 + 's';
                flake.style.fontSize = (Math.random() * 15 + 12) + 'px';
                flake.style.opacity = Math.random() * 0.8 + 0.2;
                bg.appendChild(flake);
            }
            break;

        case 'cloudy':
            bg.classList.add('cloudy-bg');
            for (let i = 0; i < 8; i++) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud';
                cloud.style.width = (Math.random() * 120 + 100) + 'px';
                cloud.style.height = (Math.random() * 60 + 50) + 'px';
                cloud.style.top = Math.random() * 60 + '%';
                cloud.style.left = Math.random() * 120 - 20 + '%';
                cloud.style.animationDelay = Math.random() * 8 + 's';
                cloud.style.animationDuration = (Math.random() * 10 + 15) + 's';
                cloud.style.opacity = Math.random() * 0.4 + 0.6;
                bg.appendChild(cloud);
            }
            break;

        case 'mist':
            bg.classList.add('mist-bg');
            // Create mist effect with floating particles
            for (let i = 0; i < 12; i++) {
                const mist = document.createElement('div');
                mist.className = 'cloud';
                mist.style.width = (Math.random() * 200 + 150) + 'px';
                mist.style.height = (Math.random() * 80 + 60) + 'px';
                mist.style.top = Math.random() * 80 + '%';
                mist.style.left = Math.random() * 120 - 20 + '%';
                mist.style.animationDelay = Math.random() * 10 + 's';
                mist.style.animationDuration = (Math.random() * 15 + 20) + 's';
                mist.style.opacity = Math.random() * 0.2 + 0.1;
                mist.style.filter = 'blur(3px)';
                bg.appendChild(mist);
            }
            break;

        case 'storm':
            bg.classList.add('storm-bg');
            // Add heavy rain for storm
            for (let i = 0; i < 200; i++) {
                const drop = document.createElement('div');
                drop.className = 'rain-drop';
                drop.style.left = Math.random() * 100 + '%';
                drop.style.animationDuration = (Math.random() * 0.4 + 0.3) + 's';
                drop.style.animationDelay = Math.random() * 2 + 's';
                drop.style.opacity = Math.random() * 0.8 + 0.4;
                bg.appendChild(drop);
            }

            // Add lightning bolts
            for (let i = 0; i < 3; i++) {
                const bolt = document.createElement('div');
                bolt.className = 'lightning-bolt';
                bolt.style.left = Math.random() * 100 + '%';
                bolt.style.top = Math.random() * 30 + '%';
                bolt.style.animationDelay = Math.random() * 6 + 's';
                bolt.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;
                bg.appendChild(bolt);
            }
            break;
    }
}

function updateThemeClasses(theme) {
    const glassElements = document.querySelectorAll('.glass');
    const textElements = document.querySelectorAll('.text-contrast, .text-contrast-light, .text-dark, .text-dark-light');
    const forecastElements = document.querySelectorAll('.forecast-text-primary, .forecast-text-secondary, .forecast-text-primary-dark, .forecast-text-secondary-dark');
    const inputElements = document.querySelectorAll('input, button');

    glassElements.forEach(element => {
        element.classList.remove('glass-light', 'glass-dark');
        if (theme === 'light') {
            element.classList.add('glass-dark');
        } else {
            element.classList.add('glass-light');
        }
    });

    textElements.forEach(element => {
        element.classList.remove('text-contrast', 'text-contrast-light', 'text-dark', 'text-dark-light');
        if (theme === 'light') {
            if (element.textContent && (element.textContent.includes('Updated:') || element.textContent.includes('°') || element.textContent.includes('%'))) {
                element.classList.add('text-dark-light');
            } else {
                element.classList.add('text-dark');
            }
        } else {
            if (element.textContent && (element.textContent.includes('Updated:') || element.textContent.includes('°') || element.textContent.includes('%'))) {
                element.classList.add('text-contrast-light');
            } else {
                element.classList.add('text-contrast');
            }
        }
    });

    // Update forecast text elements
    forecastElements.forEach(element => {
        element.classList.remove('forecast-text-primary', 'forecast-text-secondary', 'forecast-text-primary-dark', 'forecast-text-secondary-dark');
        if (theme === 'light') {
            if (element.classList.contains('forecast-text-primary') || element.textContent.includes('°')) {
                element.classList.add('forecast-text-primary-dark');
            } else {
                element.classList.add('forecast-text-secondary-dark');
            }
        } else {
            if (element.classList.contains('forecast-text-primary-dark') || element.textContent.includes('°')) {
                element.classList.add('forecast-text-primary');
            } else {
                element.classList.add('forecast-text-secondary');
            }
        }
    });

    // Update input and button styles based on theme
    inputElements.forEach(element => {
        if (element.tagName === 'INPUT') {
            if (theme === 'light') {
                element.className = element.className.replace(/text-white/g, 'text-black').replace(/placeholder-white/g, 'placeholder-black');
                element.style.background = 'rgba(0, 0, 0, 0.2)';
                element.style.borderColor = 'rgba(0, 0, 0, 0.4)';
                element.style.color = '#000000';
            } else {
                element.className = element.className.replace(/text-black/g, 'text-white').replace(/placeholder-black/g, 'placeholder-white');
                element.style.background = 'rgba(255, 255, 255, 0.2)';
                element.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                element.style.color = '#ffffff';
            }
        }
    });
}

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    hideWeatherData();
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('error').classList.remove('hidden');
    hideLoading();
}

function hideWeatherData() {
    document.getElementById('currentWeather').classList.add('hidden');
    document.getElementById('forecast').classList.add('hidden');
    document.getElementById('hourlyForecast').classList.add('hidden');
    document.getElementById('weatherAlerts').classList.add('hidden');
}

function displayWeatherData(data) {
    hideLoading();
    currentWeatherData = data;

    // Smooth transition out first
    const weatherElements = ['currentWeather', 'forecast', 'hourlyForecast'];
    weatherElements.forEach(id => {
        const element = document.getElementById(id);
        element.classList.remove('show');
        element.classList.add('weather-transition');
    });

    // Update background animation smoothly after brief delay
    setTimeout(() => {
        updateWeatherBackground(data.current.condition);
    }, 200);

    // Update content after transition
    setTimeout(() => {
        // Current weather
        document.getElementById('currentLocation').textContent = data.location;
        document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('lastUpdated').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
        document.getElementById('coordinates').textContent = `${data.coordinates.lat}°, ${data.coordinates.lon}°`;

        const temp = currentUnit === 'celsius' ? data.current.temp : data.current.tempF;
        const feelsTemp = currentUnit === 'celsius' ? data.current.feelsLike : data.current.feelsLikeF;
        const unit = currentUnit === 'celsius' ? '°C' : '°F';

        document.getElementById('currentIcon').textContent = weatherConditions[data.current.condition.toLowerCase()]?.icon || '🌤️';
        document.getElementById('currentTemp').textContent = `${temp}${unit}`;
        document.getElementById('currentDesc').textContent = data.current.condition;
        document.getElementById('feelsLike').textContent = `Feels like ${feelsTemp}${unit}`;

        // Weather details with proper unit conversion
        document.getElementById('humidity').textContent = `${data.current.humidity}%`;

        const windSpeed = currentUnit === 'celsius' ? `${data.current.windSpeed} km/h` : `${data.current.windSpeedMph} mph`;
        document.getElementById('windSpeed').textContent = windSpeed;

        const visibility = currentUnit === 'celsius' ? `${data.current.visibility} km` : `${data.current.visibilityMiles} mi`;
        document.getElementById('visibility').textContent = visibility;

        // Convert pressure: mb to inHg for Fahrenheit
        const pressure = currentUnit === 'celsius' ?
            `${data.current.pressure} mb` :
            `${(data.current.pressure * 0.02953).toFixed(2)} inHg`;
        document.getElementById('pressure').textContent = pressure;

        document.getElementById('uvIndex').textContent = data.current.uvIndex;

        const dewPoint = currentUnit === 'celsius' ? data.current.dewPoint : data.current.dewPointF;
        document.getElementById('dewPoint').textContent = `${dewPoint}${unit}`;

        // Sunrise and sunset
        document.getElementById('sunrise').textContent = data.sunrise || 'N/A';
        document.getElementById('sunset').textContent = data.sunset || 'N/A';

        // Forecast
        displayForecast(data.forecast);
        displayHourlyForecast(data.hourly);

        // Alerts
        if (data.alerts && data.alerts.length > 0) {
            displayWeatherAlerts(data.alerts);
        }

        // Show weather data with staggered smooth animations
        setTimeout(() => {
            document.getElementById('currentWeather').classList.remove('hidden', 'weather-transition');
            document.getElementById('currentWeather').classList.add('show');
        }, 100);

        setTimeout(() => {
            document.getElementById('forecast').classList.remove('hidden', 'weather-transition');
            document.getElementById('forecast').classList.add('show');
        }, 400);

        setTimeout(() => {
            document.getElementById('hourlyForecast').classList.remove('hidden', 'weather-transition');
            document.getElementById('hourlyForecast').classList.add('show');
        }, 700);

    }, 400);
}

function displayForecast(forecast) {
    const container = document.getElementById('forecastContainer');
    container.innerHTML = '';

    if (!forecast || forecast.length === 0) return;

    forecast.forEach((day, index) => {
        const high = currentUnit === 'celsius' ? day.high : day.highF;
        const low = currentUnit === 'celsius' ? day.low : day.lowF;
        const unit = currentUnit === 'celsius' ? '°C' : '°F';
        const windSpeed = currentUnit === 'celsius' ?
            `${day.windSpeed || 0} km/h` :
            `${Math.round((day.windSpeed || 0) * 0.621371)} mph`;

        const dayCard = document.createElement('div');
        dayCard.className = 'forecast-card glass rounded-xl p-4 text-center hover:bg-white/20 transition-all duration-300';
        dayCard.innerHTML = `
                    <div class="font-semibold mb-3 forecast-text-primary">${day.day}</div>
                    <div class="text-4xl mb-3 filter drop-shadow-lg">${day.icon}</div>
                    <div class="text-sm mb-3 forecast-text-secondary capitalize">${day.condition}</div>
                    <div class="flex justify-between text-sm mb-2">
                        <span class="font-bold text-lg forecast-text-primary">${high}${unit}</span>
                        <span class="forecast-text-secondary">${low}${unit}</span>
                    </div>
                    <div class="text-xs forecast-text-secondary space-y-1">
                        <div class="flex items-center justify-center gap-1">
                            <i class="ri-drop-line"></i>
                            ${day.humidity || 0}%
                        </div>
                        <div class="flex items-center justify-center gap-1">
                            <i class="ri-windy-line"></i>
                            ${windSpeed}
                        </div>
                    </div>
                `;
        container.appendChild(dayCard);

        // Animate cards with stagger
        setTimeout(() => {
            dayCard.classList.add('animate');
        }, index * 100);
    });
}

function displayHourlyForecast(hourly) {
    const container = document.getElementById('hourlyContainer');
    container.innerHTML = '';

    hourly.forEach(hour => {
        const temp = currentUnit === 'celsius' ? hour.temp : hour.tempF;
        const unit = currentUnit === 'celsius' ? '°C' : '°F';
        const windSpeed = currentUnit === 'celsius' ?
            `${hour.windSpeed || 0} km/h` :
            `${Math.round((hour.windSpeed || 0) * 0.621371)} mph`;

        const hourCard = document.createElement('div');
        hourCard.className = 'flex-shrink-0 glass rounded-lg p-4 text-center min-w-[140px] hover:bg-white/20 transition-all duration-300';
        hourCard.innerHTML = `
                    <div class="text-sm font-medium mb-2 forecast-text-secondary">${hour.time}</div>
                    <div class="text-3xl mb-2 filter drop-shadow-lg">${hour.icon}</div>
                    <div class="text-lg font-bold mb-2 forecast-text-primary">${temp}${unit}</div>
                    <div class="text-xs forecast-text-secondary capitalize mb-2">${hour.condition}</div>
                    <div class="space-y-1">
                        <div class="text-xs forecast-text-secondary flex items-center justify-center gap-1">
                            <i class="ri-drop-line text-blue-300"></i>
                            ${hour.humidity}%
                        </div>
                        <div class="text-xs forecast-text-secondary flex items-center justify-center gap-1">
                            <i class="ri-windy-line text-green-300"></i>
                            ${windSpeed}
                        </div>
                        ${hour.chanceOfRain > 0 ? `
                        <div class="text-xs forecast-text-secondary flex items-center justify-center gap-1">
                            <i class="ri-rainy-line text-blue-400"></i>
                            ${hour.chanceOfRain}%
                        </div>
                        ` : ''}
                    </div>
                `;
        container.appendChild(hourCard);
    });
}

function displayWeatherAlerts(alerts) {
    const container = document.getElementById('alertsContainer');
    container.innerHTML = '';

    if (alerts.length === 0) {
        document.getElementById('weatherAlerts').classList.add('hidden');
        return;
    }

    alerts.forEach(alert => {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'flex items-start gap-3 p-4 bg-yellow-500/20 rounded-lg mb-3 border border-yellow-500/30';

        // Handle both simple string alerts and complex WeatherAPI alert objects
        if (typeof alert === 'string') {
            alertDiv.innerHTML = `
                        <i class="ri-alert-line text-yellow-300 text-xl mt-1"></i>
                        <p class="text-yellow-100">${alert}</p>
                    `;
        } else {
            alertDiv.innerHTML = `
                        <i class="ri-alert-line text-yellow-300 text-xl mt-1"></i>
                        <div class="flex-1">
                            <h4 class="font-semibold text-yellow-200 mb-2">${alert.title || alert.event || 'Weather Alert'}</h4>
                            <p class="text-yellow-100 text-sm mb-2">${alert.description || alert.note || 'Weather alert in effect'}</p>
                            ${alert.instruction ? `<p class="text-yellow-200 text-xs font-medium">Instructions: ${alert.instruction}</p>` : ''}
                            ${alert.expires ? `<p class="text-yellow-300 text-xs mt-2">Expires: ${new Date(alert.expires).toLocaleString()}</p>` : ''}
                        </div>
                    `;
        }
        container.appendChild(alertDiv);
    });

    document.getElementById('weatherAlerts').classList.remove('hidden');
}

async function searchWeather() {
    const location = document.getElementById('locationInput').value.trim();
    if (!location) {
        showError('Please enter a location name');
        return;
    }

    showLoading();
    document.getElementById('loadingSubtext').textContent = 'Fetching live weather data...';

    try {
        // Try WeatherAPI first
        const weatherData = await fetchWeatherAPIData(location);

        // Get forecast data
        try {
            const forecastData = await fetchWeatherAPIForecast(location);
            weatherData.forecast = formatWeatherAPIForecast(forecastData.forecast.forecastday);
            weatherData.hourly = formatWeatherAPIHourly(forecastData.forecast.forecastday[0].hour);
            weatherData.alerts = formatWeatherAPIAlerts(forecastData.alerts?.alert || []);

            // Add sunrise/sunset data
            const astronomy = forecastData.forecast.forecastday[0].astro;
            weatherData.sunrise = astronomy.sunrise;
            weatherData.sunset = astronomy.sunset;
        } catch (forecastError) {
            console.log('Forecast data not available:', forecastError);
        }

        displayWeatherData(weatherData);
    } catch (error) {
        console.log('Server failed:', error);

        // Check if it's a location not found error
        if (error.message.includes('No matching location found') ||
            error.message.includes('Invalid location') ||
            error.message.includes('not found')) {
            showError(`Invalid search: "${location}" not found. Please check spelling and try again.`);
        } else {
            showError('Unable to fetch weather data. Please check your internet connection and try again.');
        }
    }
}

async function getCurrentLocationWeather() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by this browser');
        return;
    }

    showLoading();
    document.getElementById('loadingSubtext').textContent = 'Getting your precise location...';

    const options = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            try {
                const { latitude, longitude, accuracy } = position.coords;
                console.log(`Location accuracy: ${accuracy} meters`);

                const accuracyText = accuracy < 100 ? 'High accuracy' :
                    accuracy < 1000 ? 'Medium accuracy' : 'Low accuracy';

                document.getElementById('loadingSubtext').textContent =
                    `Fetching weather data (${accuracyText})...`;

                // Try WeatherAPI with coordinates
                const weatherData = await fetchWeatherAPIByCoords(latitude, longitude);

                // Get forecast data for coordinates
                try {
                    const forecastData = await fetchWeatherAPIForecast(`${latitude},${longitude}`);
                    weatherData.forecast = formatWeatherAPIForecast(forecastData.forecast.forecastday);
                    weatherData.hourly = formatWeatherAPIHourly(forecastData.forecast.forecastday[0].hour);
                    weatherData.alerts = formatWeatherAPIAlerts(forecastData.alerts?.alert || []);

                    // Add sunrise/sunset data
                    const astronomy = forecastData.forecast.forecastday[0].astro;
                    weatherData.sunrise = astronomy.sunrise;
                    weatherData.sunset = astronomy.sunset;
                } catch (forecastError) {
                    console.log('Forecast data not available:', forecastError);
                }

                displayWeatherData(weatherData);
            } catch (error) {
                showError(`Failed to get weather for your location: ${error.message}`);
            }
        },
        (error) => {
            let errorMessage = 'Unable to get your location. ';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += 'Location access denied by user.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += 'Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage += 'Location request timed out.';
                    break;
                default:
                    errorMessage += 'Unknown location error.';
                    break;
            }
            showError(errorMessage + ' Please enter a city name.');
        },
        options
    );
}

async function reverseGeocode(lat, lon) {
    try {
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (response.ok) {
            const data = await response.json();
            return `${data.city || data.locality}, ${data.countryName}`;
        }
    } catch (error) {
        console.log('Geocoding failed:', error);
    }
    return null;
}



function toggleUnits() {
    currentUnit = currentUnit === 'celsius' ? 'fahrenheit' : 'celsius';
    const button = document.getElementById('unitToggle');
    button.innerHTML = currentUnit === 'celsius' ?
        '<i class="ri-temp-hot-line"></i> °C' :
        '<i class="ri-temp-cold-line"></i> °F';

    if (currentWeatherData) {
        displayWeatherData(currentWeatherData);
    }
}

// Event listeners
document.getElementById('locationInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

// Search suggestions event listeners
document.getElementById('locationInput').addEventListener('input', function (e) {
    const query = e.target.value.trim();

    clearTimeout(searchTimeout);

    if (query.length < 2) {
        document.getElementById('suggestions').classList.add('hidden');
        return;
    }

    searchTimeout = setTimeout(async () => {
        const suggestions = await fetchLocationSuggestions(query);
        currentSuggestions = suggestions;
        showSuggestions(suggestions);
    }, 300);
});

document.getElementById('locationInput').addEventListener('blur', hideSuggestions);
document.getElementById('locationInput').addEventListener('focus', function (e) {
    if (currentSuggestions.length > 0 && e.target.value.length >= 2) {
        showSuggestions(currentSuggestions);
    }
});

// Initialize page with default location
window.addEventListener('load', function () {
    // Focus on search input
    document.getElementById('locationInput').focus();

    // Load default weather for Kolkata
    loadDefaultWeather();
});

async function loadDefaultWeather() {
    try {
        showLoading();
        document.getElementById('loadingSubtext').textContent = 'Loading weather data...';

        const weatherData = await fetchWeatherAPIData('Kolkata');

        // Get forecast data
        try {
            const forecastData = await fetchWeatherAPIForecast('Kolkata');
            weatherData.forecast = formatWeatherAPIForecast(forecastData.forecast.forecastday);
            weatherData.hourly = formatWeatherAPIHourly(forecastData.forecast.forecastday[0].hour);
            weatherData.alerts = formatWeatherAPIAlerts(forecastData.alerts?.alert || []);

            // Add sunrise/sunset data
            const astronomy = forecastData.forecast.forecastday[0].astro;
            weatherData.sunrise = astronomy.sunrise;
            weatherData.sunset = astronomy.sunset;
        } catch (forecastError) {
            console.log('Forecast data not available:', forecastError);
        }

        displayWeatherData(weatherData);
    } catch (error) {
        console.log('Failed to load weather:', error);
        hideLoading();
    }
}

// Auto-refresh every 10 minutes
setInterval(() => {
    if (currentWeatherData) {
        document.getElementById('lastUpdated').textContent = `Updated: ${new Date().toLocaleTimeString()}`;
    }
}, 600000);


(function () {
    function c() {
        var b = a.contentDocument || a.contentWindow.document;
        if (b) {
            var d = b.createElement('script'); d.innerHTML = "window.__CF$cv$params={r:'9671d3fd32b4a750',t:'MTc1Mzg0Njc1OC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
            b.getElementsByTagName('head')[0].appendChild(d)
        }
    }
    if (document.body) {
        var a = document.createElement('iframe')
        ; a.height = 1; a.width = 1; a.style.position = 'absolute';
        a.style.top = 0; a.style.left = 0; a.style.border = 'none';
        a.style.visibility = 'hidden';
        document.body.appendChild(a);
        if ('loading' !== document.readyState) c();
        else if (window.addEventListener) document.addEventListener('DOMContentLoaded', c);
        else {
            var e = document.onreadystatechange || function () { };
            document.onreadystatechange = function (b) {
                e(b);
                'loading' !== document.readyState && (document.onreadystatechange = e, c())
            }
        }
    }
})();