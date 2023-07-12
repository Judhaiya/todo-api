const mongoose = require("mongoose")
const connectDB = async () => {
    try {
        const isConnected = await mongoose.connect(process.env.MONGO_URI)
        if (isConnected) {
            console.log("connected")
        }
    }
    catch (err) {
        console.log("error occured", err)
    }
}
exports.connectDB = connectDB