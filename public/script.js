let currentCity = "";



async function getWeather() {

    const city = document.getElementById("cityInput").value;

    currentCity = city;

    const response = await fetch(`/api/weather/${city}`);
    const data = await response.json();

    document.getElementById("weatherResult").innerHTML = `
    <div class="bg-gray-100 rounded-xl p-4 shadow">
    <h2 class="text-2xl font-bold">${data.city}</h2>
    <p class="text-gray-600 capitalize">${data.description}</p>
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

function uvColor(uvi){

if(uvi < 3) return "green";
if(uvi < 6) return "orange";
if(uvi < 8) return "red";
return "purple";
}

async function saveFavorite() {

    await fetch("/api/weather/favorite", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ city: currentCity })
    });

    loadFavorites();
}

async function loadFavorites() {

    const response = await fetch("/api/weather/favorites/list");
    const favorites = await response.json();

    const list = document.getElementById("favorites");

    list.innerHTML = "";

    favorites.forEach(city => {

    const li = document.createElement("li");
    li.className = "bg-gray-100 p-2 rounded shadow cursor-pointer hover:bg-gray-200";
    li.textContent = city;

    li.onclick = () => {

    document.getElementById("cityInput").value = city;
    getWeather();
    };

    list.appendChild(li);
    });
}

loadFavorites();