## Bare bones debugging file for FastAPI

from fastapi import FastAPI, HTTPException
from app import file_upload, main as spikeBLE

app = FastAPI()

@app.get('/')
async def index():
    return "hello world"

@app.get('/ble-connect')
async def bleConnect():
    await spikeBLE()

@app.get('/run-code')
async def runCode():
    await file_upload()
