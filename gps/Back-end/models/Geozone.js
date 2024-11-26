const mongoose = require('mongoose');

// Definir el esquema de punto
const pointSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true }
});

// Definir el esquema de geozona
const geozoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true, enum: ['Polygon', 'Circle'] }, // Tipo de geozona: 'Polygon' o 'Circle'
  center: {
    type: pointSchema,
    required: function() { return this.type === 'Circle'; } // Requerido si el tipo es 'Circle'
  },
  radius: {
    type: Number,
    required: function() { return this.type === 'Circle'; } // Requerido si el tipo es 'Circle'
  },
  vertices: {
    type: [pointSchema],
    required: function() { return this.type === 'Polygon'; } // Requerido si el tipo es 'Polygon'
  }
}, { minimize: false });

// Crear y exportar el modelo de geozona
const Geozone = mongoose.model('Geozone', geozoneSchema);
module.exports = Geozone;