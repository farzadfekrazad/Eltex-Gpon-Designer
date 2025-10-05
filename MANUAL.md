# Noorao Gpon Net Designer - User Manual

Welcome to the Noorao Gpon Net Designer! This manual will guide you through the installation process and explain how to use the application's features.

## Table of Contents

- [Introduction](#introduction)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Features](#features)
  - [End-to-End Configuration](#end-to-end-configuration)
  - [Dynamic Visualization](#dynamic-visualization)
  - [Real-Time Power Budget Analysis](#real-time-power-budget-analysis)
  - [Bill of Materials (BOM)](#bill-of-materials-bom)
  - [User Authentication](#user-authentication)
  - [Admin Panel](#admin-panel)
  - [Multi-language Support](#multi-language-support)

## Introduction

The Noorao Gpon Net Designer is a comprehensive tool for designing and visualizing GPON networks. It allows you to configure all possible parameters from the Optical Line Terminal (OLT) to the Optical Network Terminal (ONT) and view a dynamic network diagram with real-time power budget analysis.

## Installation

The easiest way to get the application running is by using Docker.

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system.
- [Git](https://git-scm.com/) for cloning the repository.

### Setup

1.  **Clone the Repository**
    ```bash
    git clone <your-github-repository-url>
    cd noorao-gpon-net-designer
    ```

2.  **Build and Run the Containers**
    ```bash
    docker-compose up --build
    ```

3.  **Access the Application**
    Open your web browser and navigate to [http://localhost:5173](http://localhost:5173).

## Getting Started

Upon first launch, a default administrator account is created. Use the following credentials to log in:

-   **Email**: `admin@noorao.designer`
-   **Password**: `admin123`

Once logged in, you can start designing your GPON network.

## Features

### End-to-End Configuration

Adjust parameters for OLTs, SFPs, optical distribution networks (splitters, fiber distance), and ONTs.

### Dynamic Visualization

See a real-time diagram of your network design that updates as you change parameters.

### Real-Time Power Budget Analysis

Instantly calculate the total link loss and power margin to ensure your design is viable.

### Bill of Materials (BOM)

Automatically generate a list of required equipment based on your design.

### User Authentication

Secure user registration and login system with role-based access control.

### Admin Panel

- Manage the device catalog (OLTs and ONTs).
- Import/Export the device catalog via JSON.
- Manage users and their roles (Admin, User, Read-only Admin).
- Edit UI translations directly from the admin panel.
- Configure server settings like SMTP for email verification.

### Multi-language Support

Switch between English and Persian (Farsi) with RTL support.