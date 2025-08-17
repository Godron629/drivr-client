import os

# Dashboard configuration
DASHBOARD_PORT = int(os.getenv('DASHBOARD_PORT', 8080))
DASHBOARD_HOST = os.getenv('DASHBOARD_HOST', '0.0.0.0')
DASHBOARD_DEBUG = os.getenv('DASHBOARD_DEBUG', 'True').lower() == 'true'