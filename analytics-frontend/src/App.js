// analytics-frontend\src\App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom"; // Import the zoom plugin
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  zoomPlugin // Register the zoom plugin
);

const App = () => {
  const [startDate, setStartDate] = useState(new Date("10/6/2022"));
  const [endDate, setEndDate] = useState(new Date("10/29/2022"));
  const [age, setAge] = useState("15-25");
  const [gender, setGender] = useState("Male");
  const [barData, setBarData] = useState({});
  const [lineData, setLineData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedFeature, setSelectedFeature] = useState("A");

  useEffect(() => {
    if (selectedFeature) {
      fetchTimeTrend();
    }
  }, [selectedFeature]);

  const fetchTotalTime = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/total-time",
        {
          startDate,
          endDate,
          age,
          gender,
        }
      );
      const data = response.data;
      console.log(data); // This helps in checking if you get the data correctly

      if (data && data.length > 0) {
        // Ensure data exists and is not empty
        setLineData({
          labels: data.map((item) => new Date(item.date)), // Convert to Date objects
          datasets: [
            {
              label: `Time Trend for Feature ${selectedFeature}`,
              data: data.map((item) => item.value),
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              fill: true,
            },
          ],
        });
      } else {
        console.error("No data returned from the API");
      }
    } catch (error) {
      console.error("Error fetching time trend:", error);
    }
  };

  useEffect(() => {
    console.log("lineData updated:", lineData);
  }, [lineData]);

  const fetchTimeTrend = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/time-trend",
        {
          startDate,
          endDate,
          age,
          gender,
          feature: selectedFeature,
        }
      );

      const data = response.data;
      console.log("Fetched data:", data); // Step 1: Log raw data from API

      if (data && data.length > 0) {
        // Inside fetchTimeTrend function
        const formattedDates = data.map((item) => {
          // Using moment to parse the date as 'DD/MM/YYYY'
          const parsedDate = moment(item.date, "D/M/YYYY");
          if (parsedDate.isValid()) {
            return parsedDate.toDate(); // Return as a JavaScript Date object
          } else {
            console.error("Invalid date:", item.date); // Log any invalid dates
            return null; // Return null for invalid dates
          }
        });
        const values = data.map((item) => item.value);

        console.log("Formatted dates:", formattedDates); // Step 2: Log formatted dates
        console.log("Values:", values); // Step 3: Log values for the chart

        setLineData({
          labels: formattedDates,
          datasets: [
            {
              label: `Time Trend for Feature ${selectedFeature}`,
              data: values,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              fill: true,
            },
          ],
        });

        console.log("Updated lineData:", {
          labels: formattedDates,
          datasets: [
            {
              label: `Time Trend for Feature ${selectedFeature}`,
              data: values,
              borderColor: "rgba(153, 102, 255, 1)",
              backgroundColor: "rgba(153, 102, 255, 0.2)",
              fill: true,
            },
          ],
        });
        console.log("Line data:", lineData);
      } else {
        console.error("No data returned from the API");
      }
    } catch (error) {
      console.error("Error fetching time trend:", error);
    }
  };

  const handleFeatureClick = (elements) => {
    if (elements.length > 0) {
      const feature = barData.labels[elements[0].index];
      setSelectedFeature(feature);
    }
  };

  return (
    <div className="container">
      <h1>Feature Analytics</h1>

      <div className="filters">
        <div className="filter-item">
          <label>Start Date: </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
          />
        </div>

        <div className="filter-item">
          <label>End Date: </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
          />
        </div>

        <div className="filter-item">
          <label>Age: </label>
          <select value={age} onChange={(e) => setAge(e.target.value)}>
            <option value="all">All</option>
            <option value="15-25">15-25</option>
            <option value=">25">25</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Gender: </label>
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
      </div>

      {/* <button className="update-btn" onClick={fetchTotalTime}>
        Update Charts
      </button> */}

      {barData && (
        <div className="chart-container">
          <Bar
            data={barData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: (evt, elements) => handleFeatureClick(elements),
              plugins: {
                title: {
                  display: true,
                  text: "Total Time Spent on Features",
                },
              },
              scales: {
                x: {
                  ticks: {
                    font: {
                      size: 12,
                    },
                  },
                },
              },
            }}
          />
        </div>
      )}

      {selectedFeature && lineData.labels && lineData.labels.length > 0 ? (
        <div className="chart-container">
          <Line
            data={lineData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                zoom: {
                  zoom: {
                    wheel: {
                      enabled: true,
                    },
                    pinch: {
                      enabled: true,
                    },
                    mode: "x",
                  },
                  pan: {
                    enabled: true,
                    mode: "x",
                  },
                },
              },
              scales: {
                x: {
                  type: "time",
                  time: {
                    unit: "day",
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <p>No data available to display</p>
      )}
    </div>
  );
};

export default App;
