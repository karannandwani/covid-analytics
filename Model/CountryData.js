const mongoose = require("mongoose");

const covidSchema = new mongoose.Schema({
  ID: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
  },
  CountryCode: {
    type: String,
    required: true,
  },
  TotalConfirmed: {
    type: Number,
    required: true,
  },
  TotalDeaths: {
    type: Number,
    required: true,
  },
  TotalRecovered: {
    type: Number,
    required: true,
  },
  Date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Covid_Countrywise", covidSchema);
