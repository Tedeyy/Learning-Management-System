document.addEventListener('DOMContentLoaded', () => {
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');
    const navbar = document.getElementById('navbar');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const addCourseForm = document.getElementById('add-course-form');
    
    const loginMsg = document.getElementById('login-message');
    const registerMsg = document.getElementById('register-message');
    const addCourseMsg = document.getElementById('add-course-message');

    // State
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    const switchView = (viewToShow) => {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        setTimeout(() => {
            viewToShow.classList.add('active');
            if (viewToShow === instructorDashboard || viewToShow === studentDashboard) {
                if(navbar) navbar.style.display = 'none';
            } else {
                if(navbar) navbar.style.display = 'block';
            }
        }, 100);
    };

    const showMessage = (element, message, isError = true) => {
        element.textContent = message;
        element.style.color = isError ? '#e74c3c' : '#2ecc71';
        element.style.display = 'block';
    };

    // Initial state
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

    // Auth toggles
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(registerView);
        toggleAuthBtn.textContent = 'Login';
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(loginView);
        toggleAuthBtn.textContent = 'Sign Up';
    });

    // Logout
    const logout = () => {
        localStorage.removeItem('currentUser');
        currentUser = null;
        window.location.reload();
    };

    document.getElementById('logout-btn-instructor').addEventListener('click', logout);
    document.getElementById('logout-btn-student').addEventListener('click', logout);

    // Registration
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

    // Login
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

    // Course management logic (instructor/student)
    async function loadInstructorCourses() {
        try {
            const response = await fetch(`../api/courses.php?instructor_id=${currentUser.id}`);
            const courses = await response.json();
            const list = document.getElementById('instructor-courses-list');
            list.innerHTML = courses.length ? '' : '<p>No courses yet.</p>';
            courses.forEach(c => {
                const el = document.createElement('div');
                el.className = 'course-card';
                el.style.padding = '1rem'; el.style.marginBottom = '1rem';
                el.innerHTML = `<h4>${c.title}</h4><p>${c.description}</p>`;
                list.appendChild(el);
            });
        } catch (e) {}
    }

    async function loadStudentCourses(search = '') {
        try {
            const response = await fetch(`../api/courses.php${search ? '?search=' + search : ''}`);
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
        } catch (e) {}
    }

    const searchInput = document.getElementById('course-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => loadStudentCourses(e.target.value));
    }

    if (addCourseForm) {
        addCourseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                instructor_id: currentUser.id,
                title: document.getElementById('course-title').value,
                description: document.getElementById('course-desc').value
            };
            const response = await fetch('../api/courses.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) { loadInstructorCourses(); addCourseForm.reset(); }
        });
    }
});
