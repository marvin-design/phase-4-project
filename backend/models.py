from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

dog_activity = db.Table('dog_activity',
    db.Column('dog_id', db.Integer, db.ForeignKey('dogs.id'), primary_key=True),
    db.Column('activity_id', db.Integer, db.ForeignKey('activities.id'), primary_key=True),
    db.Column('duration', db.Integer, nullable=False)
)

class Owner(db.Model):
    __tablename__ = 'owners'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    dogs = db.relationship('Dog', backref='owner', cascade='all, delete')

class Dog(db.Model):
    __tablename__ = 'dogs'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    breed = db.Column(db.String(80))
    age = db.Column(db.Integer)
    owner_id = db.Column(db.Integer, db.ForeignKey('owners.id'))
    activities = db.relationship(
        'Activity',
        secondary=dog_activity,
        back_populates='dogs'
    )

class Activity(db.Model):
    __tablename__ = 'activities'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    dogs = db.relationship(
        'Dog',
        secondary=dog_activity,
        back_populates='activities'
    )