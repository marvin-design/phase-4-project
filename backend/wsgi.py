"""
WSGI Entry Point for Dog Management System Backend

This file serves as the entry point for WSGI servers like Gunicorn
in production environments.
"""

import os
from app import create_app

# Create the Flask application instance
application = create_app()
app = application  # Some WSGI servers expect 'app' as the variable name

if __name__ == "__main__":
    # This block allows running the WSGI file directly for testing
    port = int(os.environ.get('PORT', 5000))
    application.run(host='0.0.0.0', port=port) 