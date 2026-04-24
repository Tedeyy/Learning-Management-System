document.addEventListener('DOMContentLoaded', () => {
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const navbar = document.getElementById('navbar');
    const authContainer = document.querySelector('.auth-container');

    // Navbar Sections
    const navGuest = document.getElementById('nav-guest');
    const navStudent = document.getElementById('nav-student');
    const navInstructor = document.getElementById('nav-instructor');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const addCourseForm = document.getElementById('add-course-form');
    
    const loginMsg = document.getElementById('login-message');
    const registerMsg = document.getElementById('register-message');
    const addCourseMsg = document.getElementById('add-course-message');

    // State
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    const updateNavbar = () => {
        if (navbar) navbar.style.display = 'block'; // Ensure navbar is visible
        
        if (!currentUser) {
            if(navGuest) navGuest.style.display = 'flex';
            if(navStudent) navStudent.style.display = 'none';
            if(navInstructor) navInstructor.style.display = 'none';
            if(authContainer) authContainer.style.alignItems = 'center';
        } else {
            if(authContainer) authContainer.style.alignItems = 'flex-start'; // Align to top for dashboards
            if(navGuest) navGuest.style.display = 'none';
            
            if (currentUser.role === 'instructor') {
                if(navStudent) navStudent.style.display = 'none';
                if(navInstructor) navInstructor.style.display = 'flex';
            } else {
                if(navStudent) navStudent.style.display = 'flex';
                if(navInstructor) navInstructor.style.display = 'none';
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

    const showMessage = (element, message, isError = true) => {
        element.textContent = message;
        element.style.color = isError ? '#e74c3c' : '#2ecc71';
        element.style.display = 'block';
    };

    // Initial state
    updateNavbar();
    if (currentUser) {
        if (currentUser.role === 'instructor') {
            switchView(instructorDashboard);
            loadInstructorCourses();
        } else {
            switchView(studentDashboard);
            const nameDisplay = document.getElementById('student-name-display');
            if(nameDisplay) nameDisplay.textContent = currentUser.name.split(' ')[0];
            loadStudentCourses();
        }
    }

    // Auth toggles
    if(goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(registerView);
            if(toggleAuthBtn) toggleAuthBtn.textContent = 'Login';
        });
    }

    if(goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(loginView);
            if(toggleAuthBtn) toggleAuthBtn.textContent = 'Sign Up';
        });
    }

    // Logout logic
    const logout = () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        window.location.reload();
    };

    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    }));

    // Registration
    if(registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                first_name: document.getElementById('reg-fname').value,
                last_name: document.getElementById('reg-lname').value,
                middle_name: document.getElementById('reg-mname').value,
                role: document.getElementById('reg-role').value,
                birthdate: document.getElementById('reg-birthdate').value,
                gender: document.getElementById('reg-gender').value,
                address: document.getElementById('reg-address').value,
                contact_number: document.getElementById('reg-contact').value,
                email: document.getElementById('reg-email').value,
                password: document.getElementById('reg-password').value
            };

            try {
                const response = await fetch('../api/register.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    showMessage(registerMsg, 'Registration successful!', false);
                    setTimeout(() => switchView(loginView), 2000);
                } else {
                    showMessage(registerMsg, result.message);
                }
            } catch (error) {
                showMessage(registerMsg, 'Error connecting to server.');
            }
        });
    }

    // Login
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value
            };

            try {
                const response = await fetch('../api/login.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();
                if (response.ok) {
                    currentUser = result.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    window.location.reload();
                } else {
                    showMessage(loginMsg, result.message);
                }
            } catch (error) {
                showMessage(loginMsg, 'Error connecting to server.');
            }
        });
    }

    // Instructor: Add Course
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                instructor_id: currentUser.id,
                title: document.getElementById('course-title').value,
                description: document.getElementById('course-desc').value
            };

            try {
                const response = await fetch('../api/courses.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (response.ok) { 
                    loadInstructorCourses(); 
                    addCourseForm.reset(); 
                    showMessage(addCourseMsg, 'Course created successfully!', false);
                }
            } catch (error) {
                showMessage(addCourseMsg, 'Error creating course.');
            }
        });
    }

    // Instructor: Load Courses
    async function loadInstructorCourses() {
        try {
            const response = await fetch(`../api/courses.php?instructor_id=${currentUser.id}`);
            const courses = await response.json();
            const list = document.getElementById('instructor-courses-list');
            if(!list) return;
            list.innerHTML = courses.length ? '' : '<p>No courses yet.</p>';
            courses.forEach(c => {
                const el = document.createElement('div');
                el.className = 'course-card';
                el.style.padding = '1rem'; el.style.marginBottom = '1rem';
                el.innerHTML = `<h4>${c.title}</h4><p>${c.description}</p>`;
                list.appendChild(el);
            });
        } catch (e) { }
    }

    async function loadStudentCourses(search = '') {
        try {
            const response = await fetch(`../api/courses.php${search ? '?search=' + search : ''}`);
            const courses = await response.json();
            const grid = document.getElementById('student-courses-grid');
            if(!grid) return;
            grid.innerHTML = '';
            courses.forEach(c => {
                const el = document.createElement('div');
                el.className = 'course-card';
                el.style.padding = '1rem';
                el.innerHTML = `<h3>${c.title}</h3><p>${c.description}</p><p>By: ${c.instructor_name}</p>`;
                grid.appendChild(el);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) { }
    }

    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadStudentCourses(e.target.value));
    }
});
