// analytics-frontend\src\App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie"; // Import js-cookie for cookie management
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
import "./App.css";

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

const API_URL = "http://localhost:5000/api";

const COOKIE_NAME = "userPreferences";

const App = () => {
  const [startDate, setStartDate] = useState(new Date("10/6/2022"));
  const [endDate, setEndDate] = useState(new Date("10/29/2022"));
  const [age, setAge] = useState("15-25");
  const [gender, setGender] = useState("Male");
  const [barData, setBarData] = useState({});

  const [lineDataLabels, setLineDataLabels] = useState([]);
  const [lineDataDatasets, setLineDataDatasets] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("A");
  const [shareableURL, setShareableURL] = useState("");

  const handleGenerateURL = () => {
    const url = constructShareableURL();
    setShareableURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(shareableURL)
      .then(() => alert("URL copied to clipboard!"))
      .catch((err) => console.error("Failed to copy URL", err));
  };

  // Helper to store preferences in cookies
  const savePreferencesToCookies = () => {
    Cookies.set(
      COOKIE_NAME,
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        age,
        gender,
      },
      { expires: 7 }
    ); // Cookie expires in 7 days
  };

  // Retrieve preferences from cookies
  const loadPreferencesFromCookies = () => {
    const savedPreferences = Cookies.getJSON(COOKIE_NAME);
    if (savedPreferences) {
      setStartDate(new Date(savedPreferences.startDate));
      setEndDate(new Date(savedPreferences.endDate));
      setAge(savedPreferences.age || "15-25");
      setGender(savedPreferences.gender || "Male");
    }
  };

  // API call functions
  const fetchData = async (url, payload, setter) => {
    try {
      const response = await axios.post(url, payload);
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  const fetchTotalTime = () => {
    fetchData(
      `${API_URL}/total-time`,
      { startDate, endDate, age, gender },
      (data) => {
        setBarData({
          labels: Object.keys(data),
          datasets: [
            {
              label: "Total Time Spent",
              data: Object.values(data),
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        });
      }
    );
    savePreferencesToCookies(); // Save preferences when fetching total time
  };

  const fetchTimeTrend = () => {
    fetchData(
      `${API_URL}/time-trend`,
      { startDate, endDate, age, gender, feature: selectedFeature },
      (data) => {
        if (data && data.length > 0) {
          const formattedDates = data
            .map((item) => {
              const parsedDate = moment(item.date, "D/M/YYYY");
              return parsedDate.isValid() ? parsedDate.toDate() : null;
            })
            .filter(Boolean);

          const values = data.map((item) => item.value);

          // Update state only if data has changed
          if (
            JSON.stringify(lineDataLabels) !== JSON.stringify(formattedDates) ||
            JSON.stringify(lineDataDatasets) !== JSON.stringify(values)
          ) {
            setLineDataLabels([...formattedDates]);
            setLineDataDatasets([...values]);
          }
        } else {
          console.error("No data returned from the API");
        }
      }
    );
  };

  useEffect(() => {
    loadPreferencesFromCookies(); // Load preferences on page load
  }, []);

  useEffect(() => {
    if (selectedFeature) fetchTimeTrend();
  }, [selectedFeature]);

  // Handle feature selection from bar chart
  const handleFeatureClick = (elements) => {
    if (elements.length > 0) {
      const feature = barData.labels[elements[0].index];
      setSelectedFeature(feature);
    }
  };

  // Clear preferences from cookies and reset to defaults
  const resetPreferences = () => {
    Cookies.remove(COOKIE_NAME);
    setStartDate(new Date("10/6/2022"));
    setEndDate(new Date("10/29/2022"));
    setAge("15-25");
    setGender("Male");
  };

  const constructShareableURL = () => {
    const baseUrl = `${window.location.origin}/share`;

    // Create query parameters based on current filters
    const params = new URLSearchParams({
      start: startDate.toISOString().split("T")[0], // Format to YYYY-MM-DD
      end: endDate.toISOString().split("T")[0],
      age,
      gender,
      feature: selectedFeature,
    });

    // Combine base URL with query parameters
    const shareableURL = `${baseUrl}?${params.toString()}`;

    return shareableURL;
  };

  return (
    <>
      <div className="container">
        <h1>Feature Analytics</h1>

        <div className="filters">
          <FilterItem label="Start Date">
            <DatePicker selected={startDate} onChange={setStartDate} />
          </FilterItem>

          <FilterItem label="End Date">
            <DatePicker selected={endDate} onChange={setEndDate} />
          </FilterItem>

          <FilterItem label="Age">
            <select value={age} onChange={(e) => setAge(e.target.value)}>
              <option value="all">All</option>
              <option value="15-25">15-25</option>
              <option value=">25">25</option>
            </select>
          </FilterItem>

          <FilterItem label="Gender">
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="all">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </FilterItem>
        </div>

        <button className="update-btn" onClick={fetchTotalTime}>
          Update Charts
        </button>

        <button className="reset-btn" onClick={resetPreferences}>
          Reset Preferences
        </button>

        <ChartContainer>
          {barData && (
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
                  x: { ticks: { font: { size: 12 } } },
                },
              }}
            />
          )}

          {selectedFeature && lineDataDatasets.length > 0 ? (
            <Line
              data={{
                labels: lineDataLabels,
                datasets: [
                  {
                    label: `Time Trend for Feature ${selectedFeature}`,
                    data: lineDataDatasets,
                    borderColor: "rgba(153, 102, 255, 1)",
                    backgroundColor: "rgba(153, 102, 255, 0.2)",
                    fill: true,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  zoom: {
                    zoom: {
                      wheel: { enabled: true },
                      pinch: { enabled: true },
                      mode: "x",
                    },
                    pan: { enabled: true, mode: "x" },
                  },
                },
                scales: {
                  x: { type: "time", time: { unit: "day" } },
                },
              }}
            />
          ) : (
            <p>No data available to display</p>
          )}
        </ChartContainer>
      </div>
      <div>
        <h2>Feature Analytics</h2>

        {/* Button to generate the shareable URL */}
        <button onClick={handleGenerateURL}>Generate Shareable URL</button>

        {shareableURL && (
          <div>
            <p>
              Shareable URL:{" "}
              <a href={shareableURL} target="_blank" rel="noopener noreferrer">
                {shareableURL}
              </a>
            </p>

            {/* Button to copy the URL to clipboard */}
            <button onClick={copyToClipboard}>Copy URL to Clipboard</button>
          </div>
        )}
      </div>
    </>
  );
};

// Components for cleaner structure
const FilterItem = ({ label, children }) => (
  <div className="filter-item">
    <label>{label}: </label>
    {children}
  </div>
);

const ChartContainer = ({ children }) => (
  <div className="chart-container">{children}</div>
);

export default App;
