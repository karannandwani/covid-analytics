const mongoose = require("mongoose");

const globalSchema = new mongoose.Schema({
  NewConfirmed: {
    type: Number,
    required: true,
  },
  TotalConfirmed: {
    type: Number,
    required: true,
  },
  NewDeaths: {
    type: Number,
    required: true,
  },
  TotalDeaths: {
    type: Number,
    required: true,
  },
  NewRecovered: {
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

module.exports = mongoose.model("Covid_Global", globalSchema);
