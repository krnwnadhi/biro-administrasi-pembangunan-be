const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URL, {});
        console.log("Db is Connected Successfully");
    } catch (error) {
        console.log(`Error ${error.message}`);
        console.error(`Error connecting to the database: ${error.message}`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = dbConnect;
