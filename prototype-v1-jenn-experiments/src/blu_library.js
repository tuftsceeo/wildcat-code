// Define a BLE class for handling Bluetooth Low Energy interactions
class BLE {
    constructor() {
        // Initialize BLE properties for device, server, and characteristics
        this.device = null;
        this.server = null;
        this.uartService = null;
        this.txCharacteristic = null; // Characteristic for sending data
        this.rxCharacteristic = null; // Characteristic for receiving data

        this.connected = false; // Status of BLE connection
        this.callback = null; // Callback function to handle received data
    }

    // Method to request and select a Bluetooth device
    ask = async (name) => {
        try {
            let filters = [];
            // Set up filters for device selection based on name or default service UUID
            if (name === "") {
                filters = [
                    { services: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"] },
                ];
            } else {
                filters = [{ name: name }];
            }
            // Request the Bluetooth device based on filters
            this.device = await navigator.bluetooth.requestDevice({
                filters: filters,
                optionalServices: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
            });
            return true;
        } catch (error) {
            console.error("Error scanning for devices:", error);
            return false;
        }
    };

    // Method to connect to the selected Bluetooth device and set up UART service
    connect = async () => {
        try {
            // Connect to the GATT (Generic Attribute Profile) server on the device
            this.server = await this.device.gatt.connect();
            // Access the UART service using its UUID
            this.uartService = await this.server.getPrimaryService(
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
            );
            // Get the characteristics for transmitting and receiving data
            this.txCharacteristic = await this.uartService.getCharacteristic(
                "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
            );
            this.rxCharacteristic = await this.uartService.getCharacteristic(
                "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
            );

            // Set up a listener for data received through rxCharacteristic
            this.rxCharacteristic.addEventListener(
                "characteristicvaluechanged",
                (event) => {
                    let dataArray = new Uint8Array(event.target.value.buffer);
                    // Convert binary data to a string
                    let binaryString = Array.from(dataArray, (byte) =>
                        String.fromCharCode(byte)
                    ).join("");
                    // Call the callback function with received data
                    if (this.callback) {
                        this.callback(binaryString);
                    }
                }
            );

            // Start notifications to receive data from rxCharacteristic
            this.rxCharacteristic
                .startNotifications()
                .then(() => {
                    console.log("Notifications enabled for rxCharacteristic");
                    this.connected = true; // Update connection status
                })
                .catch((error) => {
                    console.error("Error enabling notifications:", error);
                });
            return true;
        } catch (error) {
            console.error("Error connecting to the device:", error);
            return false;
        }
    };

    // Method to disconnect from the Bluetooth device
    disconnect = async () => {
        try {
            // Check if the device is connected and disconnect if true
            if (this.device && this.device.gatt.connected) {
                this.device.gatt.disconnect();
                this.connected = false;
                console.log("disconnected");
            }
        } catch (error) {
            console.error("Error disconnecting from the device:", error);
        }
    };

    // Method to send data to the device through txCharacteristic
    write = async (data) => {
        const encoder = new TextEncoder("utf-8");
        // Encode data as UTF-8 and send to txCharacteristic
        const dataToSend = encoder.encode(data);
        await this.txCharacteristic.writeValue(dataToSend.buffer);
    };
}

// Factory function to create a new BLE instance
export function newBLE() {
    return new BLE();
}
