// 📌 API Key
const apiKey = "0555abec5427964bd5af58a8734bb66d"; 

// 📌 Elements
const searchInput = document.getElementById("input");
const searchButton = document.getElementById("searchButton");
const locationButton = document.getElementById("locationButton");
const weatherContainer = document.getElementById("weatherContainer");
const extendedForecastBtn = document.getElementById("extendedForecastBtn");
const mainSection = document.getElementById("main");
const forecastContainers = document.querySelectorAll("#weatherContainer");

// 📌 Burger Menu for Mobile
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerOpen = document.getElementById('hamburger-open');
const hamburgerClose = document.getElementById('hamburger-close');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
    hamburgerOpen.classList.toggle('hidden');
    hamburgerClose.classList.toggle('hidden');
});

// 📌 Initially Hide All Weather Sections
weatherContainer.style.display = "none";
forecastContainers.forEach((container, index) => {
    if (index !== 0) container.style.display = "none";
});

// 📌 Fetch Weather Data by City Name
async function fetchWeather(city) {
    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    try {
        console.log(`Fetching weather for city: ${city}`);
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            alert("City not found! Please enter a valid city name.");
            return;
        }

        const data = await response.json();
        console.log("Weather Data:", data);
        updateWeatherUI(data);
        fetchForecast(city);
        scrollToWeather(); // Scroll down after fetching
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data. Please check your connection.");
    }
}

// 📌 Update Current Weather UI
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

    // Change Background Based on Weather
    changeBackground(data.weather[0].main);

    // Show Weather Section
    weatherContainer.style.display = "block";
}

// 📌 Change Background Based on Weather Condition
function changeBackground(weather) {
    let bgImage = "img/sunny.gif"; // Default to sunny
    if (weather.toLowerCase().includes("rain")) {
        bgImage = "img/rainy.gif";
    } else if (weather.toLowerCase().includes("cloud")) {
        bgImage = "img/cloudy.gif";
    }
    mainSection.style.backgroundImage = `url('${bgImage}')`;
}

// 📌 Fetch 5-Day Forecast
async function fetchForecast(city) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
            console.error(`API Error: ${response.status} - ${response.statusText}`);
            alert("Error fetching forecast data.");
            return;
        }

        const data = await response.json();
        updateForecastUI(data.list);
    } catch (error) {
        console.error("Error fetching forecast data:", error);
    }
}

// 📌 Update 5-Day Forecast UI
function updateForecastUI(forecastList) {
    let index = 1;
    for (let i = 0; i < forecastList.length; i += 8) { // 8 items per day
        if (index > 5) break;

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

// 📌 Scroll to Weather Section
function scrollToWeather() {
    weatherContainer.scrollIntoView({ behavior: "smooth", block: "start" });
}

// 📌 Handle Search Button Click
searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();
    if (!city) {
        alert("Please enter a city name.");
        return;
    }
    fetchWeather(city);
});

// 📌 Allow Searching by Pressing "Enter" Key
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (!city) {
            alert("Please enter a city name.");
            return;
        }
        fetchWeather(city);
    }
});

// 📌 Handle "Use Current Location" Button
locationButton.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`User Location: ${latitude}, ${longitude}`);

                try {
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
                    );

                    if (!response.ok) {
                        console.error(`API Error: ${response.status} - ${response.statusText}`);
                        alert("Failed to fetch weather for your location.");
                        return;
                    }

                    const data = await response.json();
                    console.log("Location Weather Data:", data);
                    updateWeatherUI(data);
                    fetchForecast(data.name);
                    scrollToWeather(); // Scroll down after fetching
                } catch (error) {
                    console.error("Error fetching location weather:", error);
                    alert("Could not fetch weather. Try again later.");
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                alert("Failed to get location. Please enable location access.");
            }
        );
    } else {
        alert("Geolocation not supported by your browser.");
    }
});

// 📌 Show/Hide Extended Forecast
let isExtended = false;
extendedForecastBtn.addEventListener("click", () => {
    if (!isExtended) {
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
