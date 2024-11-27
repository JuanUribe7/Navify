const mongoose = require('mongoose');

const pointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

const waypointSchema = new mongoose.Schema({
  latLng: pointSchema,
  name: { type: String, required: true }
});

const instructionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  distance: { type: Number, required: true },
  time: { type: Number, required: true }
});

const routeSchema = new mongoose.Schema({
  coordinates: [pointSchema],
  summary: {
    totalDistance: { type: Number, required: true },
    totalTime: { type: Number, required: true }
  },
  waypoints: [waypointSchema],
  instructions: [instructionSchema]
});

module.exports = mongoose.model('Route', routeSchema);