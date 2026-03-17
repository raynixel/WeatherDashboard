const express = require("express");
const cors = require("cors");

// Load environment variables from .env file
require("dotenv").config();

// Import routes
const weatherRoutes = require("./routes/weather");
const app = express();
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static("public"));

// Use the weather routes
app.use("/api/weather", weatherRoutes);
const PORT = 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});