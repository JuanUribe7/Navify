const net = require('net');
const Gt06 = require('../gt06');
const { handleGt06Messages } = require('../utils/handleGt06Messages');

const PORT = process.env.GT06_SERVER_PORT || 4000;
let cliente = null;

function setupTcpServer() {
  const tcpServer = net.createServer((client) => {
    const gt06 = new Gt06();
    cliente = client;
    console.log('Cliente conectado');

    client.on('error', (err) => {
      console.error('Error del cliente', err);
    });

    client.on('close', () => {
      console.log('Cliente desconectado');
    });

    client.on('data', async (data) => {
      try {
        gt06.parse(data);
      } catch (e) {
        console.log('Error al parsear datos', e);
        return;
      }
      console.log(gt06);
      if (gt06.expectsResponse) {
        client.write(gt06.responseMsg);
      }
      await handleGt06Messages(gt06);
      gt06.clearMsgBuffer();
    });
  });

  tcpServer.listen(PORT, () => {
    console.log(`Servidor TCP corriendo en el puerto ${PORT}`);
  });
}

module.exports = { setupTcpServer };