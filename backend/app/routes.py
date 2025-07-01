from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import uuid
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import Dog, Activity, MedicalReport, User
from app import db, supabase

api = Blueprint('api', __name__)

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def upload_to_supabase_storage(file, filename):
    """Upload file to Supabase Storage and return the public URL"""
    try:
        if supabase is None:
            # Using current_app.logger which is the standard Flask logger
            current_app.logger.error("Supabase client is not initialized")
            return None
            
        bucket_name = current_app.config['SUPABASE_BUCKET']
        folder_name = current_app.config['SUPABASE_FOLDER']
        
        file_path = f"{folder_name}/{filename}"
        
        file_content = file.read()
        file.seek(0)
        
        file_extension = filename.rsplit('.', 1)[1].lower()
        content_type_map = {
            'png': 'image/png', 'jpg': 'image/jpeg', 
            'jpeg': 'image/jpeg', 'gif': 'image/gif'
        }
        content_type = content_type_map.get(file_extension, 'image/jpeg')
        
        result = supabase.storage.from_(bucket_name).upload(
            file_path, file_content, {"content-type": content_type}
        )
        
        if result:
            return supabase.storage.from_(bucket_name).get_public_url(file_path)
        return None
            
    except Exception as e:
        current_app.logger.error(f"Supabase upload error: {e}")
        return None

def delete_from_supabase_storage(file_url):
    """Delete file from Supabase Storage using the file URL"""
    try:
        if not file_url or 'supabase' not in file_url:
            return False
            
        bucket_name = current_app.config['SUPABASE_BUCKET']
        
        # Extract file path from URL
        # URL format: https://project.supabase.co/storage/v1/object/public/bucket/path
        url_parts = file_url.split(f"/{bucket_name}/")
        if len(url_parts) > 1:
            file_path = url_parts[1]
            result = supabase.storage.from_(bucket_name).remove([file_path])
            return result is not None
        
        return False
        
    except Exception as e:
        current_app.logger.error(f"Supabase delete error: {e}")
        return False

@api.route('/')
def home():
    return """
    <h1>Dog Management System API</h1>
    <p>Available endpoints:</p>
    <ul>
        <li><a href='/api/health'>/api/health</a> - Service health</li>
        <li><a href='/api/dogs'>/api/dogs</a> - Dog management</li>
    </ul>
    """


@api.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    })


# ====================== AUTHENTICATION ROUTES ======================

@api.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Basic email validation
        if '@' not in email or len(email) < 5:
            return jsonify({'error': 'Please enter a valid email address'}), 400
        
        # Password validation
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        # Create new user
        user = User(email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed'}), 500


@api.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        
        # Validate input
        if not data or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email and password are required'}), 400
        
        email = data['email'].lower().strip()
        password = data['password']
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        # Verify user exists and password is correct
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create JWT token with string identity
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Login error: {e}")
        return jsonify({'error': 'Login failed'}), 500


@api.route('/dogs', methods=['GET'])
@jwt_required()
def get_dogs():
    """Get all dogs for the current user with pagination"""
    current_user_id = get_jwt_identity()
    
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    dogs = Dog.query.filter_by(user_id=current_user_id).order_by(Dog.created_at.desc()).paginate(
        page=page, 
        per_page=per_page,
        error_out=False
    )
    
    return jsonify({
        'dogs': [dog.to_dict() for dog in dogs.items],
        'total': dogs.total,
        'pages': dogs.pages,
        'current_page': dogs.page
    })

@api.route('/dogs/<int:dog_id>', methods=['GET'])
@jwt_required()
def get_dog(dog_id):
    """Get a single dog by ID, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
    return jsonify(dog.to_dict())

@api.route('/dogs', methods=['POST'])
@jwt_required()
def add_dog():
    """Add a new dog for the current user"""
    try:
        current_user_id = get_jwt_identity()
        
        if not request.form.get('name') or not request.form.get('breed'):
            return jsonify({"error": "Name and breed are required"}), 400
        
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                unique_id = str(uuid.uuid4())
                filename = f"{unique_id}_{secure_filename(file.filename)}"
                
                image_url = upload_to_supabase_storage(file, filename)
                
                if not image_url:
                    return jsonify({"error": "Failed to upload image"}), 500
        
        dog = Dog(
            name=request.form['name'],
            breed=request.form['breed'],
            image_url=image_url,
            user_id=current_user_id  # Set the owner
        )
        
        db.session.add(dog)
        db.session.commit()
        
        return jsonify(dog.to_dict()), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error in add_dog: {e}")
        return jsonify({"error": "Internal server error"}), 500

@api.route('/dogs/<int:dog_id>', methods=['DELETE'])
@jwt_required()
def delete_dog(dog_id):
    """Delete a dog, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
        
    if dog.image_url:
        delete_from_supabase_storage(dog.image_url)
    
    db.session.delete(dog)
    db.session.commit()
    return jsonify({"message": "Dog deleted successfully"})


@api.route('/dogs/<int:dog_id>/activities', methods=['GET'])
@jwt_required()
def get_activities(dog_id):
    """Get all activities for a dog, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
    return jsonify([activity.to_dict() for activity in dog.activities])

@api.route('/dogs/<int:dog_id>/activities', methods=['POST'])
@jwt_required()
def add_activity(dog_id):
    """Add an activity for a dog, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
    
    data = request.get_json()
    
    if not data or not data.get('type') or not data.get('description') or not data.get('date'):
        return jsonify({"error": "Type, description and date are required"}), 400
    
    try:
        activity_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        activity = Activity(
            dog_id=dog_id,
            type=data['type'],
            description=data['description'],
            date=activity_date
        )
        db.session.add(activity)
        db.session.commit()
        return jsonify(activity.to_dict()), 201
    except ValueError:
        return jsonify({"error": "Invalid date format, should be YYYY-MM-DD"}), 400

# ====================== MEDICAL REPORT ROUTES ======================

@api.route('/dogs/<int:dog_id>/medical-reports', methods=['GET'])
@jwt_required()
def get_medical_reports(dog_id):
    """Get all medical reports for a dog, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
    return jsonify([report.to_dict() for report in dog.medical_reports])

@api.route('/dogs/<int:dog_id>/medical-reports', methods=['POST'])
@jwt_required()
def add_medical_report(dog_id):
    """Add a medical report for a dog, ensuring it belongs to the current user"""
    current_user_id = get_jwt_identity()
    dog = Dog.query.filter_by(id=dog_id, user_id=current_user_id).first_or_404()
    
    data = request.get_json()
    
    if not data or not data.get('type') or not data.get('details') or not data.get('date'):
        return jsonify({"error": "Type, details and date are required"}), 400
    
    try:
        report_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        
        report = MedicalReport(
            dog_id=dog_id,
            type=data['type'],
            details=data['details'],
            date=report_date
        )
        db.session.add(report)
        db.session.commit()
        return jsonify(report.to_dict()), 201
    except ValueError:
        return jsonify({"error": "Invalid date format, should be YYYY-MM-DD"}), 400


@api.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@api.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500