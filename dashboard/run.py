from app import create_app
from app.config import DASHBOARD_HOST, DASHBOARD_PORT, DASHBOARD_DEBUG

app = create_app()

if __name__ == "__main__":
    app.run(host=DASHBOARD_HOST, port=DASHBOARD_PORT, debug=DASHBOARD_DEBUG)