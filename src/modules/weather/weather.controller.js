const weatherService = require(
    "./weather.service"
);

const getWeather = async (req, res) => {
    try {
        const { city } = req.query;

        const data =
            await weatherService.getWeatherByCity(city);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        return res.status(error.statusCode || 400).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getWeather,
};