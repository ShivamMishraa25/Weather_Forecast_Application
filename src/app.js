// code for burger menu when on mobile
const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        const hamburgerOpen = document.getElementById('hamburger-open');
        const hamburgerClose = document.getElementById('hamburger-close');
    
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            hamburgerOpen.classList.toggle('hidden');
            hamburgerClose.classList.toggle('hidden');
        });






        const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap API key

// Elements
const searchInput = document.getElementById("input");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const weatherContainer = document.getElementById("weatherContainer");
const extendedForecastBtn = document.getElementById("extendedForecastBtn");
const mainSection = document.getElementById("main");
const forecastContainers = document.querySelectorAll("#weatherContainer");

// Initially hide all weather sections
weatherContainer.style.display = "none";
forecastContainers.forEach((container, index) => {
    if (index !== 0) container.style.display = "none";
});

// Fetch weather data
async function fetchWeather(city) {
    console.log(city);
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    try {
        // Set timeout for API response
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec timeout

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`,
            { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error("City not found!");
        }

        const data = await response.json();
        updateWeatherUI(data);
        fetchForecast(city); // Fetch 5-day forecast after current weather
    } catch (error) {
        if (error.name === "AbortError") {
            alert("Request timed out. Please check your connection.");
        } else {
            alert(error.message);
        }
        console.error("Error fetching weather data:", error);
    }
}

// Update current weather UI
function updateWeatherUI(data) {
    document.getElementById("weatherDate").textContent = new Date().toDateString();
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    document.getElementById("weather").textContent = data.weather[0].main;
    document.getElementById("weatherDetails").innerHTML = `
        <p>City: ${data.name}</p>
        <p>Temp: ${data.main.temp}°C</p>
        <p>Wind: ${data.wind.speed} m/s</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;

    // Change background based on weather condition
    changeBackground(data.weather[0].main);

    // Show today's weather
    weatherContainer.style.display = "block";
}

// Change background based on weather
function changeBackground(weather) {
    let bgImage = "img/sunny.gif"; // Default
    if (weather.toLowerCase().includes("rain")) {
        bgImage = "img/rainy.gif";
    } else if (weather.toLowerCase().includes("cloud")) {
        bgImage = "img/cloudy.gif";
    }
    mainSection.style.backgroundImage = `url('${bgImage}')`;
}

// Fetch 5-day forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            throw new Error("Error fetching forecast.");
        }

        const data = await response.json();
        updateForecastUI(data.list);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// Update 5-day forecast UI
function updateForecastUI(forecastList) {
    let index = 1;
    for (let i = 0; i < forecastList.length; i += 8) { // 8 items per day
        if (index > 5) break; // Only 5 days

        let forecast = forecastContainers[index];
        let dailyData = forecastList[i];

        forecast.querySelector("#weatherDate").textContent = new Date(dailyData.dt * 1000).toDateString();
        forecast.querySelector("#weatherIcon").src = `https://openweathermap.org/img/wn/${dailyData.weather[0].icon}@2x.png`;
        forecast.querySelector("#weather").textContent = dailyData.weather[0].main;
        forecast.querySelector("#weatherDetails").innerHTML = `
            <p>Temp: ${dailyData.main.temp}°C</p>
            <p>Wind: ${dailyData.wind.speed} m/s</p>
            <p>Humidity: ${dailyData.main.humidity}%</p>
        `;

        index++;
    }
}

// Event Listeners
searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    fetchWeather(city);
});

locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                );
                const data = await response.json();
                updateWeatherUI(data);
                fetchForecast(data.name);
            },
            (error) => alert("Failed to get location.")
        );
    } else {
        alert("Geolocation not supported by your browser.");
    }
});

// Show/hide extended forecast
let isExtended = false;
extendedForecastBtn.addEventListener("click", () => {
    if (!isExtended) {
        weatherContainer.style.transform = "translateX(-150px)";
        forecastContainers.forEach((container, index) => {
            if (index !== 0) {
                container.style.display = "block";
                container.style.transform = "translateX(100%)";
                setTimeout(() => {
                    container.style.transition = "transform 0.5s ease";
                    container.style.transform = "translateX(0)";
                }, index * 100);
            }
        });
        extendedForecastBtn.textContent = "Close Extended Forecast";
    } else {
        weatherContainer.style.transform = "translateX(0)";
        forecastContainers.forEach((container, index) => {
            if (index !== 0) {
                container.style.transition = "transform 0.5s ease";
                container.style.transform = "translateX(100%)";
                setTimeout(() => {
                    container.style.display = "none";
                }, 500);
            }
        });
        extendedForecastBtn.textContent = "See Extended Forecast";
    }
    isExtended = !isExtended;
});
