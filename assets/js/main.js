document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const authContainer = document.querySelector('.auth-container');
    const navbar = document.getElementById('navbar');

    const instructorCoursesSection = document.getElementById('instructor-courses-section');
    const courseManagerSection = document.getElementById('course-manager-section');
    const breadcrumb = document.getElementById('course-breadcrumb');
    
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
        
        // RESET STATE for new course
        selectedCategory = null;
        const noCatMsg = document.getElementById('no-category-selected');
        const catDetails = document.getElementById('category-details');
        const actList = document.getElementById('activities-list');
        
        if(noCatMsg) noCatMsg.style.display = 'block';
        if(catDetails) catDetails.style.display = 'none';
        if(actList) actList.innerHTML = '';
        
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
            el.style.display = 'flex'; el.style.justifyContent = 'space-between'; el.style.alignItems = 'center';
            
            el.innerHTML = `
                <span style="font-weight: 500;">${cat.name}</span>
                <div class="category-options" style="position: relative;">
                    <button class="cat-menu-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;">
                        <i data-lucide="more-vertical" style="width: 16px; height: 16px;"></i>
                    </button>
                    <div class="cat-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100; min-width: 120px; overflow: hidden;">
                        <button class="rename-cat-btn" style="width: 100%; text-align: left; padding: 10px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem;">Rename</button>
                        <button class="delete-cat-btn" style="width: 100%; text-align: left; padding: 10px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem; color: red;">Delete</button>
                    </div>
                </div>
            `;

            const menuBtn = el.querySelector('.cat-menu-btn');
            const dropdown = el.querySelector('.cat-dropdown');
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.cat-dropdown').forEach(d => { if(d !== dropdown) d.style.display = 'none'; });
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });

            el.querySelector('.rename-cat-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                dropdown.style.display = 'none';
                const newName = prompt('Enter new module name:', cat.name);
                if(newName && newName !== cat.name) {
                    const res = await fetch('../api/courses.php?type=categories', { method: 'PUT', body: JSON.stringify({ id: cat.id, name: newName }) });
                    if(res.ok) { if(selectedCategory?.id == cat.id) selectedCategory.name = newName; loadCategories(); }
                }
            });

            el.querySelector('.delete-cat-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                dropdown.style.display = 'none';
                if(confirm(`Are you sure you want to delete "${cat.name}" and all its activities?`)) {
                    const res = await fetch(`../api/courses.php?type=categories&id=${cat.id}`, { method: 'DELETE' });
                    if(res.ok) { if(selectedCategory?.id == cat.id) { selectedCategory = null; document.getElementById('no-category-selected').style.display = 'block'; document.getElementById('category-details').style.display = 'none'; } loadCategories(); }
                }
            });

            el.addEventListener('click', (e) => {
                if(e.target.closest('.category-options')) return;
                selectedCategory = cat;
                loadCategories();
                openActivityManager();
            });
            list.appendChild(el);
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }

    document.addEventListener('click', () => { document.querySelectorAll('.cat-dropdown').forEach(d => d.style.display = 'none'); });

    addCategoryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('cat-name').value;
        const response = await fetch('../api/courses.php?type=categories', { method: 'POST', body: JSON.stringify({ course_id: selectedCourse.id, name }) });
        if (response.ok) { addCategoryForm.reset(); loadCategories(); }
    });

    function openActivityManager() {
        const noCatMsg = document.getElementById('no-category-selected');
        const catDetails = document.getElementById('category-details');
        const catTitle = document.getElementById('selected-category-name');
        if(noCatMsg) noCatMsg.style.display = 'none';
        if(catDetails) catDetails.style.display = 'block';
        if(catTitle) catTitle.textContent = selectedCategory.name;
        loadCurriculumItems();
    }

    function getPreviewHTML(url, type) {
        if (!url) return '';
        if (url.includes('docs.google.com/forms')) {
            const embedUrl = url.includes('/viewform') ? url.replace('/viewform', '/viewform?embedded=true') : url;
            return `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0" style="border-radius: 10px; background: white;">Loading…</iframe>`;
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const vidId = url.split('v=')[1] || url.split('/').pop();
            return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen style="border-radius: 10px;"></iframe>`;
        }
        if (type === 'pdf' || url.endsWith('.pdf')) {
            return `<iframe src="${url}" width="100%" height="500px" style="border: none; border-radius: 10px;"></iframe>`;
        }
        return `<div style="padding: 1rem; background: #eee; border-radius: 10px; text-align: center;">
                    <a href="${url}" target="_blank" style="color: var(--secondary-color); font-weight: 600;">Open Resource <i data-lucide="external-link" style="width: 14px;"></i></a>
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

            // Materials
            if(materials.length > 0) {
                const matHeader = document.createElement('h5');
                matHeader.textContent = "Learning Materials"; matHeader.style.margin = "1rem 0 0.5rem"; list.appendChild(matHeader);
                materials.forEach(mat => {
                    const container = document.createElement('div'); container.style.marginBottom = '10px';
                    const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1rem'; card.style.borderLeft = '4px solid #2ecc71'; card.style.cursor = 'pointer';
                    card.innerHTML = `
                        <div class="card-main-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #27ae60;">${mat.title}</strong>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <button class="edit-mat-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;"><i data-lucide="pencil" style="width: 16px; height: 16px;"></i></button>
                                <i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i>
                            </div>
                        </div>
                        <div class="edit-mode" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                            <form class="inline-edit-form">
                                <div class="form-group"><label>Title</label><input type="text" value="${mat.title}" class="edit-title" required></div>
                                <div class="form-group"><label>URL</label><input type="url" value="${mat.url}" class="edit-url" required></div>
                                <div class="form-group"><label>Description</label><textarea class="edit-desc" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd; height: 80px;">${mat.description || ''}</textarea></div>
                                <div class="form-group"><label>Type</label><select class="edit-type" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd;">
                                    <option value="link" ${mat.material_type === 'link' ? 'selected' : ''}>Link</option>
                                    <option value="pdf" ${mat.material_type === 'pdf' ? 'selected' : ''}>PDF</option>
                                    <option value="video" ${mat.material_type === 'video' ? 'selected' : ''}>Video</option>
                                </select></div>
                                <div style="display: flex; gap: 10px;"><button type="submit" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; background: #27ae60;">Save</button><button type="button" class="cancel-edit btn btn-outline" style="flex: 1; font-size: 0.8rem;">Cancel</button></div>
                            </form>
                        </div>
                        <div class="preview-content" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">${mat.description || 'No description provided.'}</p>${getPreviewHTML(mat.url, mat.material_type)}</div>
                    `;
                    card.addEventListener('click', (e) => { if(e.target.closest('.edit-mat-btn') || e.target.closest('.edit-mode')) return; const preview = card.querySelector('.preview-content'); const icon = card.querySelector('.dropdown-icon'); const isOpen = preview.style.display === 'block'; preview.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; });
                    card.querySelector('.edit-mat-btn').addEventListener('click', (e) => { e.stopPropagation(); card.querySelector('.edit-mode').style.display = 'block'; card.querySelector('.preview-content').style.display = 'none'; });
                    card.querySelector('.cancel-edit').addEventListener('click', (e) => { e.stopPropagation(); card.querySelector('.edit-mode').style.display = 'none'; });
                    card.querySelector('.inline-edit-form').addEventListener('submit', async (e) => { e.preventDefault(); const data = { id: mat.id, title: card.querySelector('.edit-title').value, url: card.querySelector('.edit-url').value, description: card.querySelector('.edit-desc').value, material_type: card.querySelector('.edit-type').value }; const response = await fetch('../api/courses.php?type=materials', { method: 'PUT', body: JSON.stringify(data) }); if(response.ok) loadCurriculumItems(); });
                    container.appendChild(card); list.appendChild(container);
                });
            }

            // Activities
            const actHeader = document.createElement('h5');
            actHeader.textContent = "Google Form Activities"; actHeader.style.margin = "2rem 0 0.5rem"; list.appendChild(actHeader);
            if(activities.length === 0) {
                const empty = document.createElement('p'); empty.style.textAlign = 'center'; empty.style.color = '#999'; empty.style.padding = '2rem'; empty.textContent = 'No activities yet.'; list.appendChild(empty);
            } else {
                activities.forEach(act => {
                    const container = document.createElement('div'); container.style.marginBottom = '10px';
                    const el = document.createElement('div'); el.className = 'course-card'; el.style.padding = '1rem'; el.style.borderLeft = '4px solid var(--secondary-color)'; el.style.cursor = 'pointer';
                    el.innerHTML = `
                        <div class="card-main-header" style="display: flex; justify-content: space-between; align-items: center;">
                            <div><strong>${act.title}</strong><span style="font-size: 0.65rem; color: #999; margin-left: 10px;">Google Form</span></div>
                            <div style="display: flex; gap: 10px; align-items: center;"><button class="edit-act-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;"><i data-lucide="pencil" style="width: 16px; height: 16px;"></i></button><i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i></div>
                        </div>
                        <div class="edit-mode" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                            <form class="inline-edit-act-form">
                                <div class="form-group"><label>Title</label><input type="text" value="${act.title}" class="edit-title" required></div>
                                <div class="form-group"><label>Google Form Link</label><input type="url" value="${act.content_url || ''}" class="edit-url" required></div>
                                <div style="display: grid; grid-template-columns: 1fr 3fr; gap: 1rem;"><div class="form-group"><label>Seq #</label><input type="number" value="${act.sequence_number ?? 0}" class="edit-seq" style="width: 100%;"></div><div class="form-group"><label>Description</label><input type="text" value="${act.description || ''}" class="edit-desc" style="width: 100%;"></div></div>
                                <div style="display: flex; gap: 10px;"><button type="submit" class="btn btn-primary" style="flex: 1; font-size: 0.8rem;">Save Changes</button><button type="button" class="cancel-edit-act btn btn-outline" style="flex: 1; font-size: 0.8rem;">Cancel</button></div>
                            </form>
                        </div>
                        <div class="preview-content" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">${act.description || 'Follow the link below to complete the activity.'}</p>${getPreviewHTML(act.content_url, 'google_form')}</div>
                    `;
                    el.addEventListener('click', (e) => { if(e.target.closest('.edit-act-btn') || e.target.closest('.edit-mode')) return; const preview = el.querySelector('.preview-content'); const icon = el.querySelector('.dropdown-icon'); const isOpen = preview.style.display === 'block'; preview.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; });
                    el.querySelector('.edit-act-btn').addEventListener('click', (e) => { e.stopPropagation(); el.querySelector('.edit-mode').style.display = 'block'; el.querySelector('.preview-content').style.display = 'none'; });
                    el.querySelector('.cancel-edit-act').addEventListener('click', (e) => { e.stopPropagation(); el.querySelector('.edit-mode').style.display = 'none'; });
                    el.querySelector('.inline-edit-act-form').addEventListener('submit', async (e) => { e.preventDefault(); const data = { id: act.id, title: el.querySelector('.edit-title').value, content_url: el.querySelector('.edit-url').value, sequence_number: el.querySelector('.edit-seq').value || 0, description: el.querySelector('.edit-desc').value, activity_type: 'google_form' }; const response = await fetch('../api/courses.php?type=activities', { method: 'PUT', body: JSON.stringify(data) }); if(response.ok) loadCurriculumItems(); });
                    container.appendChild(el); list.appendChild(container);
                });
            }
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {}
    }

    // Add Handlers
    document.getElementById('show-add-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'block'; document.getElementById('add-material-container').style.display = 'none'; });
    document.getElementById('cancel-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'none'; });
    document.getElementById('show-add-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'block'; document.getElementById('add-activity-container').style.display = 'none'; });
    document.getElementById('cancel-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'none'; });

    addActivityForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { category_id: selectedCategory.id, course_id: selectedCourse.id, title: document.getElementById('act-title').value, content_url: document.getElementById('act-url').value, activity_type: 'google_form', sequence_number: document.getElementById('act-sequence').value || 0, description: document.getElementById('act-desc-simple').value };
        const response = await fetch('../api/courses.php?type=activities', { method: 'POST', body: JSON.stringify(data) });
        if (response.ok) { addActivityForm.reset(); document.getElementById('act-sequence').value = 0; document.getElementById('add-activity-container').style.display = 'none'; loadCurriculumItems(); }
    });

    addMaterialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = { course_id: selectedCourse.id, title: document.getElementById('mat-title').value, description: document.getElementById('mat-desc').value, url: document.getElementById('mat-url').value, material_type: document.getElementById('mat-type').value };
        const response = await fetch('../api/courses.php?type=materials', { method: 'POST', body: JSON.stringify(data) });
        if (response.ok) { addMaterialForm.reset(); document.getElementById('add-material-container').style.display = 'none'; loadCurriculumItems(); }
    });

    // SPA Logic
    updateNavbar();
    if (currentUser) {
        if (currentUser.role === 'instructor') { switchView(instructorDashboard); loadInstructorCourses(); }
        else { switchView(studentDashboard); const nameDisplay = document.getElementById('student-name-display'); if(nameDisplay) nameDisplay.textContent = currentUser.name.split(' ')[0]; loadStudentCourses(); }
    }
    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => { localStorage.removeItem('currentUser'); window.location.reload(); }));
    if(loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { email: document.getElementById('login-email').value, password: document.getElementById('login-password').value }; const response = await fetch('../api/login.php', { method: 'POST', body: JSON.stringify(data) }); const result = await response.json(); if (response.ok) { localStorage.setItem('currentUser', JSON.stringify(result.user)); window.location.reload(); } }); }
    if(addCourseForm) { addCourseForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { instructor_id: currentUser.id, title: document.getElementById('course-title').value, description: document.getElementById('course-desc').value }; const response = await fetch('../api/courses.php?type=courses', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { loadInstructorCourses(); addCourseForm.reset(); } }); }
    async function loadStudentCourses(search = '') {
        const response = await fetch(`../api/courses.php?type=courses${search ? '&search=' + search : ''}`);
        const courses = await response.json();
        const grid = document.getElementById('student-courses-grid'); if(!grid) return; grid.innerHTML = '';
        courses.forEach(c => { const el = document.createElement('div'); el.className = 'course-card'; el.style.padding = '1rem'; el.innerHTML = `<h3>${c.title}</h3><p>${c.description}</p><p>By: ${c.instructor_name}</p>`; grid.appendChild(el); });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
});
