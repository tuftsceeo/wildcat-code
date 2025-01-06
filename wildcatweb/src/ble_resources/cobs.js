/**
 * cobs.js
 *
 * Adapted from https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/
 * Adaption assisted by ChatGPT 4o
 *
 * This module implements Consistent Overhead Byte Stuffing (COBS) encoding and decoding.
 * It is used for framing data that contains delimiters, ensuring there are no zero bytes in the payload.
 *
 * Key Features:
 * - `cobsEncode(data)` to encode byte sequences to eliminate zero bytes.
 * - `cobsDecode(data)` to decode the COBS-encoded byte sequences.
 * - `cobsPack(data)` and `cobsUnpack(data)` for adding/removing framing delimiters.
 *
 * Usage:
 * COBS is commonly used to ensure data integrity over communication channels that require a distinct delimiter.
 *
 * Author:  J.Cross Tufts CEEO
 */

const DELIMITER = 0x02; // Delimiter used to mark end of frame
const NO_DELIMITER = 0xff; // Code word indicating no delimiter in block
const COBS_CODE_OFFSET = DELIMITER; // Offset added to code word
const MAX_BLOCK_SIZE = 84; // Maximum block size (including code word)
const XOR = 3; // XOR mask for encoding

export function cobsEncode(data) {
    const buffer = [];

    // Step 1: Start a new block
    let codeIndex = 0;
    let block = 0;

    function beginBlock() {
        // 1.1: Set the index for the incomplete code word
        codeIndex = buffer.length; // Index of the incomplete code word
        // 1.2: Append a placeholder for the code word, updated later
        buffer.push(NO_DELIMITER); // Placeholder for the code word
        // 1.3: Set initial block size to 1 (includes code word itself)
        block = 1; // Block size, including the code word itself
    }

    // Step 2: Begin the first block
    beginBlock();

    // Step 3: Iterate over the data bytes
    for (let byte of data) {
        if (byte > DELIMITER) {
            // 3.1: If byte is not a delimiter, add to buffer
            buffer.push(byte); // Non-delimiter value, write as-is
            block++;
        }

        if (byte <= DELIMITER || block > MAX_BLOCK_SIZE) {
            // Step 4: Complete the current block
            if (byte <= DELIMITER) {
                // 4.1: Update code word for a block ending with delimiter
                const delimiterBase = byte * MAX_BLOCK_SIZE;
                const blockOffset = block + COBS_CODE_OFFSET;
                buffer[codeIndex] = delimiterBase + blockOffset;
            }
            // Step 5: Start a new block
            beginBlock(); // Start a new block
        }
    }

    // Step 6: Update final code word
    buffer[codeIndex] = block + COBS_CODE_OFFSET;

    return new Uint8Array(buffer);
}

export function cobsDecode(data) {
    const buffer = [];

    // Step 1: Define function to unescape code word and determine block properties
    function unescape(code) {
        if (code === 0xff) {
            // 1.1: If code is 0xFF, no delimiter in block; return null and block size
            return { value: null, block: MAX_BLOCK_SIZE + 1 };
        }
        let value = Math.floor((code - COBS_CODE_OFFSET) / MAX_BLOCK_SIZE);
        let block = (code - COBS_CODE_OFFSET) % MAX_BLOCK_SIZE;
        if (block === 0) {
            // 1.2: If block ends at maximum size, adjust value and block size
            block = MAX_BLOCK_SIZE;
            value -= 1;
        }
        return { value, block };
    }

    // Step 2: Unescape the first code word
    let { value, block } = unescape(data[0]);
    let i = 1;

    // Step 3: Iterate over data bytes to decode them
    while (i < data.length) {
        block -= 1;
        if (block > 0) {
            // 3.1: Append non-delimiter bytes to the buffer
            buffer.push(data[i++]);
            continue;
        }

        // Step 4: Handle completed block
        if (value !== null) {
            // 4.1: Append the value (escaped delimiter) to the buffer
            buffer.push(value);
        }

        // Step 5: Unescape the next code word
        ({ value, block } = unescape(data[i++]));
    }

    return new Uint8Array(buffer);
}

export function cobsPack(data) {
    // Step 1: COBS encode the data
    let buffer = cobsEncode(data);
    //console.log("ENCODED:", buffer);

    // Step 2: XOR buffer to remove problematic control characters (0x03)
    for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= XOR;
    }

    // Step 3: Add delimiter (0x02) at the end
    const packedBuffer = new Uint8Array(buffer.length + 1);
    packedBuffer.set(buffer); // Add the encoded data
    packedBuffer[buffer.length] = DELIMITER; // Add the delimiter at the end

    //console.log("PACKED:", packedBuffer);
    return packedBuffer;
}

export function cobsUnpack(data) {
    // Step 1: Determine if priority byte exists and adjust start index
    let start = 0;
    if (data[0] === 0x01) {
        start++;
    }

    // Step 2: Remove delimiter (0x02) at the end and XOR to restore original data
    if (data[data.length - 1] !== DELIMITER) {
        throw new Error("Invalid packet: missing delimiter");
    }
    const unframed = data.slice(start, -1);

    for (let i = 0; i < unframed.length; i++) {
        unframed[i] ^= XOR;
    }

    // Step 3: Decode the COBS-encoded data
    return cobsDecode(unframed);
}
