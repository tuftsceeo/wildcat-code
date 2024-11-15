// From https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/cobs.py
// with ChatGPT 4o

const DELIMITER = 0x02; // Delimiter used to mark end of frame
const MAX_BLOCK_SIZE = 84; // Maximum block size (including code word)
const XOR = 3; // XOR mask for encoding

function cobsEncode(data) {
    const buffer = [];
    let codeIndex = 0; // Index where the code word will be updated later
    let block = 0; // Number of bytes in the current block (including code word)

    function beginBlock() {
        // Append a placeholder for the code word and update `codeIndex` and `block`
        codeIndex = buffer.length;
        buffer.push(0); // Initially set to 0, updated later with correct value
        block = 1; // Reset block size (includes the code word itself)
    }

    beginBlock();

    for (let byte of data) {
        if (byte === 0 || byte === 1 || byte === 2) {
            // Close current block if a delimiter is found and update code word
            buffer[codeIndex] =
                block + (byte === 0 ? 3 : byte === 1 ? 87 : 171);
            beginBlock();
        } else {
            // Non-delimiter value, add to buffer
            buffer.push(byte);
            block++;
            if (block === MAX_BLOCK_SIZE + 1) {
                // If block size reaches the maximum, close the block
                buffer[codeIndex] = 255; // 255 represents the maximum block size (84 bytes)
                beginBlock();
            }
        }
    }

    // Update the final code word for the last block
    buffer[codeIndex] = block;

    return new Uint8Array(buffer);
}

function cobsDecode(data) {
    const buffer = [];
    let index = 0;

    while (index < data.length) {
        const code = data[index++];
        let blockSize = 0;
        let delimiter = null;

        // Determine block size and delimiter based on the code value
        if (code >= 3 && code <= 86) {
            blockSize = code - 3;
            delimiter = 0;
        } else if (code >= 87 && code <= 170) {
            blockSize = code - 87;
            delimiter = 1;
        } else if (code >= 171 && code <= 254) {
            blockSize = code - 171;
            delimiter = 2;
        } else if (code === 255) {
            blockSize = MAX_BLOCK_SIZE;
        }

        // Check if there are enough bytes remaining for the block
        if (blockSize > 0) {
            if (index + blockSize > data.length) {
                throw new Error("COBS decode error - data ends unexpectedly");
            }
            // Add bytes from the current block to the output buffer
            for (let i = 0; i < blockSize; i++) {
                buffer.push(data[index++]);
            }
        }

        // If there is a delimiter, add it to the buffer
        if (delimiter !== null) {
            buffer.push(delimiter);
        }
    }

    return new Uint8Array(buffer);
}

function pack(data) {
    let buffer = cobsEncode(data);

    // XOR buffer to remove problematic control characters (0x03)
    buffer = buffer.map((byte) => byte ^ XOR);

    // Optionally prefix with 0x01 for high-priority messages
    const prefix = []; // Use [0x01] if high-priority is needed

    // Add delimiter (0x02) at the end
    const packedBuffer = new Uint8Array(prefix.length + buffer.length + 1);
    packedBuffer.set(prefix); // Add the prefix (if any)
    packedBuffer.set(buffer, prefix.length); // Add the encoded data
    packedBuffer[prefix.length + buffer.length] = DELIMITER; // Add the delimiter at the end

    return packedBuffer;
}

function unpack(frame) {
    let start = 0;

    // Handle the priority byte, if present (0x01)
    if (frame[0] === 0x01) {
        start += 1; // Skip the priority byte for high-priority messages
    }

    // Slice the frame from the start (after priority byte if present) until the end, excluding the trailing delimiter (0x02)
    const frameWithoutDelimiters = frame.slice(start, -1);

    // XOR each byte in the frame to reverse the XOR operation applied during packing
    const unframed = frameWithoutDelimiters.map((byte) => byte ^ XOR);

    // Decode the unframed data using COBS
    return cobsDecode(unframed);
}
