const app = require("./app");
const redis = require("./redis");
const configs = require("./configs");
const mongoose = require("mongoose");

//* Start Server
async function startServer() {
  try {
    //* Connect To Mongo DB
    await mongoose.connect(configs.db.mongo_uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");

    //*Redis
    await redis.ping();

    app.listen(configs.port, () => {
      console.log(`Server started on port ${configs.port}`);
    });
  } catch (err) {
    console.log("server.js ->", err);
    await mongoose.disconnect();
    await redis.disconnect();
  }
}

//* Run Project
startServer();
