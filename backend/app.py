from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from models import db, Owner, Dog, Activity, dog_activity
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
db.init_app(app)
migrate = Migrate(app, db)

# Helper function
def json_response(model, schema):
    return {field: getattr(model, field) for field in schema}

# Owners CRUD
@app.route('/owners', methods=['GET', 'POST'])
def handle_owners():
    if request.method == 'GET':
        owners = Owner.query.all()
        return jsonify([json_response(o, ['id', 'name']) for o in owners])
    elif request.method == 'POST':
        data = request.json
        owner = Owner(name=data['name'])
        db.session.add(owner)
        db.session.commit()
        return jsonify(json_response(owner, ['id', 'name'])), 201

# Dogs CRUD
@app.route('/dogs', methods=['GET', 'POST'])
def handle_dogs():
    if request.method == 'GET':
        dogs = Dog.query.all()
        return jsonify([json_response(d, ['id', 'name', 'breed', 'age', 'owner_id']) for d in dogs])
    elif request.method == 'POST':
        data = request.json
        dog = Dog(
            name=data['name'],
            breed=data['breed'],
            age=data['age'],
            owner_id=data['owner_id']
        )
        db.session.add(dog)
        db.session.commit()
        return jsonify(json_response(dog, ['id', 'name', 'breed', 'age', 'owner_id'])), 201

# Activities CRUD
@app.route('/activities', methods=['GET', 'POST'])
def handle_activities():
    if request.method == 'GET':
        activities = Activity.query.all()
        return jsonify([json_response(a, ['id', 'name', 'description']) for a in activities])
    elif request.method == 'POST':
        data = request.json
        activity = Activity(
            name=data['name'],
            description=data['description']
        )
        db.session.add(activity)
        db.session.commit()
        return jsonify(json_response(activity, ['id', 'name', 'description'])), 201

# Many-to-many relationship
@app.route('/dogs/<int:dog_id>/activities/<int:activity_id>', methods=['POST'])
def assign_activity(dog_id, activity_id):
    data = request.json
    stmt = dog_activity.insert().values(
        dog_id=dog_id,
        activity_id=activity_id,
        duration=data['duration']
    )
    db.session.execute(stmt)
    db.session.commit()
    
    return jsonify({'message': 'Activity assigned to dog'}), 201
from flask_migrate import Migrate
migrate = Migrate(app, db)  

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(port=5555, debug=True)