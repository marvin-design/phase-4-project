# backend/app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///dogs.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../static/dog_images')
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    API_PASSWORD = os.getenv('API_PASSWORD', 'dog123')