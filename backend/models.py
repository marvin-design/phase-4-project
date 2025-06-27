from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Owner(db.Model):
    __tablename__ = 'owners'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True, nullable=False)
    dogs = db.relationship('Dog', backref='owner', cascade='all, delete')

class Dog(db.Model):
    __tablename__ = 'dogs'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    breed = db.Column(db.String)
    age = db.Column(db.Integer)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'))
    activities = db.relationship('ActivityLog', backref='dog', cascade='all, delete')

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    id = db.Column(db.Integer, primary_key=True)
    activity_type = db.Column(db.String, nullable=False)
    notes = db.Column(db.String)
    timestamp = db.Column(db.DateTime, server_default=db.func.now())
    dog_id = db.Column(db.Integer, db.ForeignKey('dogs.id'))