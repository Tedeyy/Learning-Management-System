document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const authContainer = document.querySelector('.auth-container');
    const navbar = document.getElementById('navbar');

    // Sections
    const instructorCoursesSection = document.getElementById('instructor-courses-section');
    const courseManagerSection = document.getElementById('course-manager-section');
    const breadcrumb = document.getElementById('course-breadcrumb');
    
    // Forms
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const addCourseForm = document.getElementById('add-course-form');
    const addCategoryForm = document.getElementById('add-category-form');
    const addActivityForm = document.getElementById('add-activity-form');

    // State
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let selectedCourse = null;
    let selectedCategory = null;

    const updateNavbar = () => {
        const navGuest = document.getElementById('nav-guest');
        const navStudent = document.getElementById('nav-student');
        const navInstructor = document.getElementById('nav-instructor');
        if (navbar) navbar.style.display = 'block';
        if (!currentUser) {
            navGuest.style.display = 'flex';
            navStudent.style.display = 'none';
            navInstructor.style.display = 'none';
            authContainer.style.alignItems = 'center';
        } else {
            authContainer.style.alignItems = 'flex-start';
            navGuest.style.display = 'none';
            if (currentUser.role === 'instructor') {
                navStudent.style.display = 'none';
                navInstructor.style.display = 'flex';
            } else {
                navStudent.style.display = 'flex';
                navInstructor.style.display = 'none';
            }
        }
    };

    const switchView = (viewToShow) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        setTimeout(() => {
            viewToShow.classList.add('active');
            updateNavbar();
        }, 100);
    };

    // --- Instructor Actions ---
    
    // Load Instructor Courses
    async function loadInstructorCourses() {
        try {
            const response = await fetch(`../api/courses.php?type=courses&instructor_id=${currentUser.id}`);
            const courses = await response.json();
            const list = document.getElementById('instructor-courses-list');
            list.innerHTML = courses.length ? '' : '<p>No courses yet.</p>';
            
            courses.forEach(c => {
                const el = document.createElement('div');
                el.className = 'course-card';
                el.style.padding = '1.5rem';
                el.innerHTML = `
                    <h4 style="margin-bottom: 0.5rem;">${c.title}</h4>
                    <p style="font-size: 0.85rem; color: #666; margin-bottom: 1.5rem;">${c.description.substring(0, 80)}...</p>
                    <button class="btn btn-outline manage-course-btn" data-id="${c.id}" data-title="${c.title}" style="width: 100%; font-size: 0.85rem;">Manage Curriculum</button>
                `;
                list.appendChild(el);
            });

            document.querySelectorAll('.manage-course-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    selectedCourse = { id: e.target.dataset.id, title: e.target.dataset.title };
                    openCourseManager();
                });
            });
        } catch (e) {}
    }

    function openCourseManager() {
        instructorCoursesSection.style.display = 'none';
        courseManagerSection.style.display = 'block';
        breadcrumb.style.display = 'block';
        document.getElementById('current-course-name').textContent = selectedCourse.title;
        loadCategories();
    }

    document.getElementById('back-to-courses').addEventListener('click', (e) => {
        e.preventDefault();
        instructorCoursesSection.style.display = 'block';
        courseManagerSection.style.display = 'none';
        breadcrumb.style.display = 'none';
        selectedCourse = null;
        selectedCategory = null;
    });

    // Categories
    async function loadCategories() {
        const response = await fetch(`../api/courses.php?type=categories&course_id=${selectedCourse.id}`);
        const categories = await response.json();
        const list = document.getElementById('categories-list');
        list.innerHTML = '';
        categories.forEach(cat => {
            const el = document.createElement('div');
            el.className = `category-item ${selectedCategory?.id == cat.id ? 'active' : ''}`;
            el.style.padding = '1rem'; el.style.cursor = 'pointer'; el.style.borderRadius = '10px';
            el.style.marginBottom = '5px'; el.style.background = selectedCategory?.id == cat.id ? '#f0f4ff' : 'transparent';
            el.innerHTML = `<span style="font-weight: 500;">${cat.name}</span>`;
            el.addEventListener('click', () => {
                selectedCategory = cat;
                loadCategories(); // Refresh active state
                openActivityManager();
            });
            list.appendChild(el);
        });
    }

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const response = await fetch('../api/courses.php?type=categories', {
            method: 'POST',
            body: JSON.stringify({ course_id: selectedCourse.id, name })
        });
        if (response.ok) { addCategoryForm.reset(); loadCategories(); }
    });

    // Activities
    function openActivityManager() {
        document.getElementById('no-category-selected').style.display = 'none';
        document.getElementById('category-details').style.display = 'block';
        document.getElementById('selected-category-name').textContent = selectedCategory.name;
        loadActivities();
    }

    async function loadActivities() {
        const response = await fetch(`../api/courses.php?type=activities&category_id=${selectedCategory.id}`);
        const activities = await response.json();
        const list = document.getElementById('activities-list');
        list.innerHTML = activities.length ? '' : '<p style="text-align: center; color: #999; padding: 2rem;">No activities in this module yet.</p>';
        activities.forEach(act => {
            const el = document.createElement('div');
            el.className = 'course-card';
            el.style.padding = '1rem'; el.style.borderLeft = '4px solid var(--secondary-color)';
            el.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <strong>${act.sequence_number}. ${act.title}</strong>
                    <span style="font-size: 0.75rem; text-transform: uppercase; background: #eee; padding: 2px 8px; border-radius: 4px;">${act.activity_type}</span>
                </div>
                <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">${act.description}</p>
            `;
            list.appendChild(el);
        });
    }

    document.getElementById('show-add-activity').addEventListener('click', () => {
        document.getElementById('add-activity-container').style.display = 'block';
    });
    document.getElementById('cancel-activity').addEventListener('click', () => {
        document.getElementById('add-activity-container').style.display = 'none';
    });

    addActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            category_id: selectedCategory.id,
            course_id: selectedCourse.id,
            title: document.getElementById('act-title').value,
            activity_type: document.getElementById('act-type').value,
            sequence_number: document.getElementById('act-sequence').value,
            description: document.getElementById('act-desc').value
        };
        const response = await fetch('../api/courses.php?type=activities', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response.ok) {
            addActivityForm.reset();
            document.getElementById('add-activity-container').style.display = 'none';
            loadActivities();
        }
    });

    // --- Core SPA logic (Login/Reg/Student) ---

    // Initial state
    updateNavbar();
    if (currentUser) {
        if (currentUser.role === 'instructor') {
            switchView(instructorDashboard);
            loadInstructorCourses();
        } else {
            switchView(studentDashboard);
            document.getElementById('student-name-display').textContent = currentUser.name.split(' ')[0];
            loadStudentCourses();
        }
    }

    // Login/Logout/Reg Handlers (truncated for brevity but assumed present)
    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.reload();
    }));

    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = { email: document.getElementById('login-email').value, password: document.getElementById('login-password').value };
            const response = await fetch('../api/login.php', { method: 'POST', body: JSON.stringify(data) });
            const result = await response.json();
            if (response.ok) { localStorage.setItem('currentUser', JSON.stringify(result.user)); window.location.reload(); }
        });
    }

    if(addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = { instructor_id: currentUser.id, title: document.getElementById('course-title').value, description: document.getElementById('course-desc').value };
            const response = await fetch('../api/courses.php?type=courses', { method: 'POST', body: JSON.stringify(data) });
            if (response.ok) { loadInstructorCourses(); addCourseForm.reset(); }
        });
    }

    async function loadStudentCourses(search = '') {
        const response = await fetch(`../api/courses.php?type=courses${search ? '&search=' + search : ''}`);
        const courses = await response.json();
        const grid = document.getElementById('student-courses-grid');
        grid.innerHTML = '';
        courses.forEach(c => {
            const el = document.createElement('div');
            el.className = 'course-card';
            el.style.padding = '1rem';
            el.innerHTML = `<h3>${c.title}</h3><p>${c.description}</p><p>By: ${c.instructor_name}</p>`;
            grid.appendChild(el);
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
});
