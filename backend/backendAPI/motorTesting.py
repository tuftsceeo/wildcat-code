import runloop
import time
import port
import motor
print("Console message from hub.")
async def main():
    while True:
        motor.run(port.C, 1000)
        time.sleep_ms(1000)
        motor.stop(port.C)
        time.sleep_ms(1000)
runloop.run(main())