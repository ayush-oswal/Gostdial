from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import db
from routers import calls, upload

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(
    title="Voice Agent API",
    description="Backend API for scheduling AI voice calls.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS Configuration
origins = [
    "http://localhost:3000", # Common React port
    "http://localhost:5173", # Common Vite port
    "http://localhost:8000",
    "http://localhost:5555", # Prisma Studio
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(calls.router)
app.include_router(upload.router)

@app.get("/")
async def root():
    return {"message": "Voice Agent API is running", "docs": "/docs"}
