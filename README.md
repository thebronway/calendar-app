# Simple Calendar App

A self-hosted, real-time calendar and activity tracker built with React, Node.js, and Docker.

This project was developed with AI assistance to help build, refactor, and enhance features.

## Features

* **Year-at-a-glance:** View all 12 months on a single page.
* **Activity Tracking:** Click on any day to log your location, notes, or activity icons.
* **Customizable Key:** Define your own travel categories (like Work, Personal, or Sick Time) and activities (like Flights or Beach Days) with custom colors and icons.
* **Stats Dashboard:** Automatically tracks days and time spent traveling.
* **Real-time:** Updates are pushed via WebSockets to all connected clients.
* **Responsive & Mobile-Friendly:** Optimized for any sized device.

## Screenshots

#### Deafult View Mode

![Calendar Screenshot](./screenshots/0.5-view.png)

#### Admin Day Edit View

![Calendar Screenshot](./screenshots/0.5-edit1.png)

## Quick Start

This application is designed to be run with **Docker**, or compile the code yourself if you'd like. 

1.  Create a `docker-compose.yml` file:

    ```yaml
    version: '3.8'
    
    services:
      calendar-app:
        image: thebronway/calendar-app:latest
        container_name: calendar
        restart: unless-stopped
        ports:
          - "8080:80"
        volumes:
          - ./calendar_data:/app/data
        environment:
          # REQUIRED: Set this to a secure password
          - ADMIN_PASSWORD=your_secure_password_here
          
          # OPTIONAL: Set your local timezone (e.g., "America/New_York")
          - TIMEZONE=UTC
    ```

2.  Create the data directory and run the container:

    ```sh
    mkdir calendar_data
    docker-compose up -d
    ```

Your calendar will be running at `http://localhost:8080`.

## Configuration (Environment Variables)

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| **`ADMIN_PASSWORD`** | **Yes** | `null` | A secure password to enable Admin Mode (editing/saving). |