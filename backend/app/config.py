import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Database configuration - Supabase PostgreSQL
    DATABASE_URL = os.getenv('DATABASE_URL')

    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL environment variable is required. Please set your Supabase connection string.")

    # PostgreSQL URLs (they use postgres:// but SQLAlchemy needs postgresql://)
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)

    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # PostgreSQL connection settings
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_timeout': 20,
        'pool_recycle': -1,
        'pool_pre_ping': True
    }

    # File upload configuration
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

    # Supabase Storage configuration
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SUPABASE_SERVICE_ROLE = os.getenv('SUPABASE_SERVICE_ROLE')
    SUPABASE_BUCKET = 'dogs'
    SUPABASE_FOLDER = 'dog_photos'

    if not SUPABASE_URL or not SUPABASE_KEY or not SUPABASE_SERVICE_ROLE:
        raise ValueError("SUPABASE_URL, SUPABASE_KEY, and SUPABASE_SERVICE_ROLE environment variables are required")

    # JWT Configuration
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')
    if not JWT_SECRET_KEY:
        raise ValueError("JWT_SECRET_KEY environment variable is required")
    
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)  # Tokens expire after 1 hour
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)  # Refresh tokens expire after 30 days

    # Production settings
    ENV = os.getenv('FLASK_ENV' )
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
