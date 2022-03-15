const router = require("express").Router();
const axios = require("axios");
const CountryDataModel = require("../Model/CountryData");
const GlobalModel = require("../Model/GlobalSchema");

const getCovidData = async () => {
  var dataRes = {};
  await axios
    .get("https://api.covid19api.com/summary")
    .then((data) => {
      dataRes = {
        Global: data.data.Global,
        Countries: data.data.Countries,
      };
      return dataRes;
    })
    .catch((err) => {
      console.log(err);
    });
  return dataRes;
};

const pushGlobalData = async (covidStats, globalSize, dataPushed) => {
  if (globalSize === 0) {
    const globalData = new GlobalModel({
      NewConfirmed: covidStats.Global.NewConfirmed,
      TotalConfirmed: covidStats.Global.TotalConfirmed,
      NewDeaths: covidStats.Global.NewDeaths,
      TotalDeaths: covidStats.Global.TotalDeaths,
      NewRecovered: covidStats.Global.NewRecovered,
      TotalRecovered: covidStats.Global.TotalRecovered,
      Date: covidStats.Global.Date,
    });

    try {
      await globalData.save();
      dataPushed = true;
    } catch (err) {
      console.log(err);
    }
  }
  return dataPushed;
};

const pushCountryData = async (covidStats, dataPushed) => {
  covidStats.Countries.map(async (con) => {
    const countryPresent = await CountryDataModel.findOne({ ID: con.ID });
    if (!countryPresent) {
      const countryData = new CountryDataModel({
        ID: con.ID,
        Country: con.Country,
        CountryCode: con.CountryCode,
        TotalConfirmed: con.TotalConfirmed,
        TotalDeaths: con.TotalDeaths,
        TotalRecovered: con.TotalRecovered,
        Date: con.Date,
      });

      try {
        await countryData.save();
        dataPushed = true;
      } catch (err) {
        res.send(err);
      }
    }
  });
  return dataPushed;
};

const getCountryData = async (country, st_date, end_date) => {
  var _data = {};
  await axios
    .get(
      `https://api.covid19api.com/total/country/${country}/status/confirmed?from=${st_date}&to=${end_date}`
    )
    .then((data) => {
      _data = data.data;
      console.log(data);
    })
    .catch((err) => console.log(err));
  return _data;
};

router.post("/pushData", async (req, res) => {
  var dataPushed = false;
  var globalSize;
  await GlobalModel.collection.stats().then((data) => {
    globalSize = data.count;
  });

  const covidStats = await getCovidData();

  // Storing Global Data
  dataPushed = await pushGlobalData(covidStats, globalSize, dataPushed);
  dataPushed = await pushCountryData(covidStats, dataPushed);

  if (dataPushed) {
    res.send("Data pushed onto the db");
  } else {
    res.send("Database already up to date");
  }
});

router.get("/getData", async (req, res) => {
  const _globalData = await GlobalModel.find().sort({ Country: 1 });
  const _countryData = await CountryDataModel.find();

  const data = {
    globalData: _globalData[0],
    countryData: _countryData,
  };

  res.send(data);
});

router.get("/country/:country/:st/:end", async (req, res) => {
  const st_date = req.params.st;
  const end_date = req.params.end;
  const country = req.params.country;

  const countryData = await getCountryData(country, st_date, end_date);
  res.send(countryData);
});

module.exports = router;
