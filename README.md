# A Simple Self-Hosted Calendar App

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-v0.8.7-blue.svg)
![Docker](https://img.shields.io/docker/pulls/thebronway/calendar-app?logo=docker)

### A self-hosted, real-time calendar and activity tracker built with React, Node.js, and Docker.

This self-hosted calendar provides a simple web dashboard to share your schedule with friends and family. It tracks your upcoming travel plans to keep your personal network informed and displays your availability so others can plan accordingly.

## Try it yourself: [Live Demo](https://calendar-demo.conway.im/)  
**GitHub:** [thebronway/calendar-app](https://github.com/thebronway/calendar-app)  
**Docker Hub:** [thebronway/calendar-app](https://hub.docker.com/r/thebronway/calendar-app)

## Features

* **Year-at-a-Glance:** Visual dashboard for the entire year.
* **Deep Customization:** Define color-coded categories and custom activity icons.
* **Activity Display Names:** Define custom display names for activities on individual days.
- **Dynamic URLs:** Filter and share specific views instantly using query parameters (e.g., `?a=slug`).
- **List View:** A clean, continuous timeline layout (`/list`) that compiles your filtered events chronologically by month.
- **Isolated Month View:** View a single month alongside a dynamic side-legend showing only the active keys for that month.
* **Bulk Editing:** Bulk editing for date ranges and multiple days.
* **Smart Tracking:** Log locations, rich text notes, and visualize travel stats.
* **Interactive Filters:** Click stats or key items to highlight specific days instantly.
* **Real-Time Sync:** Updates are pushed via WebSockets to all connected clients.
* **Admin Mode:** Password-protected editing with a public read-only view.
* **Responsive & Dark Mode:** Optimized for mobile with automatic dark theme support.

**Note:** For production use, it is strongly recommended to protect your instance using a reverse proxy and authentication service (e.g., Nginx and Authentik).

## Screenshots

<details>
<summary>Click to expand screenshots</summary>

#### Default View Mode (Desktop)
<img src="./screenshots/0.7-view.png" alt="Calendar Screenshot" width="600">

#### Default View Mode (Mobile)
<img src="./screenshots/0.7-view-mobile.png" alt="Calendar Screenshot" width="200">

#### Admin Edit Day
<img src="./screenshots/0.7-day-1.png" alt="Calendar Screenshot" width="400">
<img src="./screenshots/0.7-day-2.png" alt="Calendar Screenshot" width="400">
<img src="./screenshots/0.7-day-3.png" alt="Calendar Screenshot" width="400">

#### Admin Settings
<img src="./screenshots/0.7-edit-2.png" alt="Calendar Screenshot" width="400">
<img src="./screenshots/0.7-edit-1.png" alt="Calendar Screenshot" width="400">

</details>

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
| **`DATA_DIR`** | No | `/app/data` | Path where JSON data files are stored (useful for custom volume mounts). |
| **`TIMEZONE`** | No | `UTC` | Default timezone for the calendar. |
| **`PAGE_BANNER_HTML`** | No | `null` | HTML banner displayed above the calendar. |

---

### Author
Check out my other projects at [brian.conway.im](https://brian.conway.im/).

*This software is provided "as is", without warranty of any kind, express or implied.*
