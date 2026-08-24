const mongoose = require("mongoose");

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("MongoDB Connection Error: MONGO_URI is not set. Provide it via environment or a .env file.");
        process.exit(1);
    }

    try {
        await mongoose.connect(mongoUri);

        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectDB;