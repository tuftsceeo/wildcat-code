"""
Example implementation of the Consistent Overhead Byte Stuffing (COBS) algorithm
used by the SPIKE™ Prime BLE protocol.

This implementation prioritizes readability and simplicity over performance and
should be used for educational purposes only.
"""

DELIMITER = 0x02
"""Delimiter used to mark end of frame"""

NO_DELIMITER = 0xFF
"""Code word indicating no delimiter in block"""

COBS_CODE_OFFSET = DELIMITER
"""Offset added to code word"""

MAX_BLOCK_SIZE = 84
"""Maximum block size (incl. code word)"""

XOR = 3
"""XOR mask for encoding"""


def encode(data: bytes):
    """
    Encode data using COBS algorithm, such that no delimiters are present.
    """
    buffer = bytearray()

    # Step 1: Start a new block
    code_index = block = 0
    def begin_block():
        """Append code word to buffer and update code_index and block"""
        nonlocal code_index, block
        # 1.1: Set the index for the incomplete code word
        code_index = len(buffer)  # index of incomplete code word
        # 1.2: Append a placeholder for the code word, updated later
        buffer.append(NO_DELIMITER)
        # 1.3: Set initial block size to 1 (includes code word itself)
        block = 1

    # Step 2: Begin the first block
    begin_block()

    # Step 3: Iterate over the data bytes
    for byte in data:
        if byte > DELIMITER:
            # 3.1: If byte is not a delimiter, add to buffer
            buffer.append(byte)
            block += 1

        if byte <= DELIMITER or block > MAX_BLOCK_SIZE:
            # Step 4: Complete the current block
            if byte <= DELIMITER:
                # 4.1: Update code word for a block ending with delimiter
                delimiter_base = byte * MAX_BLOCK_SIZE
                block_offset = block + COBS_CODE_OFFSET
                buffer[code_index] = delimiter_base + block_offset
            # Step 5: Start a new block
            begin_block()

    # Step 6: Update final code word
    buffer[code_index] = block + COBS_CODE_OFFSET

    return buffer


def decode(data: bytes):
    """
    Decode data using COBS algorithm.
    """
    buffer = bytearray()

    # Step 1: Define function to unescape code word and determine block properties
    def unescape(code: int):
        if code == 0xFF:
            # 1.1: If code is 0xFF, no delimiter in block; return None and block size
            return None, MAX_BLOCK_SIZE + 1
        value, block = divmod(code - COBS_CODE_OFFSET, MAX_BLOCK_SIZE)
        if block == 0:
            # 1.2: If block ends at maximum size, adjust value and block size
            block = MAX_BLOCK_SIZE
            value -= 1
        return value, block

    # Step 2: Unescape the first code word
    value, block = unescape(data[0])

    # Step 3: Iterate over data bytes to decode them
    for byte in data[1:]:
        block -= 1
        if block > 0:
            # 3.1: Append non-delimiter bytes to the buffer
            buffer.append(byte)
            continue

        # Step 4: Handle completed block
        if value is not None:
            # 4.1: Append the value (escaped delimiter) to the buffer
            buffer.append(value)

        # Step 5: Unescape the next code word
        value, block = unescape(byte)

    return buffer


def pack(data: bytes):
    """
    Encode and frame data for transmission.
    """
    # Step 1: COBS encode the data
    buffer = encode(data)
    print("ENCODED:", buffer)

    # Step 2: XOR buffer to remove problematic control characters
    for i in range(len(buffer)):
        buffer[i] ^= XOR

    # Step 3: Add delimiter to the end
    buffer.append(DELIMITER)
    print("PACKED:", buffer)
    return bytes(buffer)


def unpack(frame: bytes):
    """
    Unframe and decode frame.
    """
    # Step 1: Determine if priority byte exists and adjust start index
    start = 0
    if frame[0] == 0x01:
        start += 1

    # Step 2: XOR each byte of the unframed data to restore original data
    unframed = bytes(map(lambda x: x ^ XOR, frame[start:-1]))
    print("Unframed Data Received:", memoryview(unframed).tolist())
    # Step 3: Decode the COBS-encoded data
    return bytes(decode(unframed))
