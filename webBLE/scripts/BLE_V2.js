const UART_SERVICE_UUID = 0xFD02;
/*WARNING: naming for Tx and Rx UUIDs are potentially misleading; UUID values correspond to oppsing channels on Spike (Web Tx --> Spike Rx; vice versa)*/
const WEB_TX_UUID = '0000fd02-0001-1000-8000-00805f9b34fb'; // Spike Rx address (directed message) 
const WEB_RX_UUID = '0000fd02-0002-1000-8000-00805f9b34fb'; // Spike Tx address (directed notification)
const MANUFACTURER_ID = 0x0397;

/* Refer to --LEGO® Education SPIKE™ Prime protocol-- for documentation pertaining to message/item byte values (uint8) 
*  https://lego.github.io/spike-prime-docs/index.html
*  Using byte values for ease of translation from WebUI to Spike (running hub commands) */
const INFO_REQUEST_COMMAND = new Uint8Array([0x00]); // Example command byte for info request

let device, server, service, txCharacteristic, rxCharacteristic;

document.getElementById('connect-button').addEventListener('click', async () => {
    try {
        await connect();
        await setupCharacteristics();
        document.getElementById('status').textContent = 'Connected to UART device';
        console.log('Connected to Spike');
        document.getElementById('check-uuid-button').disabled = false;
    } catch (error) {
        console.error(error);
        document.getElementById('status').textContent = `Failed to connect: ${error.message}`;
    }
});

document.getElementById('check-uuid-button').addEventListener('click', () => {
    if (device && service) {
        document.getElementById('device-uuid').textContent = `Device UUID: ${device.id}`;
        document.getElementById('service-uuid').textContent = `Service UUID: ${service.uuid}`;
    } else {
        document.getElementById('device-uuid').textContent = 'Device UUID: Not connected';
        document.getElementById('service-uuid').textContent = 'Service UUID: Not connected';
    }
});

/*document.getElementById('upload-file-input').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    let arrayBuffer = await file.arrayBuffer();
    let data = new Uint8Array(arrayBuffer);

    // request device info for initial web-side parameters/ formatting
    sendInfoRequest();

    // watch for infoResponse
    await infoResponse()
});*/

document.getElementById('send-receive').addEventListener('click', () => {
    sendInfoRequest();
    infoResponse();
});

async function connect() {
    try {
        device = await navigator.bluetooth.requestDevice({
            filters: [
                { 
                    manufacturerData: [{ companyIdentifier: MANUFACTURER_ID }]
                }
            ],
            optionalServices: [UART_SERVICE_UUID]
        });

        // Instantiate server as gatt device
        server = await device.gatt.connect();

        // Initialize service from server
        service = await server.getPrimaryService(UART_SERVICE_UUID);

        // Explicitly get the TX and RX characteristics with the needed properties
        txCharacteristic = await service.getCharacteristic(WEB_TX_UUID).then(txChar => {
            if (!txChar.properties.write) {
                throw new Error('TX Characteristic does not support write operation');
            }
            return txChar;
        });

        rxCharacteristic = await service.getCharacteristic(WEB_RX_UUID).then(rxChar => {
            if (!rxChar.properties.notify) {
                throw new Error('RX Characteristic does not support notify operation');
            }
            return rxChar;
        });

        console.log('Characteristics setup complete');

        // Check and log the service UUID
        if (service && service.uuid) {
            console.log(`Recognized Service UUID: ${service.uuid}`);
        } else {
            console.error('Service UUID is undefined');
        }

        document.getElementById('status').textContent = 'Connected to UART device';
    } catch (error) {
        console.error(error);
        document.getElementById('status').textContent = `Failed to connect: ${error.message}`;
    }
}

async function setupCharacteristics() {
    txCharacteristic = await service.getCharacteristic(WEB_TX_UUID);
    rxCharacteristic = await service.getCharacteristic(WEB_RX_UUID);

    console.log(`Tx Characteristic UUID: ${txCharacteristic.uuid}`);
    console.log(`Rx Characteristic UUID: ${rxCharacteristic.uuid}`);
}


function sendInfoRequest() {
    const encodedMessage = INFO_REQUEST_COMMAND;
    txCharacteristic.writeValue(encodedMessage)
        .then(() => console.log('Info request sent'))
        .catch(error => console.error('Send error:', error));
}

/* original func for recieving messages --> non-async/ limited info pulled
function receiveMessage() {
    rxCharacteristic.startNotifications().then(() => {
        console.log('Notifications started');
        rxCharacteristic.addEventListener('characteristicvaluechanged', event => {
            const value = event.target.value;
            const decoder = new TextDecoder('utf-8');
            const decodedMessage = decoder.decode(value);
            console.log('Received:', decodedMessage);
            document.getElementById('info-response').textContent = `Info Response: ${decodedjsonMessage}`;
        });
    }).catch(error => console.error('Notification start error:', error));
}
    */

// new message recieve func; async, set's chunk size
async function infoResponse() {
    let chunkSizeInitialized = false;
    let chunkSize = 20; // Default chunk size

    await rxCharacteristic.startNotifications();
    console.log('Notifications started');

    rxCharacteristic.addEventListener('characteristicvaluechanged', event => {
        const value = event.target.value;
        const decoder = new TextDecoder('utf-8');
        const decodedMessage = decoder.decode(value);

        if (!chunkSizeInitialized) {
            // Extract chunk size from the decoded message
            chunkSize = getMaxChunkSize(decodedMessage); // assume this function is implemented to extract chunk size
            chunkSizeInitialized = true;
            console.log(`Chunk size set to ${chunkSize}`);
        }

        console.log('Received:', decodedMessage);
        //document.getElementById('info-response').textContent = `Info Response: ${decodedMessage}`;
    });
}

/* orignal func for message transmission --> incorrect formatting/ non-chunk
function sendMessage(message) {
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    txCharacteristic.writeValue(encodedMessage);
}
    */

// new message transmission function; async, uses chunks & formatting
async function sendMessage(data) {
    let position = 0;
    while (position < data.length) {
        let chunk = data.slice(position, Math.min(position + chunkSize, data.length));
        await txCharacteristic.writeValue(chunk);
        position += chunkSize;
        console.log(`Sent chunk up to position ${position}`);
    }
    console.log('File transfer complete');
}

function getMaxChunkSize(infoResponse) {
    const dataView = new DataView(infoResponse);
    const maxChunkSizeOffset = 10;// byte offset 10 because max_chunk_size is after 10 bytes of other data
    const maxChunkSize = dataView.getUint16(maxChunkSizeOffset, true); // true for little-endian
    return maxChunkSize;
}