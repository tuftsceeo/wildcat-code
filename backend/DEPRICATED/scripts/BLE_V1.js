const UART_SERVICE_UUID = 0xFD02;
//const UART_TX_UUID = 0x0000FD02-0002-1000-8000-00805F9B34FB;
//const UART_RX_UUID = 0x0000FD02-0001-1000-8000-00805F9B34FB;
const MANUFACTURER_ID = 0x0397;

let device, server, service, txCharacteristic, rxCharacteristic;

document.getElementById('connect-button').addEventListener('click', async () => {
    try {
    await connect();
    document.getElementById('status').textContent = 'Connected to UART device';
    console.log('Connected to Spike');

    } catch (error) {
    console.error(error);
    document.getElementById('status').textContent = `Failed to connect: ${error.message}`;
    }
});

async function connect() {
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [
                { 
                  // services: [UART_SERVICE_UUID],
                    manufacturerData: [{ companyIdentifier: MANUFACTURER_ID }]
                }
            ]
            });

    server = await device.gatt.connect();

    // Get the UART service
    service = await server.getPrimaryService(UART_SERVICE_UUID);

    if (service && service.uuid) {
        console.log(`Recognized Service UUID: ${service.uuid}`);
    } else {
        console.error('Service UUID is undefined');
    }

   // txCharacteristic = await service.getCharacteristic(UART_TX_UUID);
   // rxCharacteristic = await service.getCharacteristic(UART_RX_UUID);

   // await rxCharacteristic.startNotifications();
   // rxCharacteristic.addEventListener('characteristicvaluechanged', handleNotifications);

    document.getElementById('status').textContent = 'Connected to UART device';
    } catch (error) {
   // console.log(error);
    document.getElementById('status').textContent = `Failed to connect: ${error.message}`;
    }
}

async function writeToSpike(data) {
    if (!rxCharacteristic) throw new Error('Spike RX characteristic not connected');
    const encoder = new TextEncoder();
    const value = encoder.encode(data);
    await rxCharacteristic.writeValue(value);
}

function handleNotifications(event) {
    const value = event.target.value;
    const decoder = new TextDecoder();
    const data = decoder.decode(value);
    console.log('Received data:', data);
}