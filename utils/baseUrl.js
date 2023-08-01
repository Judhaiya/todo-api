const dotenv = require("dotenv");
dotenv.config();

exports.baseUrl = {
  local: {
    MONGO_URL: "mongodb+srv://jeyaudhaiya:jeyaudhaiya@cluster0.gvhcjfn.mongodb.net/",
    JWT_SECRET: `${process.env.JWT_SECRET}`,
    SERVER_URL: "http://localhost:8080"
  }
};
