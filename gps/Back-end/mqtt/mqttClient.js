const mqtt = require('mqtt');

const rootTopic = process.env.MQTT_ROOT_TOPIC || 'gt06';
const brokerUrl = process.env.MQTT_BROKER_URL || '11ec3ffa829840c785105a23a3994db1.s1.eu.hivemq.cloud';
const brokerPort = process.env.MQTT_BROKER_PORT || 1883;
const mqttProtocol = process.env.MQTT_BROKER_PROTO || 'mqtt';
const brokerUser = process.env.MQTT_BROKER_USER || 'DiegoGPS';
const brokerPasswd = process.env.MQTT_BROKER_PASSWD || 'Dl1042248136!';

function setupMqttClient() {
  const mqttClient = mqtt.connect({
    protocol: mqttProtocol,
    host: brokerUrl,
    port: brokerPort,
    username: brokerUser,
    password: brokerPasswd
  });

  mqttClient.on('connect', () => {
    console.log('Cliente MQTT conectado');
  });

  mqttClient.on('error', (err) => {
    console.error('Error en la conexión MQTT:', err);
  });

  return mqttClient;
}

module.exports = { setupMqttClient };