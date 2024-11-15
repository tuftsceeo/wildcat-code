// Import necessary modules from messages.js, crc.js, and cobs.js

// THIS IS A WORK IN PROGRESS - UNTESTED

// Import necessary modules from messages.js, crc.js, and cobs.js
import * as messages from "./messages"; // Assuming you have implemented messages.js with message classes
import { crc } from "./crc";
import { encode as cobsEncode, decode as cobsDecode } from "./cobs";
import { Buffer } from "buffer";

const SERVICE_UUID = "0000fd02-0000-1000-8000-00805f9b34fb";
const RX_CHAR_UUID = "0000fd02-0001-1000-8000-00805f9b34fb";
const TX_CHAR_UUID = "0000fd02-0002-1000-8000-00805f9b34fb";
const DEVICE_NOTIFICATION_INTERVAL_MS = 5000;

// Define constants for example usage
const EXAMPLE_SLOT = 0;
const EXAMPLE_PROGRAM = Buffer.from(
    `import runloop
from hub import light_matrix
print("Console message from hub.")
async def main():
    await light_matrix.write("Hello, world!")
runloop.run(main())`,
    "utf8",
);

class SpikeBLE {
    constructor() {
        // Initialize BLE properties for device, server, and characteristics
        this.device = null;
        this.server = null;
        this.uartService = null;
        this.txCharacteristic = null; // Characteristic for sending data
        this.rxCharacteristic = null; // Characteristic for receiving data

        this.connected = false; // Status of BLE connection
        this.callback = null; // Callback function to handle received data
        this.infoResponse = null; // Stores info response from the hub
        this.pendingResponses = new Map(); // Tracks multiple pending responses
        this.cleanupInterval = setInterval(this.cleanupPendingResponses, 10000); // Cleanup interval to clear stale promises
    }

    /*
    ===============
    ERROR CATCHING HELPERS
    ===============
    */
    ensureInitialized = () => {
        if (
            !this.device ||
            !this.server ||
            !this.txCharacteristic ||
            !this.rxCharacteristic
        ) {
            throw new Error("BLE device is not properly initialized.");
        }
    };

    // Method to retry an asynchronous operation
    retryOperation = async (operation, retries = 3, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`Attempt ${i + 1} failed: ${error.message}`);
                if (i < retries - 1)
                    await new Promise((resolve) => setTimeout(resolve, delay));
            }
        }
        throw new Error(`Failed after ${retries} attempts`);
    };

    // Handle unexpected disconnection
    onDisconnect = async () => {
        console.warn("Device disconnected unexpectedly.");
        this.connected = false;
        // Optionally attempt reconnection
        try {
            await this.retryOperation(
                async () => {
                    await this.connect();
                },
                3,
                1000,
            );
        } catch (error) {
            console.error("Failed to reconnect after disconnection:", error);
        }
    };

    // Method to clean up stale pending responses
    cleanupPendingResponses = () => {
        const now = Date.now();
        for (const [key, value] of this.pendingResponses.entries()) {
            if (now - value.timestamp > 10000) {
                // 10-second threshold
                console.warn(
                    `Cleaning up stale pending response for message ID: ${key}`,
                );
                value.reject(
                    new Error(`Response for message ID ${key} timed out.`),
                );
                this.pendingResponses.delete(key);
            }
        }
    };

    /*
    ===============
    CONNECTION and SETUP
    ===============
    */
    // Method to request and select a Bluetooth device
    ask = async (name) => {
        try {
            let filters = [];
            // Set up filters for device selection based on name or default service UUID
            if (name === "") {
                filters = [{ services: [SERVICE_UUID] }];
            } else {
                filters = [{ name: name }];
            }
            // Request the Bluetooth device based on filters
            this.device = await navigator.bluetooth.requestDevice({
                filters: filters,
                optionalServices: [SERVICE_UUID],
            });
            return true;
        } catch (error) {
            console.error("Error scanning for devices:", error);
            return false;
        }
    };

    initializeBLE = async () => {
        // Connect to the GATT (Generic Attribute Profile) server on the device
        this.server = await this.device.gatt.connect();
        this.server.addEventListener(
            "gattserverdisconnected",
            this.onDisconnect,
        );

        // Access the UART service using its UUID
        this.uartService = await this.server.getPrimaryService(SERVICE_UUID);

        // Get the characteristics for transmitting and receiving data
        this.txCharacteristic = await this.uartService.getCharacteristic(
            TX_CHAR_UUID,
        );
        this.rxCharacteristic = await this.uartService.getCharacteristic(
            RX_CHAR_UUID,
        );

        // Set up a listener for data received through rxCharacteristic
        this.rxCharacteristic.addEventListener(
            "characteristicvaluechanged",
            this.onReceive,
        );
        await this.rxCharacteristic.startNotifications();
        console.log("Notifications enabled for rxCharacteristic");
        this.connected = true;
    };

    // Usage in connect:
    connect = async () => {
        return await this.retryOperation(
            async () => {
                await this.initializeBLE();

                // Initial request for info about the device
                await this.requestInfo();

                // Enable device notifications
                await this.enableDeviceNotifications();
            },
            3,
            1000,
        ); // Retry up to 3 times with a delay of 1 second between retries
    };

    // Method to disconnect from the Bluetooth device
    disconnect = async () => {
        try {
            // Check if the device is connected and disconnect if true
            if (this.device && this.device.gatt.connected) {
                this.device.gatt.disconnect();
                this.connected = false;
                console.log("Disconnected");
            }
            clearInterval(this.cleanupInterval); // Stop the cleanup interval when disconnected
        } catch (error) {
            console.error("Error disconnecting from the device:", error);
        }
    };

    /*
    ===============
    RECEIVE
    ===============
    */

    // Method to set a callback for received data
    onReceive = (event) => {
        let dataArray = Buffer.from(event.target.value.buffer);

        // Check if the message ends with the delimiter (0x02)
        if (dataArray[dataArray.length - 1] !== 0x02) {
            console.error("Received incomplete message:", dataArray);
            return;
        }

        // Decode message using COBS
        const data = cobsDecode(dataArray);

        try {
            // Deserialize the received data
            const message = messages.deserialize(data);
            console.log("Received:", message);
            if (
                this.pendingResponse &&
                message.ID === this.pendingResponse.id
            ) {
                this.pendingResponse.resolve(message);
            }
        } catch (error) {
            console.error("Error deserializing message:", error);
        }
    };

    // Method to set a callback for received data
    setOnReceive = (callback) => {
        this.callback = callback;
    };

    /*
    ===============
    SEND
    ===============
    */

    // Method to send data to the device through txCharacteristic
    write = async (data) => {
        this.ensureInitialized();
        return await this.retryOperation(
            async () => {
                const dataToSend = Buffer.from(data, "utf-8");
                await this.txCharacteristic.writeValue(dataToSend.buffer);
            },
            3,
            500,
        ); // Retry up to 3 times with a delay of 500ms between retries
    };

    // Serialize and send a message to the hub
    sendMessage = async (message) => {
        this.ensureInitialized();
        return await this.retryOperation(
            async () => {
                console.log("Sending:", message);
                const payload = Buffer.from(message.serialize());
                const frame = Buffer.from(cobsEncode(payload));

                // Use the max_packet_size from the info response if available
                const packetSize = this.infoResponse
                    ? this.infoResponse.max_packet_size
                    : frame.length;

                // Send the frame in packets of packetSize
                for (let i = 0; i < frame.length; i += packetSize) {
                    const packet = frame.slice(i, i + packetSize);
                    await this.txCharacteristic.writeValue(packet.buffer);
                }
            },
            3,
            500,
        ); // Retry up to 3 times with a delay of 500ms between retries
    };

    // Send a message and wait for the appropriate response
    sendRequest = (message, ResponseType) => {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                if (this.pendingResponses.has(ResponseType.ID)) {
                    this.pendingResponses.delete(ResponseType.ID);
                    reject(
                        new Error(
                            `Timeout waiting for response type: ${ResponseType.ID}`,
                        ),
                    );
                }
            }, 5000); // Set a 5-second timeout

            this.pendingResponses.set(ResponseType.ID, {
                resolve: (response) => {
                    clearTimeout(timeoutId);
                    resolve(response);
                },
                reject: (error) => {
                    clearTimeout(timeoutId);
                    reject(error);
                },
            });

            this.sendMessage(message).catch((error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    };

    /*
    ===============
    SPIKE MESSAGES
    ===============
    */

    // Request information about the device
    requestInfo = async () => {
        const infoRequest = new messages.InfoRequest();
        this.infoResponse = await this.sendRequest(
            infoRequest,
            messages.InfoResponse,
        );
    };

    // Enable device notifications
    enableDeviceNotifications = async () => {
        const notificationRequest = new messages.DeviceNotificationRequest(
            DEVICE_NOTIFICATION_INTERVAL_MS,
        );
        const response = await this.sendRequest(
            notificationRequest,
            messages.DeviceNotificationResponse,
        );
        if (!response.success) {
            throw new Error("Failed to enable notifications");
        }
    };

    // Upload program file to the hub, start the upload, and transfer the rest in chunks
    uploadProgramFile = async (fileName, slot, program) => {
        // Start file upload request
        const programCrc = crc(program);
        const startFileUploadResponse = await this.sendRequest(
            new messages.StartFileUploadRequest(fileName, slot, programCrc),
            messages.StartFileUploadResponse,
        );
        if (!startFileUploadResponse.success) {
            throw new Error("Failed to start file upload");
        }

        // Transfer the program in chunks
        let runningCrc = 0;
        for (
            let i = 0;
            i < program.length;
            i += this.infoResponse.max_chunk_size
        ) {
            const chunk = program.slice(
                i,
                i + this.infoResponse.max_chunk_size,
            );
            runningCrc = crc(chunk, runningCrc);
            const chunkResponse = await this.sendRequest(
                new messages.TransferChunkRequest(runningCrc, chunk),
                messages.TransferChunkResponse,
            );
            if (!chunkResponse.success) {
                throw new Error(`Failed to transfer chunk ${i}`);
            }
        }
    };

    // Start the program in the specified slot
    startProgram = async (slot) => {
        const startProgramResponse = await this.sendRequest(
            new messages.ProgramFlowRequest(false, slot),
            messages.ProgramFlowResponse,
        );
        if (!startProgramResponse.success) {
            throw new Error("Failed to start program");
        }
    };

    // Stop the program in the specified slot
    stopProgram = async (slot) => {
        const stopProgramResponse = await this.sendRequest(
            new messages.ProgramFlowRequest(true, slot),
            messages.ProgramFlowResponse,
        );
        if (!stopProgramResponse.success) {
            throw new Error("Failed to stop program");
        }
    };
}

// Factory function to create a new BLE instance
export function newSpikeBLE() {
    return new SpikeBLE();
}

// Example usage
(async () => {
    const ble = newSpikeBLE();
    const success = await ble.ask("");
    if (success) {
        await ble.connect();

        // Clear the program in the example slot
        const clearResponse = await ble.sendRequest(
            new messages.ClearSlotRequest(EXAMPLE_SLOT),
            messages.ClearSlotResponse,
        );
        if (!clearResponse.success) {
            console.warn(
                "ClearSlotRequest was not acknowledged. Proceeding anyway...",
            );
        }

        // Upload and transfer the example program
        await ble.uploadProgramFile(
            "program.py",
            EXAMPLE_SLOT,
            EXAMPLE_PROGRAM,
        );

        // Start the program in the specified slot
        await ble.startProgram(EXAMPLE_SLOT);
    }
})();
