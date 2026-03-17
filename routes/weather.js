const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const favoritesFile = path.join(__dirname, "../data/favorites.json");

const router = express.Router();

const API_KEY = process.env.WEATHER_API_KEY;

router.get("/:city", async (req, res) => {

    const city = req.params.city;

    try {

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        const lat = response.data.coord.lat;
        const lon = response.data.coord.lon;
        const details = await axios.get(
        `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        const data = {
            city: response.data.name,
            temperature: response.data.main.temp,
            humidity: response.data.main.humidity,
            wind: response.data.wind.speed,
            description: response.data.weather[0].description,
            precipitation: details.data.current.rain?.["1h"] || 0,
            rainChance: details.data.hourly[0].pop * 100,
            uvIndex: details.data.current.uvi,
            forecast: details.data.daily.slice(1, 6).map(day => ({
                date: new Date(day.dt * 1000).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                min: day.temp.min.toFixed(1),
                max: day.temp.max.toFixed(1),
                description: day.weather[0].description,
                rainChance: (day.pop * 100).toFixed(0),
                uvIndex: day.uvi
        }))
        };

        res.json(data);

    } catch (error) {

        res.status(500).json({ error: "City not found" });

    }

});

router.post("/favorite", (req, res) => {

    const city = req.body.city;

    const favorites = JSON.parse(fs.readFileSync(favoritesFile));

    favorites.push(city);

    fs.writeFileSync(favoritesFile, JSON.stringify(favorites));

    res.json({ message: "City saved" });

});

router.get("/favorites/list", (req, res) => {

    const favorites = JSON.parse(fs.readFileSync(favoritesFile));

    res.json(favorites);

});

module.exports = router;