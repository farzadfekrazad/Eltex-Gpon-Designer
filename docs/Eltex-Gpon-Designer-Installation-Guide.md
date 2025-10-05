# Eltex-Gpon-Designer Installation Guide

## Overview
This document provides step-by-step instructions for installing and running the Eltex-Gpon-Designer application on a VPS server using Docker. The application consists of a frontend and backend service containerized with Docker.

## Server Information
- **Server IP**: 138.197.116.13
- **OS**: Ubuntu
- **Architecture**: 1 vCPU, 1GB RAM

## Prerequisites
- SSH access to the server
- Root privileges

## Installation Steps

### 1. Connect to the VPS Server
```bash
ssh root@138.197.116.13
```

### 2. Install Docker and Docker Compose
```bash
apt-get update && apt-get install -y docker.io docker-compose
```

### 3. Create Application Directory
```bash
mkdir -p /opt/eltex-gpon-designer/server/database
```

### 4. Set Up Docker Compose Configuration
Create a `docker-compose.yml` file in the `/opt/eltex-gpon-designer/` directory:

```yaml
services:
  backend:
    image: eltex-gpon-designer-backend:latest
    ports:
      - 3001:3001
    volumes:
      - ./server/database:/usr/src/app/database
    restart: unless-stopped
    container_name: noorao_gpon_designer_backend

  frontend:
    image: eltex-gpon-designer-frontend:latest
    ports:
      - 80:80
    depends_on:
      - backend
    restart: unless-stopped
    container_name: noorao_gpon_designer_frontend
```

### 5. Transfer Docker Images to the Server
Copy the Docker image files to the server:
```bash
scp backend-v1.0.tar frontend-v1.0.tar root@138.197.116.13:/opt/eltex-gpon-designer/
```

### 6. Load Docker Images
```bash
cd /opt/eltex-gpon-designer
docker load < backend-v1.0.tar
docker load < frontend-v1.0.tar
```

### 7. Start the Application
```bash
cd /opt/eltex-gpon-designer
docker-compose up -d
```

### 8. Verify Installation
Check that the containers are running:
```bash
docker ps
```

You should see two containers running:
- `noorao_gpon_designer_backend`
- `noorao_gpon_designer_frontend`

## Accessing the Application

The Eltex-Gpon-Designer application is now accessible at:
- **Frontend**: http://138.197.116.13
- **Backend API**: http://138.197.116.13:3001

## Management Commands

### View Container Logs
```bash
# View frontend logs
docker logs noorao_gpon_designer_frontend

# View backend logs
docker logs noorao_gpon_designer_backend
```

### Stop the Application
```bash
cd /opt/eltex-gpon-designer
docker-compose down
```

### Restart the Application
```bash
cd /opt/eltex-gpon-designer
docker-compose restart
```

### Update the Application
To update the application with new Docker images:
1. Transfer new image files to the server
2. Load the new images
3. Restart the containers:
```bash
cd /opt/eltex-gpon-designer
docker-compose down
docker load < new-backend.tar
docker load < new-frontend.tar
docker-compose up -d
```

## Troubleshooting

### Container Not Starting
Check container logs for errors:
```bash
docker logs noorao_gpon_designer_backend
docker logs noorao_gpon_designer_frontend
```

### Application Not Accessible
Verify that ports are open and containers are running:
```bash
docker ps
netstat -tulpn | grep -E '3001|80'
```

### Database Issues
The backend database is stored in `/opt/eltex-gpon-designer/server/database`. Ensure this directory has proper permissions:
```bash
chown -R 1000:1000 /opt/eltex-gpon-designer/server/database
```

## Backup and Restore

### Backup Database
```bash
cp -r /opt/eltex-gpon-designer/server/database /backup/database-$(date +%Y%m%d)
```

### Restore Database
```bash
cp -r /backup/database-YYYYMMDD /opt/eltex-gpon-designer/server/database
docker-compose restart backend
```

## Conclusion
The Eltex-Gpon-Designer application is now successfully installed and running on your VPS server. You can access the web interface by navigating to http://138.197.116.13 in your web browser.