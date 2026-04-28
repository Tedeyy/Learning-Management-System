# 🎓 EduReady LMS

**EduReady** is a modern, high-fidelity Learning Management System (LMS) designed to bridge the gap between structured instruction and intuitive learning. Built with a focus on **modular curriculum organization** and **granular progress tracking**, it empowers instructors to manage classes with precision while providing students with a clear, visual path to mastery.

---

## 🚀 Tech Stack

### Frontend
- **HTML5 & Vanilla CSS3**: Custom-built design system featuring modern aesthetics like glassmorphism and dynamic animations.
- **Vanilla JavaScript (ES6+)**: Powers the asynchronous UI, handling dynamic content loading via the Fetch API for a seamless, "app-like" experience.
- **Lucide Icons**: Implementation of a sleek, consistent iconography system.
- **Google Fonts**: Utilizing 'Inter' for readability and 'Outfit' for professional branding.

### Backend
- **PHP 8.x**: Functional REST API layer handling authentication, course management, and progress calculation.
- **PDO (PHP Data Objects)**: Secure database interactions with prepared statements to prevent SQL injection.

### Database
- **MySQL / MariaDB**: Relational schema designed for scalability, featuring complex joins for real-time progress aggregation.

---

## 🏗️ System Architecture

EduReady follows a **Client-Server Architecture** with a decoupled frontend and API layer:

1. **Presentation Layer (Frontend)**:
   - A single-entry dashboard (`main.php`) that uses a JavaScript-driven state manager (`main.js`) to switch between Student and Instructor views without full page reloads.
   
2. **Logic Layer (REST API)**:
   - The frontend communicates with PHP endpoints (`courses.php`, `login.php`) using JSON payloads.
   - The API handles business logic such as enrollment verification, content permissions, and progress reset logic.

3. **Data Layer (MySQL)**:
   - **User Persistence**: Role-based storage (Instructors/Students).
   - **Curriculum Hierarchy**: `Courses` > `Categories (Modules)` > `Activities/Materials`.
   - **Progress Engine**: Tracks `Submissions` (Activities) and `Views` (Materials) to compute real-time completion percentages.

---

## 🔄 User Flow

EduReady is designed with a logical, step-by-step navigation system to ensure clarity for both educators and learners.

### 🎓 Student Learning Journey (3-Step Flow)
1.  **Step 1: Discover & Enrol** (Student Dashboard)
    - Browse available courses, search by title or description, and enrol instantly.
2.  **Step 2: Course Navigation** (Module Overview)
    - Upon selecting a course, students see a clean list of modules. Each module features a progress bar tracking completion of its internal activities and materials.
3.  **Step 3: Deep Learning** (Module Content View)
    - Selecting a module opens a dedicated view containing only the lessons, videos, and assessments for that specific topic, providing a distraction-free learning environment.

### 🛠️ Instructor Management Flow
1.  **Step 1: Course Orchestration** (Instructor Dashboard)
    - Create new courses and get an bird's-eye view of your teaching portfolio.
2.  **Step 2: Curriculum Design** (Course Manager)
    - Structure your course by adding modules. Within each module, upload learning materials or link interactive activities.
3.  **Step 3: Progress Monitoring** (Student Roster)
    - Access the Student Actions menu to track individual performance, view completion metrics, and manage enrollments in real-time.

---

## ✨ Key Features

### 📖 For Students
- **Modular Learning**: Curriculum organized into digestible modules with interactive previews.
- **Granular Progress Tracking**: Dual-layer progress bars showing completion status at both the Module and Course levels.
- **Integrated Activities**: Seamless support for Google Forms assessments and multimedia learning materials (Videos, PDFs, External Links).
- **Discreet Unenrollment**: Full autonomy to manage their course list with automated data cleanup.

### 🛠️ For Instructors
- **Course Builder**: Intuitive tools to create courses and structure modules dynamically.
- **Student Roster Management**: Advanced "Actions" menu to view student profiles, monitor individual progress, and manage enrollments.
- **Real-time Analytics**: Visual feedback on how many activities and materials each student has completed.
- **Content Management**: Inline editing for lessons and activities for quick curriculum updates.

---

## 🛠️ Installation & Setup

1. **Environment**: Ensure you have XAMPP, WAMP, or a similar PHP/MySQL environment installed.
2. **Database**: 
   - Create a database named `eduready_lms`.
   - Import the schema from `api/schema.sql`.
3. **Configuration**: Update `api/config.php` with your database credentials.
4. **Launch**: Access the project via `localhost/Learning-Management-System/Index.html`.

---

## 📜 License
© 2026 EduReady LMS. Developed for modern education.
