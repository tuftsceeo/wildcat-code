// From https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/messages.py
// with ChatGPT 4o
// It includes utility functions for serializing and deserializing messages,
// similar to how Python struct and inheritance are used in the original version.

//const { Buffer } = require("buffer");
import { Buffer } from "buffer";

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

    constructor(text) {
        super();
        this.text = text;
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
        return new ConsoleNotification(textBytes.toString("utf8"));
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
class DeviceNotification extends BaseMessage {
    static get ID() {
        return 0x3c;
    }

    constructor(size, payload) {
        super();
        this.size = size;
        this.payload = payload;
        this.messages = [];
        this._parsePayload();
    }

    _parsePayload() {
        let data = Buffer.from(this.payload);
        while (data.length > 0) {
            const id = data.readUInt8(0);
            if (id in DEVICE_MESSAGE_MAP) {
                const [name, fmt] = DEVICE_MESSAGE_MAP[id];
                const values = this._unpackData(fmt, data);
                this.messages.push({ name, values });
                data = data.slice(this._calculateSize(fmt));
            } else {
                console.warn(`Unknown message ID: ${id}`);
                break;
            }
        }
    }

    _calculateSize(fmt) {
        // Calculate the size based on the format string, using Buffer equivalent methods
        let size = 0;
        for (const char of fmt) {
            if (char === "B") size += 1; // Unsigned byte
            else if (char === "H") size += 2; // Unsigned short
            else if (char === "b") size += 1; // Signed byte
            else if (char === "h") size += 2; // Signed short
            else if (char === "i") size += 4; // Signed int
        }
        return size;
    }

    _unpackData(fmt, data) {
        const values = [];
        let offset = 1; // Start after the ID byte

        for (const char of fmt) {
            if (char === "B") {
                values.push(data.readUInt8(offset));
                offset += 1;
            } else if (char === "H") {
                values.push(data.readUInt16LE(offset));
                offset += 2;
            } else if (char === "b") {
                values.push(data.readInt8(offset));
                offset += 1;
            } else if (char === "h") {
                values.push(data.readInt16LE(offset));
                offset += 2;
            } else if (char === "i") {
                values.push(data.readInt32LE(offset));
                offset += 4;
            }
        }

        return values;
    }

    static deserialize(data) {
        if (data.length < 3) {
            throw new Error(
                `Invalid message length: expected at least 3, got ${data.length}`,
            );
        }
        const buffer = Buffer.from(data);
        const size = buffer.readUInt16LE(1);
        const payload = buffer.slice(3);
        return new DeviceNotification(size, payload);
    }
}

// Mapping for known device messages
const DEVICE_MESSAGE_MAP = {
    0x00: ["Battery", "<BB"],
    0x01: ["IMU", "<BBBhhhhhhhhh"],
    0x02: ["5x5", "<B25B"],
    0x0a: ["Motor", "<BBBhhbi"],
    0x0b: ["Force", "<BBBB"],
    0x0c: ["Color", "<BBbHHH"],
    0x0d: ["Distance", "<BBh"],
    0x0e: ["3x3", "<BB9B"],
};

const KNOWN_MESSAGES = {
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

// Example usage
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
