from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Owner, Dog, ActivityLog
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
migrate = Migrate(app, db)

@app.route('/')
def home():
    return "Dog Care Tracker API"

# Dogs endpoints
@app.route('/dogs', methods=['GET'])
def get_dogs():
    dogs = Dog.query.all()
    return jsonify([{
        'id': dog.id,
        'name': dog.name,
        'breed': dog.breed,
        'age': dog.age,
        'owner': dog.owner.name
    } for dog in dogs])

@app.route('/dogs', methods=['POST'])
def add_dog():
    data = request.json
    owner = Owner.query.filter_by(name=data['owner_name']).first()
    if not owner:
        owner = Owner(name=data['owner_name'])
        db.session.add(owner)
    
    dog = Dog(
        name=data['name'],
        breed=data['breed'],
        age=data['age'],
        owner=owner
    )
    db.session.add(dog)
    db.session.commit()
    
    return jsonify({
        'id': dog.id,
        'name': dog.name,
        'breed': dog.breed,
        'age': dog.age,
        'owner': dog.owner.name
    }), 201

if __name__ == '__main__':
    app.run(port=5555, debug=True)