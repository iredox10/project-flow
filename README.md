# Project Flow

Project Flow is a web application designed to streamline the management of student projects. It provides a collaborative platform for students, supervisors, and administrators to track project progress, manage submissions, and facilitate communication.

## Features

*   **Rich Text Editor:** A powerful tiptap-based editor for writing project chapters, proposals, and other documents.
*   **User Roles:** Different roles for students, supervisors, admins, and super-admins with specific permissions and dashboards.
*   **Project Management:** Track project status, submissions, and feedback.
*   **Announcements:** Admins can post announcements to all users.
*   **Messaging:** Students and supervisors can communicate with each other.
*   **Version History:** Track changes in project documents.
*   **Spell Check and Thesaurus:** Integrated writing tools to improve document quality.

## User Roles

*   **Student:** Can create and manage their projects, write and submit chapters and proposals, and communicate with their supervisor.
*   **Supervisor:** Can view and manage assigned student projects, review and comment on submissions, and communicate with students.
*   **Admin:** Can manage users, assign supervisors to students, and post announcements.
*   **Super-Admin:** Has full control over the system, including managing other admins.

## Technologies Used

*   **Frontend:** React, Vite
*   **Backend:** Firebase (Authentication, Firestore, Storage)
*   **Text Editor:** Tiptap
*   **Styling:** CSS

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js
*   bun

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/project-flow.git
    ```
2.  Install NPM packages
    ```sh
    bun install
    ```
3.  Create a `.env` file in the root directory and add your Firebase configuration.
    ```
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```
4.  Start the development server
    ```sh
    bun run dev
    ```

## Folder Structure

```
.
├── public
│   └── vite.svg
├── src
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── tiptapEditor
│   │   └── ...
│   ├── context
│   │   └── AuthContext.jsx
│   ├── firebase
│   │   └── config.js
│   ├── pages
│   │   ├── student
│   │   ├── super-admin
│   │   └── supervisor
│   └── ...
└── ...
```