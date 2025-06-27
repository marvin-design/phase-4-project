from flask import request, jsonify
import jwt
import datetime
from functools import wraps
from extensions import db
from models import User

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token missing!'}), 401
            
        try:
            from app import app  # Local import to avoid circularity
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except Exception as e:
            return jsonify({'message': 'Invalid token!', 'error': str(e)}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

def init_auth_routes(app):
    @app.route('/login', methods=['POST'])
    def login():
        auth = request.json
        if not auth or not auth.get('username') or not auth.get('password'):
            return jsonify({'message': 'Credentials required'}), 400
            
        user = User.query.filter_by(username=auth['username']).first()
        if not user or not user.check_password(auth['password']):
            return jsonify({'message': 'Invalid credentials'}), 401
            
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({'token': token})

    @app.route('/register', methods=['POST'])
    def register():
        data = request.json
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username exists'}), 400
            
        user = User(username=data['username'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        
        return jsonify({'message': 'User created'}), 201