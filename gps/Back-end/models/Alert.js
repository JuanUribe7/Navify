const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    imei: { type: String, required: true },
    alertName: { type: String, required: true },
    alertTime: { type: Date, required: true },
    alertType: { type: String, required: true }
}, { minimize: false });

module.exports = mongoose.model('Alert', alertSchema);