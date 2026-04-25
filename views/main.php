<?php
include 'content/header.php';
include 'content/navbar.php';
?>

<main class="auth-container">
    <!-- Login View -->
    <div id="login-view" class="auth-card view active">
        <h2>Welcome</h2>
        <p>Login to your account to continue your learning journey.</p>
        <div id="login-message" style="margin-bottom: 1rem; text-align: center; font-size: 0.9rem; display: none"></div>
        <form id="login-form">
            <div class="form-group">
                <label for="login-email">Email Address</label>
                <input type="email" id="login-email" placeholder="example@eduready.com" required>
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%">Sign In</button>
        </form>
        <div class="auth-footer">
            Don't have an account? <a href="#" id="go-to-register">Create Account</a>
        </div>
    </div>

    <!-- Registration View -->
    <div id="register-view" class="auth-card view" style="max-width: 650px;">
        <h2>Create Account</h2>
        <p>Join EduReady and start learning today.</p>
        <div id="register-message" style="margin-bottom: 1rem; text-align: center; font-size: 0.9rem; display: none">
        </div>
        <form id="register-form">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="reg-fname">First Name</label>
                    <input type="text" id="reg-fname" placeholder="John" required>
                </div>
                <div class="form-group">
                    <label for="reg-lname">Last Name</label>
                    <input type="text" id="reg-lname" placeholder="Doe" required>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="reg-mname">Middle Name (Optional)</label>
                    <input type="text" id="reg-mname" placeholder="Quincy">
                </div>
                <div class="form-group">
                    <label for="reg-role">I am a...</label>
                    <select id="reg-role" class="form-control"
                        style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid #ddd;" required>
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                    </select>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                    <label for="reg-birthdate">Birthdate</label>
                    <input type="date" id="reg-birthdate" required>
                </div>
                <div class="form-group">
                    <label for="reg-gender">Gender</label>
                    <select id="reg-gender" class="form-control"
                        style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid #ddd;" required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="reg-address">Home Address</label>
                <input type="text" id="reg-address" placeholder="123 Street, City" required>
            </div>

            <div class="form-group">
                <label for="reg-contact">Contact Number</label>
                <input type="tel" id="reg-contact" placeholder="09123456789" required>
            </div>

            <div class="form-group">
                <label for="reg-email">Email Address</label>
                <input type="email" id="reg-email" placeholder="example@eduready.com" required>
            </div>

            <div class="form-group">
                <label for="reg-password">Password</label>
                <input type="password" id="reg-password" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%">Register Now</button>
        </form>
        <div class="auth-footer">
            Already have an account? <a href="#" id="go-to-login">Sign In</a>
        </div>
    </div>

    <!-- Instructor Dashboard View -->
    <div id="instructor-dashboard" class="dashboard-view view" style="width: 100%; max-width: 1200px; padding: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
            <h2>Instructor Hub</h2>
            <div id="course-breadcrumb"
                style="font-size: 0.9rem; color: var(--secondary-color); font-weight: 600; display: none;">
                <a href="#" id="back-to-courses" style="display: flex; align-items: center; gap: 5px;">
                    <i data-lucide="chevron-left"></i> Back to Courses
                </a>
                <span id="current-course-name" style="margin-left: 1rem; color: #333;"></span>
            </div>
        </div>

        <!-- 1. My Courses List (Top Level) -->
        <div id="instructor-courses-section">
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
                <!-- Add Course Form -->
                <div class="auth-card"
                    style="padding: 2rem; margin: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 100%;">
                    <h3>Create New Course</h3>
                    <div id="add-course-message" style="margin: 1rem 0; font-size: 0.9rem; display: none"></div>
                    <form id="add-course-form">
                        <div class="form-group">
                            <label for="course-title">Course Title</label>
                            <input type="text" id="course-title" placeholder="e.g., PHP Mastery" required>
                        </div>
                        <div class="form-group">
                            <label for="course-desc">Description</label>
                            <textarea id="course-desc" placeholder="Summarize the course goals..."
                                style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd; height: 100px;"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%">Create Course</button>
                    </form>
                </div>

                <!-- Courses Grid -->
                <div>
                    <h3>Managed Courses</h3>
                    <div id="instructor-courses-list" class="courses-mini-grid"
                        style="margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <!-- Courses will be loaded here -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 2. Course Curriculum Manager (Second Level) -->
        <div id="course-manager-section" style="display: none;">
            <div class="tabs" style="display: flex; gap: 2rem; margin-bottom: 2rem; border-bottom: 2px solid #f0f0f0;">
                <button class="instructor-tab active" data-tab="modules" style="padding: 1rem 0; background: none; border: none; font-weight: 600; color: var(--primary-color); border-bottom: 3px solid var(--primary-color); cursor: pointer; font-size: 1rem;">Modules</button>
                <button class="instructor-tab" data-tab="enrollees" style="padding: 1rem 0; background: none; border: none; font-weight: 600; color: #999; border-bottom: 3px solid transparent; cursor: pointer; font-size: 1rem;">Enrollees</button>
            </div>

            <div id="tab-modules-view">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 2rem;">
                <!-- Category Management -->
                <div class="auth-card"
                    style="padding: 2rem; margin: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 100%;">
                    <h3 id="current-course-name">Course Name</h3>
                    <p style="margin-bottom: 1.5rem; font-size: 0.9rem; opacity: 0.7;">Build your modules and lessons
                        below.</p>

                    <form id="add-category-form"
                        style="margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid #eee;">
                        <div class="form-group">
                            <label for="cat-name">New Module Name</label>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="cat-name" placeholder="e.g., Module 1: Getting Started" required>
                                <button type="submit" class="btn btn-primary" style="padding: 0.5rem 1rem;"><i
                                        data-lucide="plus"></i></button>
                            </div>
                        </div>
                    </form>

                    <div id="categories-list">
                        <!-- Categories will be listed here -->
                    </div>
                </div>

                <!-- Activity/Lesson Management -->
                <div id="activity-manager">
                    <div id="no-category-selected"
                        style="text-align: center; padding: 4rem; background: var(--white); border-radius: 20px; border: 2px dashed #eee;">
                        <i data-lucide="layout"
                            style="width: 48px; height: 48px; color: #ccc; margin-bottom: 1rem;"></i>
                        <p>Select a module on the left to manage its lessons and activities.</p>
                    </div>

                    <div id="category-details" style="display: none;">
                        <div
                            style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h3 id="current-category-name">Module Activities</h3>
                            <div style="display: flex; gap: 10px;">
                                <button id="show-add-material" class="btn btn-outline"
                                    style="padding: 0.5rem 1rem; font-size: 0.85rem; border-color: #2ecc71; color: #2ecc71;">+
                                    Add Material</button>
                                <button id="show-add-activity" class="btn btn-outline"
                                    style="padding: 0.5rem 1rem; font-size: 0.85rem;">+ Add Activity</button>
                            </div>
                        </div>

                        <!-- Add Material Form -->
                        <div id="add-material-container"
                            style="display: none; background: #ebfaf0; padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem; border: 1px solid #d4edda;">
                            <form id="add-material-form">
                                <h4 style="margin-bottom: 1rem; color: #27ae60;">Add Learning Material</h4>
                                <div class="form-group">
                                    <label>Material Title</label>
                                    <input type="text" id="mat-title" placeholder="e.g., Course Syllabus PDF" required>
                                </div>
                                <div class="form-group">
                                    <label>Resource URL / Link</label>
                                    <input type="url" id="mat-url" placeholder="https://example.com/file.pdf" required>
                                </div>
                                <div class="form-group">
                                    <label>Description (Optional)</label>
                                    <textarea id="mat-desc" placeholder="What is this resource for?"
                                        style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd; height: 80px;"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Type</label>
                                    <select id="mat-type" class="form-control"
                                        style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd;">
                                        <option value="link">External Link</option>
                                        <option value="pdf">PDF Document</option>
                                        <option value="video">Video Resource</option>
                                        <option value="drive">Google Drive</option>
                                    </select>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button type="submit" class="btn btn-primary"
                                        style="flex: 1; background: #27ae60;">Save Material</button>
                                    <button type="button" id="cancel-material" class="btn btn-outline"
                                        style="flex: 1;">Cancel</button>
                                </div>
                            </form>
                        </div>

                        <!-- Add Activity Form -->
                        <div id="add-activity-container"
                            style="display: none; background: #f9f9fb; padding: 1.5rem; border-radius: 15px; margin-bottom: 1.5rem; border: 1px solid #eee;">
                            <form id="add-activity-form">
                                <h4 style="margin-bottom: 1rem; color: var(--secondary-color);">Add Google Form Activity
                                </h4>
                                <div class="form-group">
                                    <label>Activity Title</label>
                                    <input type="text" id="act-title" placeholder="e.g., Week 1 Quiz" required>
                                </div>
                                <div class="form-group">
                                    <label>Google Form Link</label>
                                    <input type="url" id="act-url" placeholder="https://docs.google.com/forms/..."
                                        required>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 3fr; gap: 1rem;">
                                    <div class="form-group">
                                        <label>Sequence #</label>
                                        <input type="number" id="act-sequence" value="0" style="width: 100%;">
                                    </div>
                                    <div class="form-group">
                                        <label>Description</label>
                                        <input type="text" id="act-desc-simple" placeholder="Short instruction..."
                                            style="width: 100%;">
                                    </div>
                                </div>
                                <div class="form-group" style="display: none;">
                                    <input type="hidden" id="act-type" value="google_form">
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button type="submit" class="btn btn-primary" style="flex: 1;">Save
                                        Activity</button>
                                    <button type="button" id="cancel-activity" class="btn btn-outline"
                                        style="flex: 1;">Cancel</button>
                                </div>
                            </form>
                        </div>

                        <div id="activities-list" style="display: grid; gap: 1rem;">
                            <!-- Activities will be loaded here -->
                        </div>
                    </div>
                </div>
                </div>
            </div>

            <div id="tab-enrollees-view" style="display: none;">
                <div class="auth-card" style="padding: 2rem; margin: 0; box-shadow: 0 10px 30px rgba(0,0,0,0.05); max-width: 100%;">
                    <h3>Course Enrollees</h3>
                    <p style="margin-bottom: 2rem; font-size: 0.9rem; opacity: 0.7;">View and manage students currently enrolled in this course.</p>
                    
                    <div id="enrollees-list-container">
                        <table style="width: 100%; border-collapse: collapse;">
                            <thead>
                                <tr style="text-align: left; border-bottom: 2px solid #f0f0f0;">
                                    <th style="padding: 1rem;">Student Name</th>
                                    <th style="padding: 1rem;">Email Address</th>
                                    <th style="padding: 1rem;">Joined At</th>
                                    <th style="padding: 1rem; text-align: center;">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="enrollees-list">
                                <!-- Enrollees will be loaded here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals for Instructor (User Info & Progress) -->
    <div id="instructor-modal-overlay" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
        <div class="auth-card" style="max-width: 500px; width: 95%; max-height: 85vh; overflow-y: auto; position: relative; padding: 1.5rem 2rem;">
            <button id="close-instructor-modal" style="position: absolute; top: 1rem; right: 1rem; border: none; background: none; cursor: pointer; color: #999;"><i data-lucide="x"></i></button>
            <div id="instructor-modal-content">
                <!-- Content will be loaded dynamically -->
            </div>
        </div>
    </div>

    <!-- Student Dashboard -->
    <div id="student-dashboard" class="dashboard-view view" style="width: 100%; max-width: 1200px; padding: 2rem;">
        <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <h1 style="color: var(--primary-color);">Welcome, <span id="student-name-display">Learner</span>!</h1>
                <p style="color: #666;">What do you want to learn today?</p>
            </div>
            <button class="logout-btn btn btn-outline" style="border-color: #ff4d4d; color: #ff4d4d;">Logout</button>
        </header>

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: flex-start;">
            <!-- Left Sidebar: Enrolled Courses -->
            <aside
                style="background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #eee; height: fit-content; position: sticky; top: 2rem;">
                <h3
                    style="margin-bottom: 1.5rem; color: var(--secondary-color); font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="book-marked" style="width: 20px;"></i> My Enrolled Courses
                </h3>
                <div id="enrolled-courses-list" style="display: flex; flex-direction: column; gap: 10px;">
                    <p style="color: #999; font-size: 0.9rem; text-align: center; padding: 1rem;">Explore the catalog to
                        start learning!</p>
                </div>
            </aside>

            <!-- Main Content: Course Catalog -->
            <section>
                <div class="search-container" style="margin-bottom: 2rem;">
                    <input type="text" id="course-search" placeholder="Search for courses..."
                        style="width: 100%; padding: 1rem 1.5rem; border-radius: 15px; border: 1px solid #eee; font-size: 1rem; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                </div>

                <div id="student-courses-grid" class="course-grid"
                    style="display: grid; grid-template-columns: 1fr; gap: 1.5rem;">
                    <!-- Courses will be loaded here -->
                </div>
            </section>
        </div>
    </div>

    <!-- Student Learning View (Dedicated Curriculum View) -->
    <div id="learning-view" class="dashboard-view view" style="width: 100%; max-width: 1200px; padding: 2rem;">
        <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <a href="#" id="back-to-catalog"
                    style="display: flex; align-items: center; gap: 8px; color: var(--secondary-color); font-weight: 600; text-decoration: none; margin-bottom: 0.5rem;">
                    <i data-lucide="chevron-left"></i> Back to Course Catalog
                </a>
                <h1 id="learning-course-title" style="color: var(--primary-color);">Course Title</h1>
            </div>
        </header>

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem; align-items: flex-start;">
            <!-- Learning Sidebar: Modules -->
            <aside
                style="background: white; border-radius: 20px; padding: 1.5rem; border: 1px solid #eee; height: fit-content; position: sticky; top: 2rem;">
                <h3
                    style="margin-bottom: 1.5rem; color: var(--secondary-color); font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                    <i data-lucide="layers" style="width: 20px;"></i> Modules
                </h3>
                <div id="learning-categories-list" style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Modules load here -->
                </div>
            </aside>

            <!-- Learning Content: Activities -->
            <main>
                <div id="learning-no-selection"
                    style="background: white; border-radius: 20px; border: 1px solid #eee; padding: 4rem; text-align: center;">
                    <i data-lucide="play-circle"
                        style="width: 64px; height: 64px; color: #eee; margin-bottom: 1.5rem;"></i>
                    <h4 style="color: #999;">Select a module to continue your journey</h4>
                </div>
                <div id="learning-activity-content" style="display: none;">
                    <h2 id="learning-module-name" style="margin-bottom: 2rem; color: #333;">Module Name</h2>
                    <div id="learning-curriculum-items" style="display: flex; flex-direction: column; gap: 1.5rem;">
                        <!-- Content loads here -->
                    </div>
                </div>
            </main>
        </div>
    </div>
</main>

<?php include 'content/footer.php'; ?>