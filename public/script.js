// Stores the currently searched city
let currentCity = "";

// This function fetches weather data from the API
async function getWeather() {

    // Get city name from user input
    const city = document.getElementById("cityInput").value;
    currentCity = city;

    // Call backend API
    const response = await fetch(`/api/weather/${city}`);
    const data = await response.json();

    // If there's an error (e.g., city not found), display the error message
    if (data.error) {
    document.getElementById("weatherResult").innerHTML = 
        `<p class="text-red-500">${data.error}</p>`;
    return;
    
    // This part displays the weather data dynamically
    document.getElementById("weatherResult").innerHTML = `
    <div class="bg-gray-100 rounded-xl p-4 shadow">
        <!-- City name -->
        <h2 class="text-2xl font-bold">${data.city}</h2>

        <!-- Weather description -->
        <p class="text-gray-600 capitalize">${data.description}</p>

        <!-- Weather details -->
        <div class="mt-3 space-y-1">
            <p>🌡 Temperature: <strong>${data.temperature} °C</strong></p>
            <p>💧 Humidity: ${data.humidity}%</p>
            <p>🌬 Wind: ${data.wind} m/s</p>
            <p>🌧 Precipitation: ${data.precipitation} mm</p>
            <p>☔ Chance of Rain: ${(data.rainChance ?? 0).toFixed(0)}%</p>
            <p style="color:${uvColor(data.uvIndex)}">
            ☀️ UV Index: ${data.uvIndex}
            </p>
        </div>
    </div>

    <!-- Forecast section -->
    <h3 class="text-lg font-semibold mt-6 mb-3 text-left">5-Day Forecast</h3>
    <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
        ${data.forecast.map(day => `
            <div class="bg-gray-100 rounded-xl p-3 shadow text-sm">
                <p class="font-semibold">${day.date}</p>
                <p class="text-gray-500 capitalize">${day.description}</p>
                <p>🌡 ${day.min}° / ${day.max}°C</p>
                <p>☔ ${day.rainChance}%</p>
                <p style="color:${uvColor(day.uvIndex)}">☀️ UV ${day.uvIndex}</p>
            </div>
        `).join("")}
    </div>
    `;
}

// This function returns color based on how high the UV index is.
function uvColor(uvi){
    if(uvi < 3) return "green";
    if(uvi < 6) return "orange";
    if(uvi < 8) return "red";
    return "purple";
}

// This function saves the current city to the favorites list via an API
async function saveFavorite() {

    await fetch("/api/weather/favorite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: currentCity })
    });

    // Reload favorites list after saving
    loadFavorites();
}

// This function loads favorite cities from backend
async function loadFavorites() {

    const response = await fetch("/api/weather/favorites/list");
    const favorites = await response.json();
    const list = document.getElementById("favorites");

    //Clear existing list before adding new items
    list.innerHTML = "";

    // Loop through each favorite city and create a list item for it
    favorites.forEach(city => {

        const li = document.createElement("li");

        // Styling for the list item using Tailwind CSS classes
        li.className = "bg-gray-100 p-2 rounded shadow cursor-pointer hover:bg-gray-200";
        li.textContent = city;

        // When a favorite city is clicked, it sets the input field to that city and fetches its weather data
        li.onclick = () => {

            document.getElementById("cityInput").value = city;
            getWeather();
        };

        list.appendChild(li);
    });
}

// Load favorites when the page first loads
loadFavorites();
