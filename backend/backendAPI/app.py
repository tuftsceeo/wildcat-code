"""
This is a simple example script showing how to

    * Connect to a SPIKE™ Prime hub over BLE
    * Subscribe to device notifications
    * Transfer and start a new program

The script is heavily simplified and not suitable for production use.

----------------------------------------------------------------------

After prompting for confirmation to continue, the script will simply connect to
the first device it finds advertising the SPIKE™ Prime service UUID, and proceed
with the following steps:

    1. Request information about the device (e.g. max chunk size for file transfers)
    2. Subscribe to device notifications (e.g. state of IMU, display, sensors, motors, etc.)
    3. Clear the program in a specific slot
    4. Request transfer of a new program file to the slot
    5. Transfer the program in chunks
    6. Start the program

If the script detects an unexpected response, it will print an error message and exit.
Otherwise it will continue to run until the connection is lost or stopped by the user.
(You can stop the script by pressing Ctrl+C in the terminal.)

While the script is running, it will print information about the messages it sends and receives.
"""

import sys
from typing import cast, TypeVar #, Dict

TMessage = TypeVar("TMessage", bound="BaseMessage")

import cobs
from messages import *
from crc import crc

import asyncio
from bleak import BleakClient, BleakScanner
from bleak.backends.characteristic import BleakGATTCharacteristic
from bleak.backends.device import BLEDevice
from bleak.backends.scanner import AdvertisementData



SCAN_TIMEOUT = 10.0
"""How long to scan for devices before giving up (in seconds)"""

SERVICE = "0000fd02-0000-1000-8000-00805f9b34fb"
"""The SPIKE™ Prime BLE service UUID"""

RX_CHAR = "0000fd02-0001-1000-8000-00805f9b34fb"
"""The UUID the hub will receive data on"""

TX_CHAR = "0000fd02-0002-1000-8000-00805f9b34fb"
"""The UUID the hub will transmit data on"""

DEVICE_NOTIFICATION_INTERVAL_MS = 5000
"""The interval in milliseconds between device notifications"""

EXAMPLE_SLOT = 0
"""The slot to upload the example program to"""

EXAMPLE_PROGRAM = """import runloop
import time
from hub import port
import motor
print("Console message from hub.")
async def main():
    while True:
        motor.run(port.C, 1000)
        time.sleep(1)
        motor.stop(port.C)
        time.sleep(1)
runloop.run(main())""".encode(
    "utf8"
)
"""The utf8-encoded example program to upload to the hub"""

print("Example Program: ", memoryview(EXAMPLE_PROGRAM).tolist())

answer = input(
    f"This example will override the program in slot {EXAMPLE_SLOT} of the first hub found. Do you want to continue? [Y/n] "
)
if answer.strip().lower().startswith("n"):
    print("Aborted by user.")
    sys.exit(0)

stop_event = asyncio.Event()

UPLOAD_BOOL = False
py_code = ""
'''******added below section to setup user-controlled file uploading*******'''
async def user_confirmation():
    UPLOAD_BOOL = True
    return UPLOAD_BOOL
    # This function uses asyncio to wait for user input asynchronously
    # await asyncio.get_event_loop().run_in_executor(None, input, "Press Enter to start file upload...")

# Global Variables
info_response: InfoResponse = None
pending_response: tuple[int, asyncio.Future] = (-1, asyncio.Future())
rx_char = None
tx_char = None
client: BleakClient = None

# Function Definitions

def match_service_uuid(device: BLEDevice, adv: AdvertisementData) -> bool:
    """Matches the service UUID for the BLE device."""
    return SERVICE.lower() in adv.service_uuids

def on_disconnect(_: BleakClient) -> None:
    """Handles device disconnection."""
    print("Connection lost.")
    stop_event.set()

def on_data(_: BleakGATTCharacteristic, data: bytearray) -> None:
    """Callback for when data is received from the hub."""
    if data[-1] != 0x02:
        # packet is not a complete message
        # for simplicity, this example does not implement buffering
        # and is therefore unable to handle fragmented messages
        un_xor = bytes(map(lambda x: x ^ 3, data))  # un-XOR for debugging
        print(f"Received incomplete message:\n {un_xor}")
        return
    print("Packed Data Received:", memoryview(data).tolist())
    data = cobs.unpack(data)
    try:
        print("Unpacked Data Received:", data)
        message = deserialize(data)
        print(f"Deserialized Data Received: {message}")
        if message.ID == pending_response[0]:
            pending_response[1].set_result(message)
        if isinstance(message, DeviceNotification):
            # sort and print the messages in the notification
            updates = list(message.messages)
            updates.sort(key=lambda x: x[1])
            lines = [f" - {x[0]:<10}: {x[1]}" for x in updates]
            print("\n".join(lines))

    except ValueError as e:
        print(f"Error: {e}")

async def send_message(message: BaseMessage) -> None:
    global client
    """Serializes and sends a message to the hub."""
    print(f"Sending: {message}")
    payload = message.serialize()
    
    print("PAYLOAD:", memoryview(payload).tolist())
    frame = cobs.pack(payload)


    # use the max_packet_size from the info response if available
    # otherwise, assume the frame is small enough to send in one packet
    packet_size = info_response.max_packet_size if info_response else len(frame)

    # send the frame in packets of packet_size
    for i in range(0, len(frame), packet_size):
        packet = frame[i : i + packet_size]
        print("MESSAGE PACKET:", memoryview(packet).tolist())
        await client.write_gatt_char(rx_char, packet, response=False)

async def send_request(message: BaseMessage, response_type: type[TMessage]) -> TMessage:
    """Sends a message and waits for a specific type of response."""
    global pending_response
    pending_response = (response_type.ID, asyncio.Future())
    await send_message(message)
    return await pending_response[1]

async def file_upload():
    """Handles the file upload process to the hub."""

    # clear the program in the example slot
    clear_response = await send_request(ClearSlotRequest(EXAMPLE_SLOT), ClearSlotResponse)
    if not clear_response.success:
        print(
            "ClearSlotRequest was not acknowledged. This could mean the slot was already empty, proceeding..."
        )

    # start a new file upload
    program_crc = crc(EXAMPLE_PROGRAM)
    start_upload_response = await send_request(
        StartFileUploadRequest("program.py", EXAMPLE_SLOT, program_crc),
        StartFileUploadResponse,
    )
    if not start_upload_response.success:
        print("Error: start file upload was not acknowledged")
        sys.exit(1)

    # transfer the program in chunks
    running_crc = 0
    for i in range(0, len(EXAMPLE_PROGRAM), info_response.max_chunk_size):
        chunk = EXAMPLE_PROGRAM[i : i + info_response.max_chunk_size]
        running_crc = crc(chunk, running_crc)
        print("Chunk ", i,": ", memoryview(chunk).tolist())
        print("running_crc", running_crc)
        chunk_response = await send_request(
            TransferChunkRequest(running_crc, chunk), TransferChunkResponse
        )
        if not chunk_response.success:
            print(f"Error: failed to transfer chunk {i}")
            sys.exit(1)

    # start the program
    start_program_response = await send_request(
        ProgramFlowRequest(stop=False, slot=EXAMPLE_SLOT), ProgramFlowResponse
    )
    if not start_program_response.success:
        print("Error: failed to start program")
        sys.exit(1)

async def main():
    global client, rx_char, tx_char, info_response
    print(f"\nScanning for {SCAN_TIMEOUT} seconds, please wait...")
    device = await BleakScanner.find_device_by_filter(
        filterfunc=match_service_uuid, timeout=SCAN_TIMEOUT
    )

    if device is None:
        print(
            "No hubs detected. Ensure that a hub is within range, turned on, and awaiting connection."
        )
        sys.exit(1)

    device = cast(BLEDevice, device)
    print(f"Hub detected! {device}")

    print("Connecting...")
    client = BleakClient(device, disconnected_callback=on_disconnect)  # Assign client globally
    async with client:
        print("Connected!\n")

        service = client.services.get_service(SERVICE)
        rx_char = service.get_characteristic(RX_CHAR)
        tx_char = service.get_characteristic(TX_CHAR)

        await client.start_notify(tx_char, on_data)

        info_response = await send_request(InfoRequest(), InfoResponse)

        notification_response = await send_request(
            DeviceNotificationRequest(DEVICE_NOTIFICATION_INTERVAL_MS),
            DeviceNotificationResponse,
        )
        if not notification_response.success:
            print("Error: failed to enable notifications")
            sys.exit(1)

        await file_upload() # Test File upload
        await stop_event.wait()
        print("COMPLETED APP MAIN")


""" MAY NEED TO RUN THIS ONCE as __main__ DIRECTLY TO be prompted for Bluetooth permissions for Python"""

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Interrupted by user.")
        stop_event.set()

