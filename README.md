# Simple Calendar App

A self-hosted, real-time calendar and activity tracker built with React, Node.js, and Docker.

This project was developed with AI assistance to help build, refactor, and enhance features.



## Features

* **Year-at-a-glance:** View all 12 months on a single page.
* **Activity Tracking:** Click any day to add locations, rich-text details, and icons.
* **Customizable Key:** Define a key for your activities with custom icons and colors.
* **Stats Dashboard:** Automatically tracks "Days Away From Home" and location counts.
* **Real-time:** Updates are pushed via WebSockets to all connected clients.
* **Admin Mode:** Secure the save functionality behind a password.
* **Dark Mode:** Toggles between light and dark themes.

## Quick Start

This application is designed to be run with **Docker**.

1.  Create a `docker-compose.yml` file:

    ```yaml
    version: '3.8'
    
    services:
      calendar-app:
        image: thebronway/calendar-app:latest
        container_name: calendar
        restart: unless-stopped
        ports:
          # Binds port 8080 on your host to port 80 in the container
          - "8080:80"
        volumes:
          # Mounts a local folder to persist your calendar data
          - ./calendar_data:/app/data
        environment:
          # REQUIRED: Set this to a secure password
          - ADMIN_PASSWORD=your_secure_password_here
          
          # OPTIONAL: Set your local timezone (e.g., "America/New_York")
          - TIMEZONE=UTC
          
          # OPTIONAL: Customize the header text
          - PAGE_HEADER_NAME=My
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
| `TIMEZONE` | No | `UTC` | Sets the server's timezone to correctly identify "today." [List of valid names](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). |
| `PAGE_HEADER_NAME`| No | `null` | Customizes the header text (e.g., `PAGE_HEADER_NAME=My`). |

## Tech Stack

* **Frontend:** React (with Vite)
* **Backend:** Node.js / Express
* **Real-time:** WebSockets (ws)
* **Styling:** Tailwind CSS
* **Text Editor:** ReactQuill
* **Container:** Docker
