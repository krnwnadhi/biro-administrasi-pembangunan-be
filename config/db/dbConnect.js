const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URL, {});
        console.log("Db is Connected Successfully");
    } catch (error) {
        console.log(`Error ${error.message}`);
    }
};

module.exports = dbConnect;
