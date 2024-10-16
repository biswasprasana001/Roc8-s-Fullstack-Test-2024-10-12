// analytics-api\index.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const csv = require("csv-parser");
const fs = require("fs");
const moment = require("moment");
const authMiddleware = require("./middleware/auth");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

// Sample dataset loading (or load dynamically)
let dataset = []; // This will store the parsed data

fs.createReadStream("./data.csv") // Reading the CSV file
  .pipe(csv()) // Parsing the CSV
  .on("data", (row) => {
    dataset.push(row); // Add each row to the dataset array
  })
  .on("end", () => {
    // Once the entire file is processed, log the complete dataset
    console.log("CSV file successfully processed.");
  })
  .on("error", (err) => {
    // If there is any error during reading, log it
    console.error("Error while reading CSV file:", err);
  });

// Get total time spent on features based on filters
app.post("/api/total-time", authMiddleware, (req, res) => {
  const { startDate, endDate, age, gender } = req.body;
  const start = new Date(startDate);
  const end = new Date(endDate);

  const filteredData = dataset.filter((d, index) => {
    // Convert the CSV date from 'DD/MM/YYYY' to a proper Date object
    const csvDate = moment(d.Day, "DD/MM/YYYY").toDate();
    // Apply the filters for date, age, and gender
    // console.log(csvDate, start, end, age, gender);
    // console.log(++count);
    return (
      csvDate >= start && csvDate <= end && d.Age == age && d.Gender == gender
    );
  });

  const result = filteredData.reduce((acc, row) => {
    ["A", "B", "C", "D", "E", "F"].forEach((feature) => {
      acc[feature] = (acc[feature] || 0) + parseInt(row[feature]);
    });
    return acc;
  }, {});

  res.json(result);
});

// Get time trend data for a specific feature
app.post("/api/time-trend", authMiddleware, (req, res) => {
  const { startDate, endDate, age, gender, feature } = req.body;
  console.log(req.body);
  // Convert startDate and endDate to match the format in CSV
  const start = new Date(startDate);
  const end = new Date(endDate);
  // Filter the data based on the request
  let count = 0;
  const filteredData = dataset.filter((d, index) => {
    // Convert the CSV date from 'DD/MM/YYYY' to a proper Date object
    const csvDate = moment(d.Day, "DD/MM/YYYY").toDate();
    // Apply the filters for date, age, and gender
    // console.log(csvDate, start, end, age, gender);
    // console.log(++count);
    return (
      csvDate >= start && csvDate <= end && d.Age == age && d.Gender == gender
    );
  });
  // Prepare the result to be sent to the frontend
  const result = filteredData.map((row) => ({
    date: row.Day, // Keep the date in 'DD/MM/YYYY' format
    value: parseInt(row[feature], 10), // Convert feature value to a number
  }));
  console.log(result);
  res.json(result); // Send the result as JSON
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
