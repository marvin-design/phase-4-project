from app import db
from datetime import datetime

class Dog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    breed = db.Column(db.String(100), nullable=False)
    image_url = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    activities = db.relationship('Activity', backref='dog', lazy=True, cascade='all, delete-orphan')
    medical_reports = db.relationship('MedicalReport', backref='dog', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'breed': self.breed,
            'image': self.image_url,
            'created_at': self.created_at.isoformat(),
            'activities': [a.to_dict() for a in self.activities],
            'medical_reports': [m.to_dict() for m in self.medical_reports]
        }

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dog_id = db.Column(db.Integer, db.ForeignKey('dog.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'description': self.description,
            'date': self.date.isoformat(),
            'timestamp': self.timestamp.isoformat()
        }

class MedicalReport(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    dog_id = db.Column(db.Integer, db.ForeignKey('dog.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    details = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'details': self.details,
            'date': self.date.isoformat(),
            'timestamp': self.timestamp.isoformat()
        }