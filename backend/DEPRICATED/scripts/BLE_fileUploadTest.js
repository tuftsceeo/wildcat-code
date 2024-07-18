const UART_SERVICE_UUID = 0xFD02;
const WEB_TX_UUID = '0000fd02-0001-1000-8000-00805f9b34fb'; // Spike Rx address (directed message)
const WEB_RX_UUID = '0000fd02-0002-1000-8000-00805f9b34fb'; // Spike Tx address (directed notification)
const MANUFACTURER_ID = 0x0397;

let device, server, service, txCharacteristic, rxCharacteristic;

document.getElementById('connect-button').addEventListener('click', async () => {
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [
                {
                manufacturerData: [{ companyIdentifier: MANUFACTURER_ID }]
                }
            ],
            optionalServices: [UART_SERVICE_UUID]
        });
        server = await device.gatt.connect();
        service = await server.getPrimaryService(UART_SERVICE_UUID);
        txCharacteristic = await service.getCharacteristic(WEB_TX_UUID);
        rxCharacteristic = await service.getCharacteristic(WEB_RX_UUID);
        document.getElementById('status').textContent = 'Connected to UART device';
        document.getElementById('upload-button').disabled = false;
    } catch (error) {
        console.error(error);
        document.getElementById('status').textContent = `Failed to connect: ${error.message}`;
    }
});

document.getElementById('upload-button').addEventListener('click', async () => {
    const file = document.getElementById('file-input').files[0];
    if (!file) {
        alert('Please select a file to upload');
        return;
    }
    const reader = new FileReader();
    reader.onload = async function () {
        const data = new Uint8Array(reader.result);
        await txCharacteristic.writeValue(data);
        document.getElementById('status').textContent = 'File uploaded successfully';
    };
    reader.onerror = function () {
        console.error('Error reading file:', reader.error);
        document.getElementById('status').textContent = `Failed to read file: ${reader.error}`;
    };
    reader.readAsArrayBuffer(file);
});