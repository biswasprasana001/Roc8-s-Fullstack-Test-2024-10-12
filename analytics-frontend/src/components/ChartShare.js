import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import moment from "moment";
import DatePicker from "react-datepicker";
const API_URL = "http://localhost:5000/api";

const ChartPage = () => {
  const [searchParams] = useSearchParams();
  const [barData, setBarData] = useState({});
  const [lineDataLabels, setLineDataLabels] = useState([]);
  const [lineDataDatasets, setLineDataDatasets] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState("A");

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [age, setAge] = useState(null);
  const [gender, setGender] = useState(null);

  setStartDate(searchParams.get("start"));
  setEndDate(searchParams.get("end"));
  setAge(searchParams.get("age"));
  setGender(searchParams.get("gender"));
  const feature = searchParams.get("feature");

  useEffect(() => {
    // Fetch chart data based on URL params
    const fetchChartData = async () => {
      const payloadBarChart = { startDate, endDate, age, gender };
      const totalTimeResponse = await axios.post(
        `${API_URL}/total-time`,
        payloadBarChart
      );

      setBarData({
        labels: Object.keys(totalTimeResponse),
        datasets: [
          {
            label: "Total Time Spent",
            data: Object.values(totalTimeResponse),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
          },
        ],
      });

      const payloadLineChart = { startDate, endDate, age, gender, feature };
      const timeTrendResponse = await axios.post(
        `${API_URL}/time-trend`,
        payloadLineChart
      );
      if (timeTrendResponse && timeTrendResponse.length > 0) {
        const formattedDates = timeTrendResponse
          .map((item) => {
            const parsedDate = moment(item.date, "D/M/YYYY");
            return parsedDate.isValid() ? parsedDate.toDate() : null;
          })
          .filter(Boolean);

        const values = timeTrendResponse.map((item) => item.value);

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
    };
    fetchChartData();
  }, [startDate, endDate, age, gender, feature]);

  // Handle feature selection from bar chart
  const handleFeatureClick = (elements) => {
    if (elements.length > 0) {
      const feature = barData.labels[elements[0].index];
      setSelectedFeature(feature);
    }
  };

  // Render charts here
  return (
    <div>
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

        <button className="update-btn" onClick={() => window.location.reload()}>
          Update Charts
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
    </div>
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

export default ChartPage;
