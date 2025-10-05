# Noorao Gpon Net Designer

This is a comprehensive tool for designing and visualizing GPON networks. It allows you to configure all possible parameters from the Optical Line Terminal (OLT) to the Optical Network Terminal (ONT) and view a dynamic network diagram with real-time power budget analysis.

The application features a React-based frontend and a Node.js/Express backend, all containerized with Docker for easy setup and deployment.

## Key Features

- **End-to-End Configuration**: Adjust parameters for OLTs, SFPs, optical distribution networks (splitters, fiber distance), and ONTs.
- **Dynamic Visualization**: See a real-time diagram of your network design that updates as you change parameters.
- **Real-Time Power Budget Analysis**: Instantly calculate the total link loss and power margin to ensure your design is viable.
- **Bill of Materials (BOM)**: Automatically generate a list of required equipment based on your design.
- **Full User Authentication**: Secure user registration and login system with role-based access control.
- **Comprehensive Admin Panel**:
    - Manage the device catalog (OLTs and ONTs).
    - Import/Export the device catalog via JSON.
    - Manage users and their roles (Admin, User, Read-only Admin).
    - Edit UI translations directly from the admin panel.
    - Configure server settings like SMTP for email verification.
- **Multi-language Support**: Switch between English and Persian (Farsi) with RTL support.

---

## Getting Started with Docker (Recommended)

This is the easiest and most reliable way to get the application running on your local machine.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system.
- [Git](https://git-scm.com/) for cloning the repository.

### Installation & Setup

1.  **Clone the Repository**
    Open your terminal and clone this repository to your local machine.
    ```bash
    git clone <your-github-repository-url>
    cd <repository-folder-name>
    ```

2.  **Build and Run the Containers**
    In the root directory of the project (where the `docker-compose.yml` file is located), run the following command. This will build the Docker images for both the frontend and backend and start the application.

    ```bash
    docker-compose up --build
    ```
    - The `--build` flag tells Docker to build the images from the Dockerfiles the first time you run it.
    - This process might take a few minutes as it downloads the necessary base images and installs dependencies.

3.  **Access the Application**
    Once the containers are running, you can access the application in your web browser at:
    [**http://localhost:5173**](http://localhost:5173)

    The backend server will be running on port 3001, but the frontend is configured to proxy API requests, so you only need to interact with the frontend URL.

### Default Admin Login

A default administrator account is created when the database is first initialized. Use these credentials to log in and access the Admin Panel:

-   **Email**: `admin@noorao.designer`
-   **Password**: `admin123`

### Managing the Application

-   **To stop the application:**
    Press `Ctrl + C` in the terminal where `docker-compose` is running. Then, to ensure the containers are stopped and removed, you can run:
    ```bash
    docker-compose down
    ```

-   **To start the application again later:**
    Navigate to the project directory and run:
    ```bash
    docker-compose up
    ```

### Development Workflow

- Rebuild and restart containers after code changes:
  ```bash
  docker compose up --build
  ```
- Watch logs to verify startup and diagnose issues:
  ```bash
  docker compose logs -f
  ```
- Common ports:
  - Frontend UI: `http://localhost:5173`
  - Backend API: `http://localhost:3001`

If the backend shows module resolution errors at runtime, ensure backend imports use explicit `.js` extensions for local modules (e.g., `import { db } from '../db.js'`).

### How It Works

The `docker-compose.yml` file defines and orchestrates two services:

1.  **`backend`**:
    -   Builds the Node.js/Express server from `server/Dockerfile`.
    -   Installs all dependencies, compiles the TypeScript code, and starts the server.
    -   Creates and uses a SQLite database file (`noorao_gpon_designer.db`) which is stored inside the `server` directory on your host machine, so your data persists even if you stop and remove the containers.

2.  **`frontend`**:
    -   Builds the React frontend application from the root `Dockerfile`.
    -   This is a multi-stage build that first uses Node.js to build the static React files, then serves them using a lightweight Nginx server.
    -   It exposes port `5173` so you can access the UI in your browser.
    -   The `vite.config.ts` is configured to proxy any requests to `/api` from the frontend to the backend service running at `http://backend:3001`.

---

This setup ensures that you have a consistent development and production environment without needing to manually install Node.js, dependencies, or configure a web server on your host machine.

**Deploy to Google AI Studio App Builder**
- Overview: Import this GitHub repo and deploy the frontend, with the backend deployed separately (recommended) or via container.
- Prereqs: Ensure main is up to date and .gitignore excludes server/database/*.db.

- Frontend (recommended, static hosting):
  - Import from GitHub and select this repository.
  - Build command: 
pm ci && npm run build.
  - Start command (Node serve): 
px serve -s dist -l 8080.
  - Static hosting alternative: Use the provided Dockerfile + 
ginx.conf to serve dist/.
  - API calls: The dev proxy in ite.config.ts is only for local dev. In production, point /api to your backend service URL. If using Nginx, update 
ginx.conf proxy_pass target to your backend URL.

- Backend (separate service):
  - Build and deploy the backend using server/Dockerfile to a runtime like Cloud Run.
  - Expose http on port 3001.
  - Set environment variables as needed (e.g., SMTP); database file resides inside the container.

- Docker Compose (alternative, single host):
  - If the platform supports Docker Compose, use docker compose up --build.
  - Frontend publishes 5173 (Nginx), backend publishes 3001.

- Verify:
  - Frontend: Access the App URL and confirm UI loads.
  - Backend: Test GET /api/settings and POST /api/auth/login.
  - CORS: If the frontend is hosted on a different origin, enable CORS on the backend or proxy /api via Nginx.
