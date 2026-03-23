from fastapi import APIRouter, HTTPException, status
from pydantic import ValidationError
import logging
from models import ContactMessage, ContactMessageResponse, ApiResponse
from database import create_contact_message, get_all_messages, delete_all_messages

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/contact",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a contact message",
    description="Submit a new contact form message that will be stored in the database"
)
async def submit_contact(contact: ContactMessage):
    """
    Submit a new contact message
    
    - **name**: Sender's name (2-100 characters)
    - **email**: Sender's valid email address
    - **message**: Message content (10-5000 characters)
    
    Returns created message with ID and timestamp
    """
    try:
        # Validate input (Pydantic handles this automatically)
        logger.info(f"📨 New contact submission from {contact.name}")
        
        # Create message in database
        result = await create_contact_message(
            name=contact.name,
            email=contact.email,
            message=contact.message
        )
        
        return ApiResponse(
            success=True,
            message="Message submitted successfully",
            data=result
        )
    
    except ValidationError as e:
        logger.error(f"❌ Validation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid input: {str(e)}"
        )
    
    except Exception as e:
        logger.error(f"❌ Error submitting contact: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit message. Please try again later."
        )

@router.get(
    "/messages",
    response_model=dict,
    summary="Get all contact messages",
    description="Retrieve all submitted contact messages (admin only - add auth in production)"
)
async def get_messages():
    """
    Retrieve all contact messages
    
    Returns a list of messages sorted by creation date (newest first)
    
    **Note**: In production, this should be protected with authentication
    """
    try:
        logger.info("📨 Fetching all messages")
        messages = await get_all_messages()
        
        return {
            "success": True,
            "count": len(messages),
            "data": messages
        }
    
    except Exception as e:
        logger.error(f"❌ Error retrieving messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages"
        )

@router.delete(
    "/messages",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete all contact messages",
    description="Delete all submitted contact messages (admin only - add auth in production)"
)
async def clear_messages():
    """
    Delete all contact messages
    
    **Warning**: This action cannot be undone!
    
    **Note**: In production, this should be protected with authentication
    """
    try:
        logger.warning("🗑️ Attempting to delete all messages")
        result = await delete_all_messages()
        
        return ApiResponse(
            success=True,
            message="All messages deleted successfully",
            data=result
        )
    
    except Exception as e:
        logger.error(f"❌ Error deleting messages: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete messages"
        )
