const mongoose = require("mongoose");

const chartSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  filters: { type: Object, required: true }, // Store the chart filters
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chart", chartSchema);
