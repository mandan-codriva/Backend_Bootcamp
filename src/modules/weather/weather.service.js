
const axios = require("axios");

const redisClient = require(
    "../../config/redis"
);

const getWeatherByCity = async (city) => {

    try {

        // Validate empty city
        if (!city || city.trim() === "") {
            throw {
                statusCode: 400,
                message: "City name is required",
            };
        }

        // Validate city format
        const cityRegex = /^[a-zA-Z\s]+$/;

        if (!cityRegex.test(city)) {
            throw {
                statusCode: 400,
                message: "Invalid city format",
            };
        }

        // Redis cache key
        const cacheKey =
            `weather:${city.toLowerCase()}`;

        // Check Redis cache
        const cachedData =
            await redisClient.get(cacheKey);

        if (cachedData) {

            console.log("Cache HIT");

            return JSON.parse(cachedData);
        }

        console.log("Cache MISS");

        // Fetch from OpenWeather API
        const response = await axios.get(
            "https://api.openweathermap.org/data/2.5/weather",
            {
                params: {
                    q: city,
                    appid:
                        process.env.OPEN_WEATHER_API_KEY,
                    units: "metric",
                },
                timeout: 5000,
            }
        );

        // Prepare weather data
        const weatherData = {
            city: response.data.name,
            temperature: response.data.main.temp,
            weather:
                response.data.weather[0].main,
            humidity:
                response.data.main.humidity,
        };

        // Store in Redis for 1 hour
        await redisClient.setEx(
            cacheKey,
            3600,
            JSON.stringify(weatherData)
        );

        return weatherData;

    } catch (error) {

        console.log(error.response?.data);

        // Re-throw custom errors
        if (error.statusCode) {
            throw error;
        }

        // Invalid city
        if (error.response?.status === 404) {
            throw {
                statusCode: 404,
                message: "Invalid city name",
            };
        }

        // Invalid API key
        if (error.response?.status === 401) {
            throw {
                statusCode: 401,
                message:
                    "Invalid weather API key",
            };
        }

        // Other server/network errors
        throw {
            statusCode: 500,
            message:
                "Failed to fetch weather data",
        };
    }
};

module.exports = {
    getWeatherByCity,
};

