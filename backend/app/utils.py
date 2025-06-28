from werkzeug.security import generate_password_hash, check_password_hash

def verify_password(entered_password, stored_hash):
    return check_password_hash(stored_hash, entered_password)

def hash_password(password):
    return generate_password_hash(password)