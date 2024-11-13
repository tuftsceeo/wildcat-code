## Bare bones debugging file for FastAPI

#Might need to run with fastapi instead of python>>>> fastapi dev main.py 
#need to install>>> pip install "fastapi[standard]"

#

from fastapi import FastAPI, HTTPException, Requests
from fastapi.middleware.cors import CORSMiddleware
from app import file_upload, main as spikeBLE

app = FastAPI()


origins = [
    "http://localhost:3000",  # React frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows requests from your frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

@app.get('/')
async def index():
    return "hello world"

@app.get('/ble-connect')
async def bleConnect():
    await spikeBLE()

@app.get('/run-code')
async def runCode():
    await file_upload()
