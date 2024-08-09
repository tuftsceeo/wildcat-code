from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Get the absolute path to the _tests directory
tests_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../backend/backendAPI/'))

# Add the _tests directory to sys.path
sys.path.append(tests_dir)

# Now you can import your module
import app  # replace with the actual module name
from app import main, file_upload


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

@app.get("/")
async def root():
    return {"message": "Hello, World!"}

@app.post("/ble-connect")
async def ble_connect():
    await main()
    return {"message": "Bluetooth connected"}

@app.post("/run-code")
async def run_code(request: Request):
    data = await request.json()
    py_code = data.get("pyCode")
    # Process the py_code, e.g., save to a file or execute it
    await file_upload()
    return {"message": "Code received", "pyCode": py_code}