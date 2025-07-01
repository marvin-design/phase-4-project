import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    # Get port from environment (Render assigns this)
    port = int(os.environ.get('PORT', 5000))

    # Get debug setting from config/environment
    debug_mode = app.config.get('DEBUG', False)

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
