import "./App.css";
import Body from "./Components/Body/Body";
import Header from "./Components/Header/Header";
import Sidebar from "./Components/Sidebar/Sidebar";
import { useDataLayerValue } from "./Datalayer/DataLayer";
import axios from "axios";
import { useEffect } from "react";

function App() {
  const [{ covidData }, dispatch] = useDataLayerValue();
  const BaseURL = "https://k0-covid-analytics.herokuapp.com";

  const fetchData = async () => {
    await axios.get(BaseURL + "/data/getData").then((data) => {
      dispatch({
        type: "SET_COVID_DATA",
        covidData: data.data,
      });
    });
  };
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="main-dock">
        <Sidebar />
        <Body />
      </div>
    </div>
  );
}

export default App;
