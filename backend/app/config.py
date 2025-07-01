import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Database configuration - Supabase PostgreSQL
    DATABASE_URL = os.getenv('DATABASE_URL')

    if not DATABASE_URL:
        raise ValueError(
            "DATABASE_URL environment variable is required. Please set your Supabase connection string.")

    # Postgres URLs (they use postgres:// but SQLAlchemy needs postgresql://)
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

    UPLOAD_FOLDER = os.path.join(os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))), 'static/dog_images')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    API_PASSWORD = os.getenv('API_PASSWORD', 'dog123')

    # Production settings
    ENV = os.getenv('FLASK_ENV' )
    DEBUG = os.getenv('FLASK_DEBUG', 'True').lower() in ['true', '1', 'yes']
