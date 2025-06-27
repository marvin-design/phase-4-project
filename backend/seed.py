from app import app, db
from models import Owner, Dog, Activity

with app.app_context():
    # Clear existing data
    db.drop_all()
    db.create_all()

    # Create owners
    alice = Owner(name="Alice")
    bob = Owner(name="Bob")

    # Create dogs
    buddy = Dog(name="Buddy", breed="Golden", age=3, owner=alice)
    max = Dog(name="Max", breed="Lab", age=2, owner=bob)

    # Create activities
    walk = Activity(name="Walk", description="30 min walk")
    feed = Activity(name="Feed", description="Morning meal")

    # Assign activities (M:M)
    buddy.activities.append(walk)
    max.activities.append(feed)

    db.session.add_all([alice, bob, buddy, max, walk, feed])
    db.session.commit()