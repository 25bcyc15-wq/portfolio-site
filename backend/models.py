from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class ContactMessage(BaseModel):
    """Contact form submission model"""
    name: str = Field(..., min_length=2, max_length=100, description="Sender's name")
    email: EmailStr = Field(..., description="Sender's email address")
    message: str = Field(..., min_length=10, max_length=5000, description="Message content")

class ContactMessageResponse(ContactMessage):
    """Contact message response with metadata"""
    id: str = Field(..., description="Unique message ID")
    created_at: datetime = Field(..., description="Timestamp when message was created")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "John Doe",
                "email": "john@example.com",
                "message": "Great portfolio! I'd like to connect.",
                "created_at": "2024-01-15T10:30:00Z"
            }
        }

class ApiResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    environment: str
    database: str
