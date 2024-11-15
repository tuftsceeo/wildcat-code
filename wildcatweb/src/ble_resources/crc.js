// From https://github.com/LEGO/spike-prime-docs/blob/main/examples/python/crc.py
// with ChatGPT 4o

// Importing the crc-32 library
import { buf } from "crc-32";

/*
 * Calculate the CRC32 of data with an optional seed and alignment.
 *
data - The data to calculate the CRC for.
seed - The optional seed value for CRC.
align - The alignment requirement (e.g., 4 bytes).
returns number - The CRC-32 value of the data.
 */

function crc(data, seed = 0, align = 4) {
    // Ensure the data is aligned by adding padding if necessary
    const remainder = data.length % align;
    if (remainder !== 0) {
        const paddingLength = align - remainder;
        const paddedData = new Uint8Array(data.length + paddingLength);
        paddedData.set(data);
        // The additional bytes are already initialized to 0 by default
        data = paddedData;
    }

    // Calculate the CRC32 checksum using the library
    let crcValue = buf(data, seed);

    // The crc-32 library returns a signed value,
    // convert it to an unsigned 32-bit integer.
    return crcValue >>> 0;
}

export { crc };

// Example usage
/**
const data = new Uint8Array([0x11, 0x22, 0x33]);
const crcValue = crc(data);
console.log(`CRC-32 value: ${crcValue.toString(16)}`);
**/
