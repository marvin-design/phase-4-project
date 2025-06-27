from flask import Flask, jsonify
from flask_cors import CORS
from extensions import db, migrate
from auth import init_auth_routes, token_required
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)  # Enable CORS for frontend communication

# Initialize database and migrations
db.init_app(app)
migrate.init_app(app, db)

# Initialize authentication routes
init_auth_routes(app)

# Import models AFTER db initialization to avoid circular imports
from models import Owner, Dog, Activity, User

# Basic API Routes
@app.route('/')
def home():
    return jsonify({'message': 'Dog Care Tracker API', 'status': 'running'})

@app.route('/api/status')
def status():
    return jsonify({
        'database': 'connected' if db.session.execute('SELECT 1').first() else 'disconnected',
        'tables': ['users', 'owners', 'dogs', 'activities']
    })

# Protected Example Route
@app.route('/api/protected')
@token_required
def protected_route(current_user):
    return jsonify({
        'message': f'Authenticated as {current_user.username}',
        'user_id': current_user.id
    })

# Main Application Context
if __name__ == '__main__':
    with app.app_context():
        # This ensures tables are created if they don't exist
        db.create_all()
        
        # Optional: Create first admin user if none exists
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin')
            admin.set_password('admin123')
            db.session.add(admin)
            db.session.commit()
            print("Created default admin user")
    
    # Run the application
    app.run(port=5555, debug=True)