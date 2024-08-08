from fastapi import FastAPI, HTTPException
import app

app = FastAPI()

@app.get('/')
async def index():
    return "hello world"

@app.get('/ble-connect')
async def bleConnect():
    return "connecting to BLE"

@app.get('/run-code')
async def runCode():
    return "uploading file now"