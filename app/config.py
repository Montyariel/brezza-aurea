import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://jesasgrhafocsmslxizr.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implc2FzZ3JoYWZvY3Ntc2x4aXpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NDQ5NjQsImV4cCI6MjA5OTUyMDk2NH0.ofSLxuK9HFCv_AmXD8beszwfTA1_al-jAuNbfz5SVTs")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
