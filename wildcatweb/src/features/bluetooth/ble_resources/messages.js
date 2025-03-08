/**
 * messages.js
 * Adapted from https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/
 * Adaption assisted by ChatGPT 4o
 *
 * This module provides classes and utilities for constructing, serializing, and deserializing messages
 * used in the communication with LEGO Spike Prime devices. Each message corresponds to a specific type of request
 * or response, such as device info requests, program flow control, and notifications.
 *
 * Key Features:
 * - Message classes like `InfoRequest`, `InfoResponse`, `DeviceNotification`, etc.
 * - Methods for serializing messages into byte arrays and deserializing byte arrays back into message instances.
 * - Parsing utility for device notifications using buffer layouts.
 *
 * Dependencies:
 * - `buffer` for managing byte arrays.
 * - `buffer-layout` for defining structured message layouts.
 *
 * Author:  J.Cross Tufts CEEO
 */

//const { Buffer } = require("buffer");
import { Buffer } from "buffer";
import { struct, u8, u16, s16, seq, s8, s32 } from "buffer-layout";

class BaseMessage {
    static get ID() {
        throw new Error("ID must be defined in subclasses");
    }

    serialize() {
        throw new Error("serialize method must be implemented in subclasses");
    }

    static deserialize(data) {
        throw new Error("deserialize method must be implemented in subclasses");
    }
}

// Request to retrieve information about the device
class InfoRequest extends BaseMessage {
    static get ID() {
        return 0x00;
    }

    serialize() {
        return Buffer.from([InfoRequest.ID]);
    }
}

// Response containing information about the device
class InfoResponse extends BaseMessage {
    static get ID() {
        return 0x01;
    }

    constructor(
        rpcMajor,
        rpcMinor,
        rpcBuild,
        firmwareMajor,
        firmwareMinor,
        firmwareBuild,
        maxPacketSize,
        maxMessageSize,
        maxChunkSize,
        productGroupDevice,
    ) {
        super();
        this.id = InfoResponse.ID;
        this.rpcMajor = rpcMajor;
        this.rpcMinor = rpcMinor;
        this.rpcBuild = rpcBuild;
        this.firmwareMajor = firmwareMajor;
        this.firmwareMinor = firmwareMinor;
        this.firmwareBuild = firmwareBuild;
        this.maxPacketSize = maxPacketSize;
        this.maxMessageSize = maxMessageSize;
        this.maxChunkSize = maxChunkSize;
        this.productGroupDevice = productGroupDevice;
    }

    static deserialize(data) {
        if (data.length < 17) {
            throw new Error(
                `Invalid message length: expected at least 17, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new InfoResponse(
            buffer.readUInt8(1),
            buffer.readUInt8(2),
            buffer.readUInt16LE(3),
            buffer.readUInt8(5),
            buffer.readUInt8(6),
            buffer.readUInt16LE(7),
            buffer.readUInt16LE(9),
            buffer.readUInt16LE(11),
            buffer.readUInt16LE(13),
            buffer.readUInt16LE(15),
        );
    }
}

// Request to clear a specific slot
class ClearSlotRequest extends BaseMessage {
    static get ID() {
        return 0x46;
    }

    constructor(slot) {
        super();
        this.slot = slot;
    }

    serialize() {
        return Buffer.from([ClearSlotRequest.ID, this.slot]);
    }
}

// Response for clearing a specific slot
class ClearSlotResponse extends BaseMessage {
    static get ID() {
        return 0x47;
    }

    constructor(success) {
        super();
        this.id = ClearSlotResponse.ID;
        this.success = success;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new ClearSlotResponse(buffer.readUInt8(1) === 0x00);
    }
}

// Request to start uploading a file
class StartFileUploadRequest extends BaseMessage {
    static get ID() {
        return 0x0c;
    }

    constructor(fileName, slot, crc) {
        super();
        this.fileName = fileName;
        this.slot = slot;
        this.crc = crc;
    }

    serialize() {
        const encodedName = Buffer.from(this.fileName, "utf8");
        if (encodedName.length > 31) {
            throw new Error(
                "UTF-8 encoded file name too long: " +
                    (encodedName.length + 1) +
                    " >= 32",
            );
        }
        const buffer = Buffer.alloc(2 + encodedName.length + 1 + 4);
        buffer.writeUInt8(StartFileUploadRequest.ID, 0);
        encodedName.copy(buffer, 1);
        buffer.writeUInt8(0x00, 1 + encodedName.length); // null-terminator
        buffer.writeUInt8(this.slot, 2 + encodedName.length);
        buffer.writeUInt32LE(this.crc, 3 + encodedName.length);
        return buffer;
    }
}

// Response for starting a file upload
class StartFileUploadResponse extends BaseMessage {
    static get ID() {
        return 0x0d;
    }

    constructor(success) {
        super();
        this.id = StartFileUploadResponse.ID;
        this.success = success;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new StartFileUploadResponse(buffer.readUInt8(1) === 0x00);
    }
}

// Request to transfer a chunk of data
class TransferChunkRequest extends BaseMessage {
    static get ID() {
        return 0x10;
    }

    constructor(runningCrc, chunk) {
        super();
        this.runningCrc = runningCrc;
        this.size = chunk.length;
        this.payload = chunk;
    }

    serialize() {
        const buffer = Buffer.alloc(7 + this.size);
        buffer.writeUInt8(TransferChunkRequest.ID, 0);
        buffer.writeUInt32LE(this.runningCrc, 1);
        buffer.writeUInt16LE(this.size, 5);
        Buffer.from(this.payload).copy(buffer, 7);
        return buffer;
    }
}

// Response for transferring a chunk of data
class TransferChunkResponse extends BaseMessage {
    static get ID() {
        return 0x11;
    }

    constructor(success) {
        super();
        this.id = TransferChunkResponse.ID;
        this.success = success;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new TransferChunkResponse(buffer.readUInt8(1) === 0x00);
    }
}

// Request to control program flow (start/stop)
class ProgramFlowRequest extends BaseMessage {
    static get ID() {
        return 0x1e;
    }

    constructor(stop, slot) {
        super();
        this.stop = stop;
        this.slot = slot;
    }

    serialize() {
        return Buffer.from([
            ProgramFlowRequest.ID,
            this.stop ? 1 : 0,
            this.slot,
        ]);
    }
}

// Response for controlling program flow
class ProgramFlowResponse extends BaseMessage {
    static get ID() {
        return 0x1f;
    }

    constructor(success) {
        super();
        this.id = ProgramFlowResponse.ID;
        this.success = success;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new ProgramFlowResponse(buffer.readUInt8(1) === 0x00);
    }
}

// Notification for program flow status
class ProgramFlowNotification extends BaseMessage {
    static get ID() {
        return 0x20;
    }

    constructor(stop) {
        super();
        this.id = ProgramFlowNotification.ID;
        this.stop = stop;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new ProgramFlowNotification(buffer.readUInt8(1) === 1);
    }
}

// Notification for console messages
class ConsoleNotification extends BaseMessage {
    static get ID() {
        return 0x21;
    }

    constructor(raw, text) {
        super();
        this.text = text;
        this.raw = raw;
        this.id = ConsoleNotification.ID;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const textBytes = Buffer.from(data.slice(1)).filter(
            (byte) => byte !== 0,
        );
        return new ConsoleNotification(textBytes, textBytes.toString("utf8"));
    }
}

// Request for device notifications
class DeviceNotificationRequest extends BaseMessage {
    static get ID() {
        return 0x28;
    }

    constructor(intervalMs) {
        super();
        this.intervalMs = intervalMs;
    }

    serialize() {
        const buffer = Buffer.alloc(3);
        buffer.writeUInt8(DeviceNotificationRequest.ID, 0);
        buffer.writeUInt16LE(this.intervalMs, 1);
        return buffer;
    }
}

// Response for device notifications
class DeviceNotificationResponse extends BaseMessage {
    static get ID() {
        return 0x29;
    }

    constructor(success) {
        super();
        this.id = DeviceNotificationResponse.ID;
        this.success = success;
    }

    static deserialize(data) {
        if (data.length < 2) {
            throw new Error(
                `Invalid message length: expected at least 2, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        return new DeviceNotificationResponse(buffer.readUInt8(1) === 0x00);
    }
}

// Notification for device updates

// Mapping for known device messages
const DEVICE_MESSAGE_MAP = {
    0x00: ["Battery", struct([u8("batteryLevel")])],
    0x01: [
        "IMU",
        struct([
            u8("faceUp"), // Hub Face pointing up
            u8("yawFace"), // Hub Face configured as yaw face
            s16("yaw"), // Yaw value
            s16("pitch"), // Pitch value
            s16("roll"), // Roll value
            s16("accelX"), // Accelerometer reading in X
            s16("accelY"), // Accelerometer reading in Y
            s16("accelZ"), // Accelerometer reading in Z
            s16("gyroX"), // Gyroscope reading in X
            s16("gyroY"), // Gyroscope reading in Y
            s16("gyroZ"), // Gyroscope reading in Z
        ]),
    ],
    0x02: ["5x5", struct([seq(u8(), 25, "pixels")])],
    0x0a: [
        "Motor",
        struct([
            u8("port"), // Hub Port the motor is connected to
            u8("deviceType"), // Motor Device Type
            s16("absolutePos"), // Absolute position in degrees
            s16("power"), // Power applied to the motor
            s8("speed"), // Speed of the motor
            s32("position"), // Position of the motor
        ]),
    ],
    0x0b: [
        "Force",
        struct([
            u8("port"), // Hub Port the force sensor is connected to
            u8("measuredValue"), // Measured value in range 0-100
            u8("pressureDetected"), // 0x01 if pressure is detected, else 0x00
        ]),
    ],
    0x0c: [
        "Color",
        struct([
            u8("port"), // Hub Port the color sensor is connected to
            s8("color"), // Color detected by the sensor
            u16("rawRed"), // Raw red value
            u16("rawGreen"), // Raw green value
            u16("rawBlue"), // Raw blue value
        ]),
    ],
    0x0d: [
        "Distance",
        struct([
            u8("port"), // Hub Port the distance sensor is connected to
            s16("distance"), // Measured distance in millimeters
        ]),
    ],
    0x0e: [
        "3x3",
        struct([
            u8("port"), // Hub Port the color matrix is connected to
            seq(u8(), 9, "pixels"), // Displayed pixel values
        ]),
    ],
};

// Define the DeviceNotification class
// Define the DeviceNotification class
class DeviceNotification {
    static get ID() {
        return 0x3c;
    }

    constructor(size, payload) {
        this.id = DeviceNotification.ID; // Assign the ID
        this.size = size;
        this.payload = payload;
        this.messages = [];
        this.parsePayload();
    }

    parsePayload() {
        let data = Buffer.from(this.payload);
        let offset = 0;

        while (offset < data.length) {
            const id = data.readUInt8(offset);
            offset += 1;

            if (id in DEVICE_MESSAGE_MAP) {
                const [name, structLayout] = DEVICE_MESSAGE_MAP[id];
                const size = structLayout.span;

                if (data.length - offset < size) {
                    console.warn(
                        `Insufficient data for message ID: ${id}, Required: ${size}, Available: ${
                            data.length - offset
                        }`
                    );
                    break;
                }

                try {
                    const messageData = data.slice(offset, offset + size);
                    const values = structLayout.decode(messageData);
                    
                    // Add the name to the values object
                    values.deviceName = name;
                    
                    this.messages.push({ name, values });
                    console.log(`${name} : `, values);

                } catch (e) {
                    console.error(`Failed to parse message ID: ${id}`, e);
                    break;
                }

                offset += size;
            } else {
                console.warn(`Unknown message ID: ${id} at offset ${offset - 1}`);
                break;
            }
        }
    }

    // Static method to deserialize data into a DeviceNotification instance
    static deserialize(data) {
        if (data.length < 3) {
            throw new Error(
                `Invalid message length: expected at least 3, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        const size = buffer.readUInt16LE(1);
        const payload = buffer.slice(3);
        /* console.log("Deserializing DeviceNotification with size:", size); */
        return new DeviceNotification(size, payload);
    }

    toString() {
        const updated = this.messages.map((msg) => msg.name);
        return `${this.constructor.name}(${updated})`;
    }
}

const KNOWN_MESSAGES = {
    [InfoRequest.ID]: InfoRequest,
    [InfoResponse.ID]: InfoResponse,
    [ClearSlotRequest.ID]: ClearSlotRequest,
    [ClearSlotResponse.ID]: ClearSlotResponse,
    [StartFileUploadRequest.ID]: StartFileUploadRequest,
    [StartFileUploadResponse.ID]: StartFileUploadResponse,
    [TransferChunkRequest.ID]: TransferChunkRequest,
    [TransferChunkResponse.ID]: TransferChunkResponse,
    [ProgramFlowRequest.ID]: ProgramFlowRequest,
    [ProgramFlowResponse.ID]: ProgramFlowResponse,
    [ProgramFlowNotification.ID]: ProgramFlowNotification,
    [ConsoleNotification.ID]: ConsoleNotification,
    [DeviceNotificationRequest.ID]: DeviceNotificationRequest,
    [DeviceNotificationResponse.ID]: DeviceNotificationResponse,
    [DeviceNotification.ID]: DeviceNotification,
};
// Function to deserialize incoming data
function deserialize(data) {
    const messageType = data[0];
    //console.log("Deserializing message with type:", messageType);
    if (messageType in KNOWN_MESSAGES) {
        return KNOWN_MESSAGES[messageType].deserialize(data);
    }
    throw new Error(
        "Unknown message: " +
            Array.from(data)
                .map((b) => b.toString(16))
                .join(" "),
    );
}

export {
    BaseMessage,
    InfoRequest,
    InfoResponse,
    ClearSlotRequest,
    ClearSlotResponse,
    StartFileUploadRequest,
    StartFileUploadResponse,
    TransferChunkRequest,
    TransferChunkResponse,
    ProgramFlowRequest,
    ProgramFlowResponse,
    ProgramFlowNotification,
    ConsoleNotification,
    DeviceNotificationRequest,
    DeviceNotificationResponse,
    DeviceNotification,
    deserialize,
};

// Example usage
/*
try {
    const request = new StartFileUploadRequest("test.txt", 1, 12345);
    const serialized = request.serialize();
    console.log("Serialized StartFileUploadRequest:", serialized);

    const response = new StartFileUploadResponse(true);
    const deserialized = StartFileUploadResponse.deserialize(
        response.serialize(),
    );
    console.log("Deserialized StartFileUploadResponse:", deserialized);
} catch (e) {
    console.error(e);
}
*/
