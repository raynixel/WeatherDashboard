const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Path to the favorites JSON file
const favoritesFile = path.join(__dirname, "../data/favorites.json");
const router = express.Router();

// Load API key from environment variables
const API_KEY = process.env.WEATHER_API_KEY;

/**
 * Get weather data and a five day forecast for a specific city
 * Makes two API calls to OpenWeatherMap: one for current weather and another for detailed forecast data
 */
router.get("/:city", async (req, res) => {

    const city = req.params.city;
    try {

        // Fetch current weather data to get coordinates for the city, then fetch detailed forecast data using those coordinates
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const lat = response.data.coord.lat;
        const lon = response.data.coord.lon;
        const details = await axios.get(
            `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        // Combine data from both API calls into a single response object
        const data = {
            city: response.data.name,
            temperature: response.data.main.temp, // Current temperature in Celsius
            humidity: response.data.main.humidity, // Current humidity percentage
            wind: response.data.wind.speed, // Current wind speed in m/s
            description: response.data.weather[0].description, // Weather description (e.g., "clear sky")
            precipitation: details.data.current.rain?.["1h"] || 0, // Precipitation in the last hour (mm)
            rainChance: details.data.hourly[0].pop * 100, // Chance of rain in the next hour (percentage)
            uvIndex: details.data.current.uvi, // Current UV index

            // Five-day forecast data, excluding the current day
            forecast: details.data.daily.slice(1, 6).map(day => ({
                date: new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                min: day.temp.min.toFixed(1), // Minimum temperature for the day in Celsius
                max: day.temp.max.toFixed(1), // Maximum temperature for the day in Celsius
                description: day.weather[0].description,
                rainChance: (day.pop * 100).toFixed(0), // Chance of rain for the day (percentage)
                uvIndex: day.uvi
            }))
        };
        
        res.json(data);

    } catch (error) {

        // If there's an error (e.g., city not found), return a 500 status with an error message
        res.status(500).json({ error: "City not found" });

    }

});

/** Add a city to the list of favorite cities 
 * Reads the current list of favorites from the JSON file, adds the new city, and writes the updated list back to the file
 * Note: This implementation does not handle duplicates or concurrent writes, which could be improved later
*/
router.post("/favorite", (req, res) => {

    const city = req.body.city;

    // Read the current list of favorites, add the new city, and write it back to the file
    const favorites = JSON.parse(fs.readFileSync(favoritesFile));
    favorites.push(city);

    // Write the updated favorites list back to the JSON file
    fs.writeFileSync(favoritesFile, JSON.stringify(favorites));
    res.json({ message: "City saved" });

});

// Get the list of favorite cities and return it as a JSON response
router.get("/favorites/list", (req, res) => {

    const favorites = JSON.parse(fs.readFileSync(favoritesFile));

    res.json(favorites);

});

module.exports = router;