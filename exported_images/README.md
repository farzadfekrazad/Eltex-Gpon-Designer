# Exported Docker Images

This folder contains exported Docker images for the Eltex Gpon Designer project.

## Version: v1.0

### Files:
- `backend-v1.0.tar`: Docker image for the backend service.
- `frontend-v1.0.tar`: Docker image for the frontend service.

### How to Use:

1. **Load the Docker Images**:
   ```bash
   docker load < backend-v1.0.tar
   docker load < frontend-v1.0.tar
   ```

2. **Run the Containers**:
   Use `docker-compose` to start the application:
   ```bash
   docker-compose up -d
   ```

3. **Access the Application**:
   Open your browser and navigate to the frontend URL (e.g., `http://localhost:3000`).

---

Ensure you download the correct version of the images for compatibility with your system.