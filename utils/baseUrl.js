const dotenv = require("dotenv");
dotenv.config();

/** baseUrl Object consists of urls and common variables which our app would make use of
 *  seceret variables would be accessed from dotenv file
 */
exports.baseUrl = {
  local: {
    MONGO_URL: "mongodb+srv://jeyaudhaiya:jeyaudhaiya@cluster0.gvhcjfn.mongodb.net/",
    JWT_SECRET: `${process.env.JWT_SECRET}`,
    SERVER_URL: "http://localhost:8080"
  }
};
