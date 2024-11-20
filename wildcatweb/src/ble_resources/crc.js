/*
 * crc.js
 * Adapted from https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/
 * Adaption assisted by ChatGPT 4o
 *
 * This module provides utility functions for calculating Cyclic Redundancy Check (CRC) checksums.
 * It is used to ensure the integrity of messages when they are sent to and received from devices.
 *
 * Key Features:
 * - `crc(data)` calculates the CRC value of the provided byte sequence.
 *
 * Usage:
 * Used primarily to validate data integrity during Bluetooth communication with LEGO Spike Prime devices.
 *
 * Author: Author:  J.Cross Tufts CEEO
 */

// Importing the crc-32 library
import { buf } from "crc-32";
/*
buf in crc-32
In all cases, the relevant function takes an argument 
representing data and an optional second argument 
representing the starting "seed" (for rolling CRC).
The return value is a signed 32-bit integer.
CRC32.buf(byte array or buffer[, seed]) assumes 
the argument is a sequence of 8-bit unsigned integers 
(nodejs Buffer, Uint8Array or array of bytes).
*/


import { Buffer } from "buffer"; // Import Buffer for consistency in handling binary data

/*
 * Calculate the CRC32 of data with an optional seed and alignment.
 *
 * data - The data to calculate the CRC for.
 * seed - The optional seed value for CRC.
 * align - The alignment requirement (e.g., 4 bytes).
 * returns number - The CRC-32 value of the data.
 */

function crc(data, seed = 0, align = 4) {
    // Convert the data into a Buffer if it's not already a Buffer
    if (!(data instanceof Buffer)) {
        data = Buffer.from(data);
    }

    // Ensure the data is aligned by adding padding if necessary
    const remainder = data.length % align;
    if (remainder !== 0) {
        const paddingLength = align - remainder;
        const paddedData = Buffer.alloc(data.length + paddingLength);
        data.copy(paddedData); // Copy data into the paddedData buffer at position 0
        // The additional bytes (at the end) are already initialized to 0 by default
        data = paddedData;
    }
    console.log("Padded Data: ", data)
    // Calculate the CRC32 checksum using the library
    let crcValue = buf(data, seed);
    console.log("CRC Result: ", crcValue)
    // The crc-32 library return value is a signed 32-bit integer.,
    // convert it to an unsigned 32-bit integer.
    
    return crcValue >>> 0;
}

export { crc };


