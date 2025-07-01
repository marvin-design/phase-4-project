from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_class=Config):
    app = Flask(__name__, static_folder='../static')
    app.config.from_object(config_class)
    
   
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    
    from app.routes import api
    app.register_blueprint(api, url_prefix='/api')
    
    # Root route for health checks
    @app.route('/')
    def root():
        return {"status": "healthy", "message": "Dog Management System API is running"}
    
    return app