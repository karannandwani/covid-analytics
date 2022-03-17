import React, { useEffect, useState } from "react";
import { useDataLayerValue } from "../../Datalayer/DataLayer";
import "./body.css";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { chart as ChartJS } from "chart.js/auto";
function Body() {
  // Variables

  const [{ covidData, searchRes, searchClicked }] = useDataLayerValue();
  const [selectedItems, setSelectedItems] = useState([]);
  const BaseURL = "https://k0-covid-analytics.herokuapp.com";
  const [showGraph, setShowGraph] = useState(false);
  const [to_date, setTo_date] = useState();
  const [from_date, setFrom_date] = useState();
  const [to_date_temp, setTo_date_temp] = useState();
  const [from_date_temp, setFrom_date_temp] = useState();
  const d = new Date();
  const max_date = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const [graphData, setgraphData] = useState({
    labels: [],
    datasets: [],
  });

  // Function to get random color

  function getRandomColor() {
    var letters = "0123456789ABCDEF";
    var color = "#";
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Function to set default starting and ending dates

  const setDefaultDate = () => {
    // Set default dates
    setTo_date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
    d.setMonth(d.getMonth() - 1);
    setFrom_date(`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`);
  };

  // Function to get country datewise data

  const getCountryData = async (country, st_date, end_date) => {
    var _data = [];
    await axios
      .get(BaseURL + `/data/country/${country}/${st_date}/${end_date}`)
      .then((data) => {
        _data = data.data;
        return _data;
      })
      .catch((err) => console.log(err));
    return _data;
  };

  // Function to select a row from the table

  const selectRow = async (e, index) => {
    const row = e.target.parentNode;

    if (row.classList.contains("selected-table-row")) {
      row.classList.remove("selected-table-row");
      setSelectedItems(
        selectedItems.filter(
          (item) => item.country.ID !== covidData?.countryData[index].ID
        )
      );

      setgraphData((state) => ({
        ...state,
        datasets: graphData.datasets.filter(
          (item) => item.label !== covidData?.countryData[index].Country
        ),
      }));
      if (graphData.datasets.length === 1) {
        setShowGraph(false);
      }
    } else {
      row.classList.add("selected-table-row");
      const _data = await getCountryData(
        covidData?.countryData[index].Country,
        from_date,
        to_date
      );
      const selected_country_data = {
        country: covidData?.countryData[index],
        data: _data,
      };
      setSelectedItems((state) => [...state, selected_country_data]);

      const newDataset = {
        label: selected_country_data.country.Country,
        data: selected_country_data.data.map((item) => item.Cases),
        borderColor: [getRandomColor()],
        borderWidth: 1,
      };
      setgraphData((state) => ({
        ...state,
        labels: selected_country_data.data.map((item) => {
          const date = new Date(item.Date);
          const options = { month: "short", day: "numeric" };
          return date.toLocaleDateString("en-US", options);
        }),
      }));

      setgraphData((state) => ({
        ...state,
        datasets: [...state.datasets, newDataset],
      }));

      setShowGraph(true);
    }
  };

  // Function to change starting and ending dates

  const changeDateFunc = async () => {
    var new_data_temp = selectedItems.map(async (item) => {
      const _data = await getCountryData(
        item.country.Country,
        from_date_temp,
        to_date_temp
      );

      const new_data_to_push = { country: item.country, data: _data };
      return new_data_to_push;
    });

    const new_data = [];

    await Promise.all(new_data_temp).then((item) => {
      new_data.push(item);
    });

    setSelectedItems(new_data[0]);
    console.log(new_data[0][0]);
    setgraphData((state) => ({
      ...state,
      labels: new_data[0][0].data.map((item) => {
        const date = new Date(item.Date);
        const options = { month: "short", day: "numeric" };
        return date.toLocaleDateString("en-US", options);
      }),
    }));
    setTo_date(to_date_temp);
    setFrom_date(from_date_temp);
  };


  useEffect(() => {
    setDefaultDate();
  }, []);

  return (
    <div className="Body">
      <div className="body-container">
        <div className="body-top">
          <div className="top-banner">
            <div className="top-banner-content">
              <p>Stay updated with the latest Covid data</p>
            </div>
          </div>
          <div className="global-stats">
            <div className="global-stat">
              <div className="stat-card">
                <div className="stat-nums">
                  {covidData?.globalData.TotalConfirmed}
                </div>
                <p>Total Confirmed</p>
              </div>
            </div>
            <div className="global-stat">
              <div className="stat-card">
                <div className="stat-nums">
                  {covidData?.globalData.TotalDeaths}
                </div>
                <p>Total Deaths</p>
              </div>
            </div>
            <div className="global-stat">
              <div className="stat-card">
                <div className="stat-nums">
                  {covidData?.globalData.TotalRecovered}
                </div>
                <p>Total Recorvered</p>
              </div>
            </div>
          </div>
        </div>
        <div className="body-bottom">
          <div className="table-container">
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Total Confirmed</th>
                    <th>Total Deaths</th>
                    <th>Total Recovered</th>
                  </tr>
                </thead>
                <tbody>
                  {!searchClicked
                    ? covidData?.countryData.map((data, i) => (
                        <tr
                          key={i}
                          onClick={(e) => {
                            selectRow(e, covidData?.countryData.indexOf(data));
                          }}
                        >
                          <td>{data.Country}</td>
                          <td>{data.TotalConfirmed}</td>
                          <td>{data.TotalDeaths}</td>
                          <td>{data.TotalRecovered}</td>
                        </tr>
                      ))
                    : searchRes?.map((data, i) => (
                        <tr
                          key={i}
                          onClick={(e) => {
                            selectRow(e, covidData?.countryData.indexOf(data));
                          }}
                        >
                          <td>{data.Country}</td>
                          <td>{data.TotalConfirmed}</td>
                          <td>{data.TotalDeaths}</td>
                          <td>{data.TotalRecovered}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          <div
            className={`graph-container ${showGraph && "graph-container-show"}`}
          >
            <div className="graph-content">
              <div className="time-container">
                <div>
                  <label htmlFor="st_date">Starting Date : </label>
                  <input
                    type="date"
                    name="st_date"
                    id="st_date"
                    max={max_date}
                    onChange={(e) => {
                      setFrom_date_temp(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="end_date">Ending Date : </label>
                  <input
                    type="date"
                    name="end_date"
                    id="end_date"
                    max={max_date}
                    onChange={(e) => {
                      setTo_date_temp(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <button
                    onClick={() => {
                      changeDateFunc();
                    }}
                  >
                    Change Dates
                  </button>
                </div>
              </div>
              {showGraph && <Line data={graphData} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Body;
