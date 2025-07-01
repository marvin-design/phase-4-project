from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from supabase import create_client, Client
import logging
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
supabase: Client = None

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(config_class)
    
    # Initialize Supabase client
    global supabase
    
    try:
        # Use service role key for storage operations (bypasses RLS)
        supabase = create_client(app.config['SUPABASE_URL'], app.config['SUPABASE_SERVICE_ROLE'])
    except Exception as e:
        app.logger.error(f"Failed to create Supabase client: {e}")
        supabase = None
    
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    # Root route for health checks
    @app.route('/')
    def root():
        return {"status": "healthy", "message": "Dog Management System API is running"}
    
    return app