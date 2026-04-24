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
    const addMaterialForm = document.getElementById('add-material-form');

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
            if(navGuest) navGuest.style.display = 'flex';
            if(navStudent) navStudent.style.display = 'none';
            if(navInstructor) navInstructor.style.display = 'none';
            if(authContainer) authContainer.style.alignItems = 'center';
        } else {
            if(authContainer) authContainer.style.alignItems = 'flex-start';
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

    // --- Instructor Actions ---
    
    async function loadInstructorCourses() {
        try {
            const response = await fetch(`../api/courses.php?type=courses&instructor_id=${currentUser.id}`);
            const courses = await response.json();
            const list = document.getElementById('instructor-courses-list');
            if(!list) return;
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
        loadInstructorCourses();
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
                loadCategories();
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

    // Activities & Materials
    function openActivityManager() {
        const noCatMsg = document.getElementById('no-category-selected');
        const catDetails = document.getElementById('category-details');
        const catTitle = document.getElementById('selected-category-name');
        
        if(noCatMsg) noCatMsg.style.display = 'none';
        if(catDetails) catDetails.style.display = 'block';
        if(catTitle) catTitle.textContent = selectedCategory.name;
        
        loadCurriculumItems();
    }

    // Preview Logic
    function getPreviewHTML(url, type) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const vidId = url.split('v=')[1] || url.split('/').pop();
            return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen style="border-radius: 10px;"></iframe>`;
        }
        if (type === 'pdf' || url.endsWith('.pdf')) {
            return `<iframe src="${url}" width="100%" height="500px" style="border: none; border-radius: 10px;"></iframe>`;
        }
        return `<div style="padding: 1rem; background: #eee; border-radius: 10px; text-align: center;">
                    <p style="margin-bottom: 0.5rem;">Resource Link Preview</p>
                    <a href="${url}" target="_blank" style="color: var(--secondary-color); font-weight: 600;">Open External Resource <i data-lucide="external-link" style="width: 14px;"></i></a>
                </div>`;
    }

    async function loadCurriculumItems() {
        const list = document.getElementById('activities-list');
        if(!list) return;
        list.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading curriculum...</p>';

        try {
            const actRes = await fetch(`../api/courses.php?type=activities&category_id=${selectedCategory.id}`);
            const activities = await actRes.json();
            const matRes = await fetch(`../api/courses.php?type=materials&course_id=${selectedCourse.id}`);
            const materials = await matRes.json();

            list.innerHTML = '';

            // 1. Render Materials
            if(materials.length > 0) {
                const matHeader = document.createElement('h5');
                matHeader.textContent = "General Materials";
                matHeader.style.margin = "1rem 0 0.5rem";
                list.appendChild(matHeader);

                materials.forEach(mat => {
                    const container = document.createElement('div');
                    container.style.marginBottom = '10px';
                    
                    const card = document.createElement('div');
                    card.className = 'course-card';
                    card.style.padding = '1rem'; card.style.borderLeft = '4px solid #2ecc71'; card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div style="flex: 1;">
                                <strong style="color: #27ae60;">${mat.title}</strong>
                                <p style="font-size: 0.85rem; color: #666; margin-bottom: 0.2rem;">${mat.description || ''}</p>
                                <p style="font-size: 0.75rem; color: #999;">Type: ${mat.material_type}</p>
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button class="edit-mat-btn" data-id="${mat.id}" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;">
                                    <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
                                </button>
                                <i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i>
                            </div>
                        </div>
                        <div class="preview-content" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                            ${getPreviewHTML(mat.url, mat.material_type)}
                        </div>
                    `;

                    // Toggle logic
                    card.addEventListener('click', (e) => {
                        // Prevent toggle if clicking edit button
                        if(e.target.closest('.edit-mat-btn')) return;
                        
                        const preview = card.querySelector('.preview-content');
                        const icon = card.querySelector('.dropdown-icon');
                        const isOpen = preview.style.display === 'block';
                        preview.style.display = isOpen ? 'none' : 'block';
                        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
                    });

                    // Edit button logic
                    card.querySelector('.edit-mat-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        alert('Edit Material feature coming in next step!');
                    });

                    container.appendChild(card);
                    list.appendChild(container);
                });
            }

            // 2. Render Activities
            const actHeader = document.createElement('h5');
            actHeader.textContent = "Module Activities";
            actHeader.style.margin = "2rem 0 0.5rem";
            list.appendChild(actHeader);

            if(activities.length === 0) {
                const emptyMsg = document.createElement('p');
                emptyMsg.style.textAlign = 'center'; emptyMsg.style.color = '#999'; emptyMsg.style.padding = '2rem';
                emptyMsg.textContent = 'No activities in this module yet.';
                list.appendChild(emptyMsg);
            } else {
                activities.forEach(act => {
                    const el = document.createElement('div');
                    el.className = 'course-card';
                    el.style.padding = '1rem'; el.style.borderLeft = '4px solid var(--secondary-color)'; el.style.marginBottom = '10px';
                    const seqStr = act.sequence_number ? `${act.sequence_number}. ` : '';
                    el.innerHTML = `
                        <div style="display: flex; justify-content: space-between;">
                            <strong>${seqStr}${act.title}</strong>
                            <span style="font-size: 0.75rem; text-transform: uppercase; background: #eee; padding: 2px 8px; border-radius: 4px;">${act.activity_type}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: #666; margin-top: 5px;">${act.description}</p>
                    `;
                    list.appendChild(el);
                });
            }
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {
            list.innerHTML = `<p style="color: red; text-align: center; padding: 2rem;">Error loading curriculum: ${error.message}</p>`;
        }
    }

    // Modal Toggles
    document.getElementById('show-add-activity').addEventListener('click', () => {
        document.getElementById('add-activity-container').style.display = 'block';
        document.getElementById('add-material-container').style.display = 'none';
    });
    document.getElementById('cancel-activity').addEventListener('click', () => {
        document.getElementById('add-activity-container').style.display = 'none';
    });

    document.getElementById('show-add-material').addEventListener('click', () => {
        document.getElementById('add-material-container').style.display = 'block';
        document.getElementById('add-activity-container').style.display = 'none';
    });
    document.getElementById('cancel-material').addEventListener('click', () => {
        document.getElementById('add-material-container').style.display = 'none';
    });

    // Submissions
    addActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            category_id: selectedCategory.id,
            course_id: selectedCourse.id,
            title: document.getElementById('act-title').value,
            activity_type: document.getElementById('act-type').value,
            sequence_number: document.getElementById('act-sequence').value || null,
            description: document.getElementById('act-desc').value
        };
        const response = await fetch('../api/courses.php?type=activities', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response.ok) {
            addActivityForm.reset();
            document.getElementById('add-activity-container').style.display = 'none';
            loadCurriculumItems();
        }
    });

    addMaterialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            course_id: selectedCourse.id,
            title: document.getElementById('mat-title').value,
            description: document.getElementById('mat-desc').value,
            url: document.getElementById('mat-url').value,
            material_type: document.getElementById('mat-type').value
        };
        const response = await fetch('../api/courses.php?type=materials', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (response.ok) {
            addMaterialForm.reset();
            document.getElementById('add-material-container').style.display = 'none';
            loadCurriculumItems();
        }
    });

    // --- Core SPA logic ---

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
    }
});
