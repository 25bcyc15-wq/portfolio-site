import os
from supabase import create_client, Client
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global Supabase client
supabase_client: Client = None

def init_supabase() -> Client:
    """Initialize Supabase client"""
    global supabase_client
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_KEY")
    
    if not supabase_url or not supabase_key:
        logger.warning("Supabase credentials not configured. Some features will be unavailable.")
        logger.info("To enable Supabase, set SUPABASE_URL and SUPABASE_KEY in .env")
        return None
    
    try:
        supabase_client = create_client(supabase_url, supabase_key)
        logger.info("✅ Supabase client initialized")
        return supabase_client
    except Exception as e:
        logger.error(f"❌ Failed to initialize Supabase: {e}")
        return None

def get_supabase() -> Client:
    """Get Supabase client"""
    if supabase_client is None:
        init_supabase()
    return supabase_client

async def create_contact_message(name: str, email: str, message: str) -> dict:
    """
    Create a new contact message in Supabase
    
    Args:
        name: Sender's name
        email: Sender's email
        message: Message content
    
    Returns:
        Created message data
    
    Raises:
        Exception: If database operation fails
    """
    try:
        client = get_supabase()
        
        if client is None:
            raise Exception("Supabase not configured")
        
        # Insert into contacts table
        response = client.table("contacts").insert({
            "name": name,
            "email": email,
            "message": message,
            "created_at": datetime.utcnow().isoformat()
        }).execute()
        
        logger.info(f"✅ Contact message created from {name} ({email})")
        return response.data[0] if response.data else {"success": True}
    
    except Exception as e:
        logger.error(f"❌ Error creating contact message: {e}")
        raise

async def get_all_messages() -> list:
    """
    Retrieve all contact messages from Supabase
    
    Returns:
        List of contact messages (most recent first)
    """
    try:
        client = get_supabase()
        
        if client is None:
            return []
        
        response = client.table("contacts").select("*").order("created_at", desc=True).execute()
        logger.info(f"✅ Retrieved {len(response.data)} messages")
        return response.data
    
    except Exception as e:
        logger.error(f"❌ Error retrieving messages: {e}")
        return []

async def delete_all_messages() -> dict:
    """
    Delete all contact messages from Supabase
    
    Returns:
        Operation status
    """
    try:
        client = get_supabase()
        
        if client is None:
            raise Exception("Supabase not configured")
        
        response = client.table("contacts").delete().neq("id", "").execute()
        logger.info(f"✅ All messages deleted")
        return {"success": True, "message": "All messages deleted"}
    
    except Exception as e:
        logger.error(f"❌ Error deleting messages: {e}")
        raise

# Create tables function for initial setup
async def create_tables():
    """
    Create required tables in Supabase
    (Run this once for initial setup)
    """
    try:
        client = get_supabase()
        
        if client is None:
            raise Exception("Supabase not configured")
        
        # Note: In production, use Supabase SQL editor to create tables
        # This is just a reference for the schema
        logger.info("Tables should be created via Supabase SQL editor")
        logger.info("""
        CREATE TABLE contacts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX idx_contacts_created_at ON contacts(created_at DESC);
        CREATE INDEX idx_contacts_email ON contacts(email);
        """)
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        raise
