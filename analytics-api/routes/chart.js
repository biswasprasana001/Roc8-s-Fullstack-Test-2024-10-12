const express = require("express");
const Chart = require("../models/Chart");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Save chart configuration
router.post("/save", authMiddleware, async (req, res) => {
  const { filters } = req.body;
  const newChart = new Chart({ ownerId: req.user.userId, filters });
  await newChart.save();
  res.send({ message: "Chart saved", chartId: newChart._id });
});

// Get chart configuration by ID (for sharing)
router.get("/:chartId", authMiddleware, async (req, res) => {
  const chart = await Chart.findById(req.params.chartId);
  if (!chart) {
    return res.status(404).send({ message: "Chart not found" });
  }
  if (chart.ownerId.toString() !== req.user.userId) {
    return res.status(403).send({ message: "Unauthorized to view this chart" });
  }
  res.send({ filters: chart.filters });
});

module.exports = router;