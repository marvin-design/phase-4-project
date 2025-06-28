from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from app.models import Dog, Activity, MedicalReport
from app import db

api = Blueprint('api', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@api.route('/dogs', methods=['GET'])
def get_dogs():
    dogs = Dog.query.all()
    return jsonify([{
        'id': dog.id,
        'name': dog.name,
        'breed': dog.breed,
        'image': dog.image_url,
        'activities': [{
            'id': a.id,
            'type': a.type,
            'description': a.description,
            'date': a.date.isoformat(),
            'timestamp': a.timestamp.isoformat()
        } for a in dog.activities],
        'medicalReports': [{
            'id': m.id,
            'type': m.type,
            'details': m.details,
            'date': m.date.isoformat(),
            'timestamp': m.timestamp.isoformat()
        } for m in dog.medical_reports]
    } for dog in dogs])

@api.route('/dogs', methods=['POST'])
def add_dog():
    if request.headers.get('X-API-PASSWORD') != current_app.config['API_PASSWORD']:
        return jsonify({'error': 'Invalid password'}), 401
        
    data = request.form
    name = data.get('name')
    breed = data.get('breed')
    
    if not name or not breed:
        return jsonify({'error': 'Name and breed are required'}), 400
    
    image_url = None
    if 'image' in request.files:
        file = request.files['image']
        if file and allowed_file(file.filename):
            filename = secure_filename(f"{datetime.now().timestamp()}_{file.filename}")
            file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))
            image_url = f"/static/dog_images/{filename}"
    
    dog = Dog(name=name, breed=breed, image_url=image_url)
    db.session.add(dog)
    db.session.commit()
    
    return jsonify({
        'id': dog.id,
        'name': dog.name,
        'breed': dog.breed,
        'image': dog.image_url,
        'activities': [],
        'medicalReports': []
    }), 201

@api.route('/dogs/<int:dog_id>', methods=['DELETE'])
def delete_dog(dog_id):
    if request.headers.get('X-API-PASSWORD') != current_app.config['API_PASSWORD']:
        return jsonify({'error': 'Invalid password'}), 401
        
    dog = Dog.query.get_or_404(dog_id)
    db.session.delete(dog)
    db.session.commit()
    return jsonify({'message': 'Dog deleted'})

@api.route('/dogs/<int:dog_id>/activities', methods=['POST'])
def add_activity(dog_id):
    dog = Dog.query.get_or_404(dog_id)
    data = request.json
    
    activity = Activity(
        dog_id=dog.id,
        type=data['type'],
        description=data['description'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    )
    db.session.add(activity)
    db.session.commit()
    
    return jsonify({
        'id': activity.id,
        'type': activity.type,
        'description': activity.description,
        'date': activity.date.isoformat(),
        'timestamp': activity.timestamp.isoformat()
    }), 201

@api.route('/dogs/<int:dog_id>/medical-reports', methods=['POST'])
def add_medical_report(dog_id):
    dog = Dog.query.get_or_404(dog_id)
    data = request.json
    
    report = MedicalReport(
        dog_id=dog.id,
        type=data['type'],
        details=data['details'],
        date=datetime.strptime(data['date'], '%Y-%m-%d').date()
    )
    db.session.add(report)
    db.session.commit()
    
    return jsonify({
        'id': report.id,
        'type': report.type,
        'details': report.details,
        'date': report.date.isoformat(),
        'timestamp': report.timestamp.isoformat()
    }), 201