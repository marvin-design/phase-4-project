from flask import Blueprint, request, jsonify, url_for, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from app.models import Dog, Activity, MedicalReport
from app import db

api = Blueprint('api', __name__)

def allowed_file(filename):
    """Check if the file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    })

# ====================== DOG ROUTES ======================

@api.route('/dogs', methods=['GET'])
def get_dogs():
    """Get all dogs with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    dogs = Dog.query.order_by(Dog.created_at.desc()).paginate(
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
def get_dog(dog_id):
    """Get a single dog by ID"""
    dog = Dog.query.get_or_404(dog_id)
    return jsonify(dog.to_dict())

@api.route('/dogs', methods=['POST'])
def add_dog():
    """Add a new dog"""
    # Authentication
    if request.headers.get('X-API-PASSWORD') != current_app.config['API_PASSWORD']:
        return jsonify({"error": "Invalid password"}), 401
    
   
    if not request.form.get('name') or not request.form.get('breed'):
        return jsonify({"error": "Name and breed are required"}), 400
    
    
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            os.makedirs(current_app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            image_url = url_for('static', filename=f'dog_images/{filename}', _external=True)
    
  
    dog = Dog(
        name=request.form['name'],
        breed=request.form['breed'],
        image_url=image_url
    )
    db.session.add(dog)
    db.session.commit()
    
    return jsonify(dog.to_dict()), 201

@api.route('/dogs/<int:dog_id>', methods=['DELETE'])
def delete_dog(dog_id):
    """Delete a dog"""
    if request.headers.get('X-API-PASSWORD') != current_app.config['API_PASSWORD']:
        return jsonify({"error": "Invalid password"}), 401
        
    dog = Dog.query.get_or_404(dog_id)
    db.session.delete(dog)
    db.session.commit()
    return jsonify({"message": "Dog deleted successfully"})


@api.route('/dogs/<int:dog_id>/activities', methods=['GET'])
def get_activities(dog_id):
    """Get all activities for a dog"""
    dog = Dog.query.get_or_404(dog_id)
    return jsonify([activity.to_dict() for activity in dog.activities])

@api.route('/dogs/<int:dog_id>/activities', methods=['POST'])
def add_activity(dog_id):
    """Add an activity for a dog"""
    dog = Dog.query.get_or_404(dog_id)
    data = request.get_json()
    
    if not data or not data.get('type') or not data.get('description') or not data.get('date'):
        return jsonify({"error": "Type, description and date are required"}), 400
    
    try:
        activity_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    activity = Activity(
        dog_id=dog.id,
        type=data['type'],
        description=data['description'],
        date=activity_date
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify(activity.to_dict()), 201

# ====================== MEDICAL REPORT ROUTES ======================

@api.route('/dogs/<int:dog_id>/medical-reports', methods=['GET'])
def get_medical_reports(dog_id):
    """Get all medical reports for a dog"""
    dog = Dog.query.get_or_404(dog_id)
    return jsonify([report.to_dict() for report in dog.medical_reports])

@api.route('/dogs/<int:dog_id>/medical-reports', methods=['POST'])
def add_medical_report(dog_id):
    """Add a medical report for a dog"""
    dog = Dog.query.get_or_404(dog_id)
    data = request.get_json()
    
    if not data or not data.get('type') or not data.get('details') or not data.get('date'):
        return jsonify({"error": "Type, details and date are required"}), 400
    
    try:
        report_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    report = MedicalReport(
        dog_id=dog.id,
        type=data['type'],
        details=data['details'],
        date=report_date
    )
    db.session.add(report)
    db.session.commit()
    
    return jsonify(report.to_dict()), 201


@api.errorhandler(404)
def not_found_error(error):
    return jsonify({"error": "Resource not found"}), 404

@api.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({"error": "Internal server error"}), 500