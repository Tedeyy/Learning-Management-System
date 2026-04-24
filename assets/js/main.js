document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const learningView = document.getElementById('learning-view'); 
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
    const searchInput = document.getElementById('course-search');

    // Learning View Elements
    const learningCategoriesList = document.getElementById('learning-categories-list');
    const learningActivityContent = document.getElementById('learning-activity-content');
    const learningNoSelection = document.getElementById('learning-no-selection');
    const learningCurriculumItems = document.getElementById('learning-curriculum-items');
    const backToCatalogBtn = document.getElementById('back-to-catalog');

    // Instructor Modal Elements
    const instructorModalOverlay = document.getElementById('instructor-modal-overlay');
    const instructorModalContent = document.getElementById('instructor-modal-content');
    const closeInstructorModal = document.getElementById('close-instructor-modal');

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
            if(!list || !Array.isArray(courses)) return;
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
        selectedCategory = null;
        
        // Reset Tabs
        document.querySelectorAll('.instructor-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === 'modules');
            btn.style.color = btn.dataset.tab === 'modules' ? 'var(--primary-color)' : '#999';
            btn.style.borderBottomColor = btn.dataset.tab === 'modules' ? 'var(--primary-color)' : 'transparent';
        });
        document.getElementById('tab-modules-view').style.display = 'block';
        document.getElementById('tab-enrollees-view').style.display = 'none';

        const noCatMsg = document.getElementById('no-category-selected');
        const catDetails = document.getElementById('category-details');
        const actList = document.getElementById('activities-list');
        if(noCatMsg) noCatMsg.style.display = 'block';
        if(catDetails) catDetails.style.display = 'none';
        if(actList) actList.innerHTML = '';
        loadCategories();
    }

    document.querySelectorAll('.instructor-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.instructor-tab').forEach(b => {
                b.classList.remove('active'); b.style.color = '#999'; b.style.borderBottomColor = 'transparent';
            });
            btn.classList.add('active'); btn.style.color = 'var(--primary-color)'; btn.style.borderBottomColor = 'var(--primary-color)';

            if (btn.dataset.tab === 'modules') {
                document.getElementById('tab-modules-view').style.display = 'block';
                document.getElementById('tab-enrollees-view').style.display = 'none';
            } else {
                document.getElementById('tab-modules-view').style.display = 'none';
                document.getElementById('tab-enrollees-view').style.display = 'block';
                loadEnrollees();
            }
        });
    });

    async function loadEnrollees() {
        const list = document.getElementById('enrollees-list');
        list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: #999;">Loading enrollees...</td></tr>';
        
        try {
            const res = await fetch(`../api/courses.php?type=course_enrollees&course_id=${selectedCourse.id}`);
            const students = await res.json();
            
            if (!Array.isArray(students) || students.length === 0) {
                list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 3rem; color: #999;">No students enrolled yet.</td></tr>';
                return;
            }

            list.innerHTML = '';
            students.forEach(s => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #f9f9f9';
                const date = new Date(s.enrolled_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                
                tr.innerHTML = `
                    <td style="padding: 1rem; font-weight: 600; color: #333;">${s.first_name} ${s.last_name}</td>
                    <td style="padding: 1rem; color: #666;">${s.email}</td>
                    <td style="padding: 1rem; color: #999; font-size: 0.85rem;">${date}</td>
                    <td style="padding: 1rem; text-align: center; position: relative;">
                        <button class="enrollee-options-btn" style="border: none; background: none; cursor: pointer; color: #999;"><i data-lucide="more-vertical" style="width: 18px;"></i></button>
                        <div class="enrollee-dropdown" style="display: none; position: absolute; right: 2rem; top: 2.5rem; background: white; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; min-width: 160px; overflow: hidden;">
                            <button class="view-user-info-btn" data-id="${s.id}" style="width: 100%; text-align: left; padding: 12px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="user" style="width: 14px;"></i> User Information</button>
                            <button class="view-user-progress-btn" data-id="${s.id}" data-name="${s.first_name}" style="width: 100%; text-align: left; padding: 12px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="bar-chart-2" style="width: 14px;"></i> View Progress</button>
                            <button class="unenroll-user-btn" data-id="${s.id}" data-name="${s.first_name} ${s.last_name}" style="width: 100%; text-align: left; padding: 12px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem; color: #ff4d4d; border-top: 1px solid #f9f9f9; display: flex; align-items: center; gap: 8px;"><i data-lucide="user-minus" style="width: 14px;"></i> Unenroll</button>
                        </div>
                    </td>
                `;
                
                const optBtn = tr.querySelector('.enrollee-options-btn');
                const dropdown = tr.querySelector('.enrollee-dropdown');
                
                optBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.enrollee-dropdown').forEach(d => { if(d !== dropdown) d.style.display = 'none'; });
                    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                });

                tr.querySelector('.view-user-info-btn').addEventListener('click', () => { showUserInfo(s.id); dropdown.style.display = 'none'; });
                tr.querySelector('.view-user-progress-btn').addEventListener('click', () => { showUserProgress(s.id, s.first_name); dropdown.style.display = 'none'; });
                tr.querySelector('.unenroll-user-btn').addEventListener('click', () => { unenrollUser(s.id, `${s.first_name} ${s.last_name}`); dropdown.style.display = 'none'; });

                list.appendChild(tr);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {
            list.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem; color: red;">Error loading enrollees.</td></tr>';
        }
    }

    document.addEventListener('click', () => { document.querySelectorAll('.enrollee-dropdown').forEach(d => d.style.display = 'none'); });

    async function showUserInfo(userId) {
        instructorModalOverlay.style.display = 'flex';
        instructorModalContent.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading profile...</p>';
        try {
            const res = await fetch(`../api/courses.php?type=user_info&id=${userId}`);
            const u = await res.json();
            instructorModalContent.innerHTML = `
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="width: 80px; height: 80px; background: #f0f4ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--primary-color);">
                        <i data-lucide="user" style="width: 40px; height: 40px;"></i>
                    </div>
                    <h2 style="margin-bottom: 0.2rem;">${u.first_name} ${u.last_name}</h2>
                    <p style="color: #666;">Student Profile</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; text-align: left;">
                    <div><label style="font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700;">Email</label><p style="font-weight: 500;">${u.email}</p></div>
                    <div><label style="font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700;">Contact</label><p style="font-weight: 500;">${u.contact_number || 'N/A'}</p></div>
                    <div><label style="font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700;">Gender</label><p style="font-weight: 500;">${u.gender || 'N/A'}</p></div>
                    <div><label style="font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700;">Birthdate</label><p style="font-weight: 500;">${u.birthdate || 'N/A'}</p></div>
                </div>
                <div style="margin-top: 1.5rem;"><label style="font-size: 0.75rem; color: #999; text-transform: uppercase; font-weight: 700;">Address</label><p style="font-weight: 500;">${u.address || 'No address provided.'}</p></div>
            `;
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {}
    }

    async function showUserProgress(userId, userName) {
        instructorModalOverlay.style.display = 'flex';
        instructorModalContent.innerHTML = '<p style="text-align: center; padding: 2rem;">Calculating progress...</p>';
        try {
            const res = await fetch(`../api/courses.php?type=student_progress&student_id=${userId}&course_id=${selectedCourse.id}`);
            const progress = await res.json();
            instructorModalContent.innerHTML = `<h2 style="margin-bottom: 0.5rem;">${userName}'s Progress</h2><p style="color: #666; margin-bottom: 2rem;">Current standing in <strong>${selectedCourse.title}</strong></p><div id="progress-bars-list" style="display: grid; gap: 1.5rem;"></div>`;
            const list = instructorModalContent.querySelector('#progress-bars-list');
            progress.forEach(p => {
                const total = parseInt(p.total_acts) + parseInt(p.total_mats);
                const done = parseInt(p.done_acts) + parseInt(p.viewed_mats);
                const perc = total > 0 ? Math.round((done/total)*100) : 0;
                const el = document.createElement('div');
                el.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><span style="font-weight: 600; font-size: 0.9rem; color: #333;">${p.name}</span><span style="font-size: 0.8rem; font-weight: 700; color: ${perc === 100 ? '#2ecc71' : '#666'};">${perc}%</span></div><div style="height: 8px; width: 100%; background: #f0f0f0; border-radius: 10px; overflow: hidden;"><div style="height: 100%; width: ${perc}%; background: ${perc === 100 ? '#2ecc71' : 'var(--primary-color)'}; transition: width 0.8s ease;"></div></div><div style="display: flex; gap: 10px; margin-top: 5px; font-size: 0.7rem; color: #999;"><span><i data-lucide="check-circle" style="width: 10px; vertical-align: middle;"></i> ${p.done_acts}/${p.total_acts} Activities</span><span><i data-lucide="file-text" style="width: 10px; vertical-align: middle;"></i> ${p.viewed_mats}/${p.total_mats} Materials</span></div>`;
                list.appendChild(el);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {}
    }

    async function unenrollUser(userId, fullName) {
        if (confirm(`Are you sure you want to unenroll ${fullName} from this course? This action cannot be undone.`)) {
            const res = await fetch(`../api/courses.php?type=enrollments&course_id=${selectedCourse.id}&student_id=${userId}`, { method: 'DELETE' });
            if (res.ok) { loadEnrollees(); }
        }
    }

    if(closeInstructorModal) { closeInstructorModal.addEventListener('click', () => { instructorModalOverlay.style.display = 'none'; }); }
    instructorModalOverlay.addEventListener('click', (e) => { if(e.target === instructorModalOverlay) instructorModalOverlay.style.display = 'none'; });

    document.getElementById('back-to-courses').addEventListener('click', (e) => {
        e.preventDefault(); instructorCoursesSection.style.display = 'block'; courseManagerSection.style.display = 'none'; breadcrumb.style.display = 'none'; selectedCourse = null; selectedCategory = null; loadInstructorCourses();
    });

    async function loadCategories() {
        const response = await fetch(`../api/courses.php?type=categories&course_id=${selectedCourse.id}`);
        const categories = await response.json();
        const list = document.getElementById('categories-list'); if(!list || !Array.isArray(categories)) return;
        list.innerHTML = '';
        categories.forEach(cat => {
            const el = document.createElement('div'); el.className = `category-item ${selectedCategory?.id == cat.id ? 'active' : ''}`; el.style.padding = '1rem'; el.style.cursor = 'pointer'; el.style.borderRadius = '10px'; el.style.marginBottom = '5px'; el.style.background = selectedCategory?.id == cat.id ? '#f0f4ff' : 'transparent'; el.style.display = 'flex'; el.style.justifyContent = 'space-between'; el.style.alignItems = 'center';
            el.innerHTML = `<span style="font-weight: 500;">${cat.name}</span><div class="category-options" style="position: relative;"><button class="cat-menu-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;"><i data-lucide="more-vertical" style="width: 16px; height: 16px;"></i></button><div class="cat-dropdown" style="display: none; position: absolute; right: 0; top: 100%; background: white; border: 1px solid #eee; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 100; min-width: 120px; overflow: hidden;"><button class="rename-cat-btn" style="width: 100%; text-align: left; padding: 10px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem;">Rename</button><button class="delete-cat-btn" style="width: 100%; text-align: left; padding: 10px 15px; border: none; background: white; cursor: pointer; font-size: 0.85rem; color: red;">Delete</button></div></div>`;
            const menuBtn = el.querySelector('.cat-menu-btn'); const dropdown = el.querySelector('.cat-dropdown');
            menuBtn.addEventListener('click', (e) => { e.stopPropagation(); document.querySelectorAll('.cat-dropdown').forEach(d => { if(d !== dropdown) d.style.display = 'none'; }); dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none'; });
            el.querySelector('.rename-cat-btn').addEventListener('click', async (e) => { e.stopPropagation(); dropdown.style.display = 'none'; const newName = prompt('Enter new module name:', cat.name); if(newName && newName !== cat.name) { const res = await fetch('../api/courses.php?type=categories', { method: 'PUT', body: JSON.stringify(data) }); if(res.ok) { if(selectedCategory?.id == cat.id) selectedCategory.name = newName; loadCategories(); } } });
            el.querySelector('.delete-cat-btn').addEventListener('click', async (e) => { e.stopPropagation(); dropdown.style.display = 'none'; if(confirm(`Are you sure you want to delete "${cat.name}" and all its activities?`)) { const res = await fetch(`../api/courses.php?type=categories&id=${cat.id}`, { method: 'DELETE' }); if(res.ok) { if(selectedCategory?.id == cat.id) { selectedCategory = null; document.getElementById('no-category-selected').style.display = 'block'; document.getElementById('category-details').style.display = 'none'; } loadCategories(); } } });
            el.addEventListener('click', (e) => { if(e.target.closest('.category-options')) return; selectedCategory = cat; loadCategories(); openActivityManager(); });
            list.appendChild(el);
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }

    // --- Student Actions ---

    async function loadEnrolledCourses() {
        const res = await fetch(`../api/courses.php?type=enrollments&student_id=${currentUser.id}`);
        const enrolled = await res.json();
        const list = document.getElementById('enrolled-courses-list'); if(!list || !Array.isArray(enrolled)) return;
        list.innerHTML = enrolled.length ? '' : '<p style="color: #999; font-size: 0.85rem; text-align: center; padding: 1rem;">Explore the catalog to start learning!</p>';
        enrolled.forEach(c => {
            const el = document.createElement('div'); el.className = 'enrolled-item'; el.style.padding = '0.8rem 1rem'; el.style.borderRadius = '12px'; el.style.background = '#f8faff'; el.style.border = '1px solid #eef2ff'; el.style.cursor = 'pointer'; el.style.transition = 'all 0.2s ease';
            el.innerHTML = `<h5 style="margin-bottom: 2px; color: #333; font-size: 0.9rem;">${c.title}</h5><p style="font-size: 0.75rem; color: #666;">${c.instructor_name}</p>`;
            el.addEventListener('mouseover', () => { el.style.background = '#eff6ff'; el.style.borderColor = '#dbeafe'; });
            el.addEventListener('mouseout', () => { el.style.background = '#f8faff'; el.style.borderColor = '#eef2ff'; });
            el.addEventListener('click', () => { openLearningView(c); });
            list.appendChild(el);
        });
    }

    function openLearningView(course) {
        selectedCourse = course; selectedCourse.id = course.course_id || course.id; 
        document.getElementById('learning-course-title').textContent = course.title;
        learningNoSelection.style.display = 'block'; learningActivityContent.style.display = 'none';
        learningCategoriesList.innerHTML = '<p style="padding: 1rem; color: #999;">Loading modules...</p>';
        switchView(learningView); loadLearningCategories();
    }

    async function loadLearningCategories() {
        try {
            const response = await fetch(`../api/courses.php?type=categories&course_id=${selectedCourse.id}&student_id=${currentUser.id}`);
            const categories = await response.json();
            if (!Array.isArray(categories)) { learningCategoriesList.innerHTML = `<p style="padding: 1rem; color: #ff4d4d; font-size: 0.85rem;">Error loading modules.</p>`; return; }
            learningCategoriesList.innerHTML = '';
            let totalItems = 0; let totalCompleted = 0;
            categories.forEach(cat => {
                const t = parseInt(cat.total_items) || 0; const c = parseInt(cat.completed_items) || 0;
                const perc = t > 0 ? Math.round((c/t)*100) : 0; totalItems += t; totalCompleted += c;
                const el = document.createElement('div'); el.className = 'category-item'; el.style.padding = '15px'; el.style.borderRadius = '15px'; el.style.cursor = 'pointer'; el.style.transition = 'all 0.2s'; el.style.marginBottom = '10px'; el.style.background = selectedCategory?.id == cat.id ? '#e8f0fe' : '#f9f9fb'; el.style.border = selectedCategory?.id == cat.id ? '1px solid var(--primary-color)' : '1px solid #eee';
                const progressBarHTML = t > 0 ? `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;"><span style="font-weight: 600; font-size: 0.95rem; color: ${selectedCategory?.id == cat.id ? 'var(--primary-color)' : '#333'}">${cat.name}</span><span style="font-size: 0.75rem; font-weight: 700; color: #666;">${perc}%</span></div><div style="height: 6px; width: 100%; background: #eee; border-radius: 10px; overflow: hidden;"><div style="height: 100%; width: ${perc}%; background: ${perc === 100 ? '#2ecc71' : 'var(--primary-color)'}; transition: width 0.5s ease;"></div></div>` : `<span style="font-weight: 600; font-size: 0.95rem; color: ${selectedCategory?.id == cat.id ? 'var(--primary-color)' : '#333'}">${cat.name}</span>`;
                el.innerHTML = progressBarHTML; el.addEventListener('click', () => { selectedCategory = cat; loadLearningCategories(); loadLearningCurriculum(); });
                learningCategoriesList.appendChild(el);
            });
            if (totalItems > 0) {
                const totalPerc = Math.round((totalCompleted/totalItems)*100); const totalContainer = document.createElement('div'); totalContainer.style.marginTop = '2rem'; totalContainer.style.paddingTop = '1.5rem'; totalContainer.style.borderTop = '1px solid #eee';
                totalContainer.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><span style="font-weight: 700; font-size: 0.85rem; color: #666; text-transform: uppercase;">Total Progress</span><span style="font-weight: 800; font-size: 1.1rem; color: var(--secondary-color);">${totalPerc}%</span></div><div style="height: 10px; width: 100%; background: #eee; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);"><div style="height: 100%; width: ${totalPerc}%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div></div>`;
                learningCategoriesList.appendChild(totalContainer);
                
                // Add discreet Unenroll Button outside the progress div
                const unenrollContainer = document.createElement('div'); unenrollContainer.style.marginTop = '1.5rem'; unenrollContainer.style.textAlign = 'center';
                unenrollContainer.innerHTML = `<button id="student-unenroll-trigger" style="background: none; border: none; color: #999; font-size: 0.75rem; cursor: pointer; text-decoration: underline; transition: color 0.2s;">Leave this course</button><div id="unenroll-confirm-pane" style="display: none; margin-top: 10px; padding: 12px; background: #fff5f5; border-radius: 10px; border: 1px solid #ffe3e3;"><p style="font-size: 0.75rem; color: #c53030; margin-bottom: 8px; font-weight: 600;">Are you sure? All progress will be lost.</p><div style="display: flex; gap: 10px; justify-content: center;"><button id="final-unenroll-btn" style="background: #e53e3e; color: white; border: none; padding: 5px 12px; border-radius: 5px; font-size: 0.7rem; font-weight: 700; cursor: pointer;">Yes, Leave</button><button id="cancel-unenroll-btn" style="background: #edf2f7; color: #4a5568; border: none; padding: 5px 12px; border-radius: 5px; font-size: 0.7rem; cursor: pointer;">Cancel</button></div></div>`;
                learningCategoriesList.appendChild(unenrollContainer);

                const trigger = unenrollContainer.querySelector('#student-unenroll-trigger');
                const pane = unenrollContainer.querySelector('#unenroll-confirm-pane');
                trigger.addEventListener('click', () => { trigger.style.display = 'none'; pane.style.display = 'block'; });
                unenrollContainer.querySelector('#cancel-unenroll-btn').addEventListener('click', () => { trigger.style.display = 'inline'; pane.style.display = 'none'; });
                unenrollContainer.querySelector('#final-unenroll-btn').addEventListener('click', async () => {
                    const res = await fetch(`../api/courses.php?type=enrollments&course_id=${selectedCourse.id}&student_id=${currentUser.id}`, { method: 'DELETE' });
                    if(res.ok) { selectedCourse = null; selectedCategory = null; switchView(studentDashboard); loadStudentCourses(); loadEnrolledCourses(); }
                });
            }
        } catch (error) { learningCategoriesList.innerHTML = `<p style="padding: 1rem; color: #ff4d4d;">System Error.</p>`; }
    }

    async function loadLearningCurriculum() {
        learningNoSelection.style.display = 'none'; learningActivityContent.style.display = 'block';
        document.getElementById('learning-module-name').textContent = selectedCategory.name;
        learningCurriculumItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading lessons...</p>';
        try {
            const actRes = await fetch(`../api/courses.php?type=activities&category_id=${selectedCategory.id}&student_id=${currentUser.id}`);
            const activities = await actRes.json();
            const matRes = await fetch(`../api/courses.php?type=materials&category_id=${selectedCategory.id}&student_id=${currentUser.id}`);
            const materials = await matRes.json();
            if (!Array.isArray(activities) || !Array.isArray(materials)) { learningCurriculumItems.innerHTML = '<p style="padding: 2rem; color: red;">Failed to load curriculum.</p>'; return; }
            if (activities.length === 0 && materials.length === 0) { learningCurriculumItems.innerHTML = '<p style="text-align: center; padding: 3rem; color: #999;">This module is empty. Check back later!</p>'; return; }
            learningCurriculumItems.innerHTML = '';
            materials.forEach(mat => {
                const isViewed = parseInt(mat.is_viewed) > 0; const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1.2rem'; card.style.borderLeft = `4px solid ${isViewed ? '#2ecc71' : '#eee'}`;
                card.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="item-header"><div style="display: flex; align-items: center; gap: 12px;"><i data-lucide="${isViewed ? 'check-circle' : 'file-text'}" style="width: 20px; color: ${isViewed ? '#2ecc71' : '#999'}"></i><strong style="color: ${isViewed ? '#27ae60' : '#333'};">${mat.title}</strong></div><i data-lucide="chevron-down" class="dropdown-icon" style="width: 16px;"></i></div><div class="item-body" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1.5rem;">${mat.description || ''}</p>${getPreviewHTML(mat.url, mat.material_type)}<div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">${isViewed ? '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;"><i data-lucide="check" style="width:16px;"></i> Viewed</span>' : `<button class="btn btn-primary mark-viewed-btn" data-id="${mat.id}" style="padding: 0.6rem 1.2rem; font-size: 0.85rem; background: #2ecc71; border-color: #2ecc71;">Mark as Viewed</button>`}</div></div>`;
                card.querySelector('.item-header').addEventListener('click', () => { const body = card.querySelector('.item-body'); const icon = card.querySelector('.dropdown-icon'); const isOpen = body.style.display === 'block'; body.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? '' : 'rotate(180deg)'; });
                if(!isViewed) { card.querySelector('.mark-viewed-btn').addEventListener('click', async (e) => { const res = await fetch('../api/courses.php?type=material_views', { method: 'POST', body: JSON.stringify({ material_id: mat.id, student_id: currentUser.id }) }); if(res.ok) { loadLearningCurriculum(); loadLearningCategories(); } }); }
                learningCurriculumItems.appendChild(card);
            });
            activities.forEach(act => {
                const isDone = parseInt(act.is_done) > 0; const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1.2rem'; card.style.borderLeft = `4px solid ${isDone ? '#2ecc71' : 'var(--secondary-color)'}`;
                card.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="item-header"><div style="display: flex; align-items: center; gap: 12px;"><i data-lucide="${isDone ? 'check-circle' : 'activity'}" style="width: 20px; color: ${isDone ? '#2ecc71' : 'var(--secondary-color)'}"></i><strong style="color: ${isDone ? '#27ae60' : '#333'};">${act.title}</strong></div><i data-lucide="chevron-down" class="dropdown-icon" style="width: 16px;"></i></div><div class="item-body" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1.5rem;">${act.description || ''}</p>${getPreviewHTML(act.content_url, 'google_form')}<div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">${isDone ? '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;"><i data-lucide="check" style="width:16px;"></i> Completed</span>' : `<button class="btn btn-primary mark-done-btn" data-id="${act.id}" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">Mark as Done</button>`}</div></div>`;
                card.querySelector('.item-header').addEventListener('click', () => { const body = card.querySelector('.item-body'); const icon = card.querySelector('.dropdown-icon'); const isOpen = body.style.display === 'block'; body.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? '' : 'rotate(180deg)'; });
                if(!isDone) { card.querySelector('.mark-done-btn').addEventListener('click', async (e) => { const res = await fetch('../api/courses.php?type=submissions', { method: 'POST', body: JSON.stringify({ activity_id: act.id, student_id: currentUser.id }) }); if(res.ok) { loadLearningCurriculum(); loadLearningCategories(); } }); }
                learningCurriculumItems.appendChild(card);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {}
    }

    if(backToCatalogBtn) { backToCatalogBtn.addEventListener('click', (e) => { e.preventDefault(); selectedCategory = null; switchView(studentDashboard); }); }

    async function loadStudentCourses(search = '') {
        const response = await fetch(`../api/courses.php?type=courses&student_id=${currentUser.id}${search ? '&search=' + search : ''}`);
        const courses = await response.json();
        const grid = document.getElementById('student-courses-grid'); if(!grid || !Array.isArray(courses)) return;
        grid.innerHTML = courses.length ? '' : '<p style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #999;">No courses found matching your search.</p>';
        courses.forEach(c => {
            const container = document.createElement('div'); container.className = 'course-card'; container.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; container.style.cursor = 'pointer'; container.style.overflow = 'hidden';
            container.innerHTML = `<div class="card-header" style="padding: 1.5rem; display: flex; justify-content: space-between; align-items: center;"><div><h3 style="margin-bottom: 0.2rem; color: var(--secondary-color);">${c.title}</h3><p style="font-size: 0.85rem; color: #666;">By: ${c.instructor_name}</p></div><i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i></div><div class="card-details" style="display: none; padding: 0 1.5rem 1.5rem; border-top: 1px solid #f0f0f0; background: #fafafa;"><div style="padding-top: 1.5rem;"><h5 style="margin-bottom: 0.5rem; color: #333;">About this Course</h5><p style="font-size: 0.9rem; color: #555; line-height: 1.6; margin-bottom: 1.5rem;">${c.description}</p><div style="display: flex; align-items: center; gap: 15px; margin-bottom: 1.5rem;"><div style="background: #e8f0fe; color: var(--primary-color); padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;"><i data-lucide="clock" style="width: 14px; margin-right: 5px; vertical-align: middle;"></i> Self-Paced</div><div style="background: #e7f7ed; color: #2ecc71; padding: 8px 15px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;"><i data-lucide="book-open" style="width: 14px; margin-right: 5px; vertical-align: middle;"></i> Lifetime Access</div></div><button class="btn btn-primary enroll-btn" data-id="${c.id}" style="width: 100%; padding: 1rem; font-weight: 600; font-size: 1rem; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);">Enrol Now</button></div></div>`;
            container.addEventListener('click', (e) => { if(e.target.closest('.enroll-btn')) return; const details = container.querySelector('.card-details'); const icon = container.querySelector('.dropdown-icon'); const isOpen = details.style.display === 'block'; details.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; container.style.boxShadow = isOpen ? '' : '0 10px 25px rgba(0,0,0,0.1)'; container.style.transform = isOpen ? '' : 'translateY(-2px)'; });
            container.querySelector('.enroll-btn').addEventListener('click', async (e) => {
                e.stopPropagation(); const courseId = e.target.dataset.id;
                const res = await fetch('../api/courses.php?type=enrollments', { method: 'POST', body: JSON.stringify({ course_id: courseId, student_id: currentUser.id }) });
                if(res.ok) { alert(`Successfully enrolled in ${c.title}!`); loadStudentCourses(searchInput ? searchInput.value : ''); loadEnrolledCourses(); }
            });
            grid.appendChild(container);
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }

    updateNavbar();
    if (currentUser) { if (currentUser.role === 'instructor') { switchView(instructorDashboard); loadInstructorCourses(); } else { switchView(studentDashboard); const nameDisplay = document.getElementById('student-name-display'); if(nameDisplay) nameDisplay.textContent = currentUser.name.split(' ')[0]; loadStudentCourses(); loadEnrolledCourses(); } }
    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => { localStorage.removeItem('currentUser'); window.location.reload(); }));
    if(loginForm) { loginForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { email: document.getElementById('login-email').value, password: document.getElementById('login-password').value }; const response = await fetch('../api/login.php', { method: 'POST', body: JSON.stringify(data) }); const result = await response.json(); if (response.ok) { localStorage.setItem('currentUser', JSON.stringify(result.user)); window.location.reload(); } }); }
    if(addCourseForm) { addCourseForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { instructor_id: currentUser.id, title: document.getElementById('course-title').value, description: document.getElementById('course-desc').value }; const response = await fetch('../api/courses.php?type=courses', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { loadInstructorCourses(); addCourseForm.reset(); } }); }
    if(searchInput) { searchInput.addEventListener('input', (e) => { loadStudentCourses(e.target.value); }); }

    function getPreviewHTML(url, type) {
        if (!url) return '';
        if (url.includes('docs.google.com/forms')) { const embedUrl = url.includes('/viewform') ? url.replace('/viewform', '/viewform?embedded=true') : url; return `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0" marginheight="0" marginwidth="0" style="border-radius: 10px; background: white;">Loading…</iframe>`; }
        if (url.includes('youtube.com') || url.includes('youtu.be')) { const vidId = url.split('v=')[1] || url.split('/').pop(); return `<iframe width="100%" height="315" src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen style="border-radius: 10px;"></iframe>`; }
        if (type === 'pdf' || url.endsWith('.pdf')) { return `<iframe src="${url}" width="100%" height="500px" style="border: none; border-radius: 10px;"></iframe>`; }
        return `<div style="padding: 1rem; background: #eee; border-radius: 10px; text-align: center;"><a href="${url}" target="_blank" style="color: var(--secondary-color); font-weight: 600;">Open Resource <i data-lucide="external-link" style="width: 14px;"></i></a></div>`;
    }

    async function loadCurriculumItems() {
        const list = document.getElementById('activities-list'); if(!list) return;
        list.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading curriculum...</p>';
        try {
            const actRes = await fetch(`../api/courses.php?type=activities&category_id=${selectedCategory.id}`);
            const activities = await actRes.json();
            const matRes = await fetch(`../api/courses.php?type=materials&category_id=${selectedCategory.id}`);
            const materials = await matRes.json();
            if(!Array.isArray(activities) || !Array.isArray(materials)) return;
            list.innerHTML = '';
            if(materials.length > 0) {
                const matHeader = document.createElement('h5'); matHeader.textContent = "Learning Materials"; matHeader.style.margin = "1rem 0 0.5rem"; list.appendChild(matHeader);
                materials.forEach(mat => {
                    const container = document.createElement('div'); container.style.marginBottom = '10px';
                    const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1rem'; card.style.borderLeft = '4px solid #2ecc71'; card.style.cursor = 'pointer';
                    card.innerHTML = `<div class="card-main-header" style="display: flex; justify-content: space-between; align-items: center;"><strong style="color: #27ae60;">${mat.title}</strong><div style="display: flex; gap: 10px; align-items: center;"><button class="edit-mat-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;"><i data-lucide="pencil" style="width: 16px; height: 16px;"></i></button><i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i></div></div><div class="edit-mode" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><form class="inline-edit-form"><div class="form-group"><label>Title</label><input type="text" value="${mat.title}" class="edit-title" required></div><div class="form-group"><label>URL</label><input type="url" value="${mat.url}" class="edit-url" required></div><div class="form-group"><label>Description</label><textarea class="edit-desc" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd; height: 80px;">${mat.description || ''}</textarea></div><div class="form-group"><label>Type</label><select class="edit-type" style="width: 100%; padding: 0.8rem; border-radius: 10px; border: 1px solid #ddd;"><option value="link" ${mat.material_type === 'link' ? 'selected' : ''}>Link</option><option value="pdf" ${mat.material_type === 'pdf' ? 'selected' : ''}>PDF</option><option value="video" ${mat.material_type === 'video' ? 'selected' : ''}>Video</option></select></div><div style="display: flex; gap: 10px;"><button type="submit" class="btn btn-primary" style="flex: 1; font-size: 0.8rem; background: #27ae60;">Save</button><button type="button" class="cancel-edit btn btn-outline" style="flex: 1; font-size: 0.8rem;">Cancel</button></div></form></div><div class="preview-content" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">${mat.description || 'No description provided.'}</p>${getPreviewHTML(mat.url, mat.material_type)}</div>`;
                    card.addEventListener('click', (e) => { if(e.target.closest('.edit-mat-btn') || e.target.closest('.edit-mode')) return; const preview = card.querySelector('.preview-content'); const icon = card.querySelector('.dropdown-icon'); const isOpen = preview.style.display === 'block'; preview.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; });
                    card.querySelector('.edit-mat-btn').addEventListener('click', (e) => { e.stopPropagation(); card.querySelector('.edit-mode').style.display = 'block'; card.querySelector('.preview-content').style.display = 'none'; });
                    card.querySelector('.cancel-edit').addEventListener('click', (e) => { e.stopPropagation(); card.querySelector('.edit-mode').style.display = 'none'; });
                    card.querySelector('.inline-edit-form').addEventListener('submit', async (e) => { e.preventDefault(); const data = { id: mat.id, title: card.querySelector('.edit-title').value, url: card.querySelector('.edit-url').value, description: card.querySelector('.edit-desc').value, material_type: card.querySelector('.edit-type').value }; const response = await fetch('../api/courses.php?type=materials', { method: 'PUT', body: JSON.stringify(data) }); if(response.ok) loadCurriculumItems(); });
                    container.appendChild(card); list.appendChild(container);
                });
            }
            const actHeader = document.createElement('h5'); actHeader.textContent = "Google Form Activities"; actHeader.style.margin = "2rem 0 0.5rem"; list.appendChild(actHeader);
            if(activities.length === 0) { const empty = document.createElement('p'); empty.style.textAlign = 'center'; empty.style.color = '#999'; empty.style.padding = '2rem'; empty.textContent = 'No activities yet.'; list.appendChild(empty); } else {
                activities.forEach(act => {
                    const container = document.createElement('div'); container.style.marginBottom = '10px';
                    const el = document.createElement('div'); el.className = 'course-card'; el.style.padding = '1rem'; el.style.borderLeft = '4px solid var(--secondary-color)'; el.style.cursor = 'pointer';
                    el.innerHTML = `<div class="card-main-header" style="display: flex; justify-content: space-between; align-items: center;"><div><strong>${act.title}</strong><span style="font-size: 0.65rem; color: #999; margin-left: 10px;">Google Form</span></div><div style="display: flex; gap: 10px; align-items: center;"><button class="edit-act-btn" style="border: none; background: transparent; cursor: pointer; color: #999; padding: 5px;"><i data-lucide="pencil" style="width: 16px; height: 16px;"></i></button><i data-lucide="chevron-down" class="dropdown-icon" style="transition: transform 0.3s ease;"></i></div></div><div class="edit-mode" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><form class="inline-edit-act-form"><div class="form-group"><label>Title</label><input type="text" value="${act.title}" class="edit-title" required></div><div class="form-group"><label>Google Form Link</label><input type="url" value="${act.content_url || ''}" class="edit-url" required></div><div style="display: grid; grid-template-columns: 1fr 3fr; gap: 1rem;"><div class="form-group"><label>Seq #</label><input type="number" value="${act.sequence_number ?? 0}" class="edit-seq" style="width: 100%;"></div><div class="form-group"><label>Description</label><input type="text" value="${act.description || ''}" class="edit-desc" style="width: 100%;"></div></div><div style="display: flex; gap: 10px;"><button type="submit" class="btn btn-primary" style="flex: 1; font-size: 0.8rem;">Save Changes</button><button type="button" class="cancel-edit-act btn btn-outline" style="flex: 1; font-size: 0.8rem;">Cancel</button></div></form></div><div class="preview-content" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1rem;">${act.description || 'Follow the link below to complete the activity.'}</p>${getPreviewHTML(act.content_url, 'google_form')}</div>`;
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
    document.getElementById('show-add-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'block'; document.getElementById('add-material-container').style.display = 'none'; });
    document.getElementById('cancel-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'none'; });
    document.getElementById('show-add-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'block'; document.getElementById('add-activity-container').style.display = 'none'; });
    document.getElementById('cancel-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'none'; });
    addActivityForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { category_id: selectedCategory.id, course_id: selectedCourse.id, title: document.getElementById('act-title').value, content_url: document.getElementById('act-url').value, activity_type: 'google_form', sequence_number: document.getElementById('act-sequence').value || 0, description: document.getElementById('act-desc-simple').value }; const response = await fetch('../api/courses.php?type=activities', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { addActivityForm.reset(); document.getElementById('act-sequence').value = 0; document.getElementById('add-activity-container').style.display = 'none'; loadCurriculumItems(); } });
    addMaterialForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { course_id: selectedCourse.id, category_id: selectedCategory.id, title: document.getElementById('mat-title').value, description: document.getElementById('mat-desc').value, url: document.getElementById('mat-url').value, material_type: document.getElementById('mat-type').value }; const response = await fetch('../api/courses.php?type=materials', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { addMaterialForm.reset(); document.getElementById('add-material-container').style.display = 'none'; loadCurriculumItems(); } });
});
