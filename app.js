const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const DataRoute = require("./Routes/dataRoute");
const PORT = process.env.PORT || 8000;

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.DB_CONNECTION, () => {
  console.log("Yay! Database is connected");
});


app.use("/data", DataRoute);

if ((process.env, (NODE_ENV = "production"))) {
  app.use(express.static("client/build"));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
