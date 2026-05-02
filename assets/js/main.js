document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const welcomeView = document.getElementById('welcome-view');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const instructorDashboard = document.getElementById('instructor-dashboard');
    const studentDashboard = document.getElementById('student-dashboard');
    const learningModulesView = document.getElementById('learning-modules-view');
    const learningContentView = document.getElementById('learning-content-view');
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
    const learningCurriculumItems = document.getElementById('learning-curriculum-items');
    const backToCatalogBtn = document.getElementById('back-to-catalog');
    const backToModulesBtn = document.getElementById('back-to-modules');

    // Instructor Modal Elements
    const instructorModalOverlay = document.getElementById('instructor-modal-overlay');
    const instructorModalContent = document.getElementById('instructor-modal-content');
    const closeInstructorModal = document.getElementById('close-instructor-modal');

    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let selectedCourse = null;
    let selectedCategory = null;
    let isAnonymous = currentUser?.id === 'anonymous';

    // --- Mobile Menu Toggle logic ---
    const menuToggle = document.getElementById('mobile-menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            console.log('Mobile menu toggled');
            menuToggle.classList.toggle('active');
            // Only toggle active on the menu that is currently supposed to be visible
            document.querySelectorAll('.nav-links').forEach(nav => {
                const isVisible = window.getComputedStyle(nav).display !== 'none';
                if (isVisible || nav.classList.contains('active')) {
                    nav.classList.toggle('active');
                }
            });
        });

        // Close menu on link click or click outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = e.target.closest('.nav-links');
            const isClickOnToggle = e.target.closest('.menu-toggle');
            
            if (isClickInsideMenu && e.target.closest('a')) {
                // Clicked a link inside
                menuToggle.classList.remove('active');
                document.querySelectorAll('.nav-links').forEach(nav => nav.classList.remove('active'));
            } else if (!isClickInsideMenu && !isClickOnToggle) {
                // Clicked outside
                menuToggle.classList.remove('active');
                document.querySelectorAll('.nav-links').forEach(nav => nav.classList.remove('active'));
            }
        });
    }

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
            
            if (isAnonymous) {
                if(navGuest) navGuest.style.display = 'flex';
                if(navStudent) navStudent.style.display = 'flex';
                if(navInstructor) navInstructor.style.display = 'none';
            } else if (currentUser.role === 'instructor') {
                if(navGuest) navGuest.style.display = 'none';
                if(navStudent) navStudent.style.display = 'none';
                if(navInstructor) navInstructor.style.display = 'flex';
            } else {
                if(navGuest) navGuest.style.display = 'none';
                if(navStudent) navStudent.style.display = 'flex';
                if(navInstructor) navInstructor.style.display = 'none';
            }
        }
    };

    const switchView = (viewToShow) => {
        console.log('Switching to view:', viewToShow.id);
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        setTimeout(() => {
            viewToShow.classList.add('active');
            updateNavbar();
        }, 100);
    };

    const toggleAuth = document.getElementById('toggle-auth');
    if (toggleAuth) {
        toggleAuth.addEventListener('click', (e) => {
            e.preventDefault();
            if (loginView && loginView.classList.contains('active')) {
                switchView(registerView);
                toggleAuth.textContent = 'Login';
            } else {
                switchView(loginView);
                toggleAuth.textContent = 'Sign Up';
            }
        });
    }

    const goToRegister = document.getElementById('go-to-register');
    if (goToRegister) {
        goToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(registerView);
            if (toggleAuth) toggleAuth.textContent = 'Login';
        });
    }

    const goToLogin = document.getElementById('go-to-login');
    if (goToLogin) {
        goToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(loginView);
            if (toggleAuth) toggleAuth.textContent = 'Sign Up';
        });
    }

    const backToWelcome = document.getElementById('back-to-welcome');
    if (backToWelcome) {
        backToWelcome.addEventListener('click', (e) => {
            e.preventDefault();
            switchView(welcomeView);
        });
    }

    const startAnonymousBtn = document.getElementById('start-anonymous');
    if (startAnonymousBtn) {
        startAnonymousBtn.addEventListener('click', () => {
            currentUser = { id: 'anonymous', name: 'Learner', role: 'student' };
            isAnonymous = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            switchView(studentDashboard);
            loadStudentCourses();
            loadEnrolledCourses();
        });
    }

    // --- Comment System Helpers ---

    async function loadComments(targetId, targetType, container) {
        try {
            const url = `../api/courses.php?type=comments&${targetType}_id=${targetId}`;
            const res = await fetch(url);
            const comments = await res.json();
            
            if (!Array.isArray(comments)) return;
            
            container.innerHTML = '';
            if (comments.length === 0) {
                container.innerHTML = '<p style="font-size: 0.8rem; color: #999; text-align: center; padding: 1rem;">No discussions yet. Be the first to comment!</p>';
                return;
            }

            // Organize comments into a tree
            const commentMap = {};
            const rootComments = [];
            
            comments.forEach(c => {
                c.replies = [];
                commentMap[c.id] = c;
            });
            
            comments.forEach(c => {
                if (c.parent_id && commentMap[c.parent_id]) {
                    commentMap[c.parent_id].replies.push(c);
                } else {
                    rootComments.push(c);
                }
            });

            const renderComment = (c, depth = 0) => {
                const date = new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                const initials = c.user_name.split(' ').map(n => n[0]).join('').toUpperCase();
                const isInstructor = c.user_role === 'instructor';
                const isOwner = currentUser && parseInt(currentUser.id) === parseInt(c.user_id);
                
                const commentEl = document.createElement('div');
                commentEl.className = 'comment-item';
                commentEl.style.marginLeft = depth > 0 ? '1.5rem' : '0';
                commentEl.style.borderLeft = depth > 0 ? '2px solid #f1f5f9' : 'none';
                commentEl.style.paddingLeft = depth > 0 ? '1rem' : '0';
                commentEl.style.marginBottom = '1.5rem';
                
                commentEl.innerHTML = `
                    <div style="display: flex; gap: 12px;">
                        <div style="width: 32px; height: 32px; background: ${isInstructor ? 'var(--primary-color)' : '#f1f5f9'}; color: ${isInstructor ? 'white' : '#64748b'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;">${initials}</div>
                        <div style="flex: 1;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
                                <span style="font-weight: 700; font-size: 0.85rem; color: #333;">${c.user_name}</span>
                                ${isInstructor ? '<span style="background: #eef2ff; color: var(--primary-color); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 800; text-transform: uppercase;">Instructor</span>' : ''}
                                <span style="color: #999; font-size: 0.7rem;">${date}</span>
                            </div>
                            <p style="font-size: 0.85rem; color: #4b5563; line-height: 1.5; white-space: pre-wrap; margin-bottom: 0.5rem;">${c.content}</p>
                            
                            <div style="display: flex; gap: 15px; align-items: center;">
                                <button class="reply-trigger" style="background: none; border: none; color: var(--primary-color); font-size: 0.75rem; font-weight: 700; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;"><i data-lucide="reply" style="width: 12px;"></i> Reply</button>
                                ${isOwner ? `<button class="delete-comment-btn" style="background: none; border: none; color: #ff4d4d; font-size: 0.75rem; font-weight: 600; cursor: pointer; padding: 0; display: flex; align-items: center; gap: 4px;"><i data-lucide="trash-2" style="width: 12px;"></i> Delete</button>` : ''}
                            </div>
                            
                            <!-- Hidden Reply Input Area -->
                            <div class="reply-input-container" style="display: none; margin-top: 1rem; gap: 10px;">
                                <input type="text" class="reply-field" placeholder="Reply to ${c.user_name}..." style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #eee; font-size: 0.8rem; background: #fafafa;">
                                <button class="post-reply-btn btn btn-primary" style="padding: 5px 12px; border-radius: 8px; font-size: 0.75rem;">Post</button>
                                <button class="cancel-reply-btn" style="background: none; border: none; color: #999; font-size: 0.75rem; cursor: pointer;">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;
                
                const trigger = commentEl.querySelector('.reply-trigger');
                const inputArea = commentEl.querySelector('.reply-input-container');
                const replyField = commentEl.querySelector('.reply-field');
                const postBtn = commentEl.querySelector('.post-reply-btn');
                const cancelBtn = commentEl.querySelector('.cancel-reply-btn');
                const deleteBtn = commentEl.querySelector('.delete-comment-btn');
                
                trigger.addEventListener('click', () => {
                    inputArea.style.display = 'flex';
                    trigger.parentElement.style.display = 'none';
                    replyField.focus();
                });
                
                cancelBtn.addEventListener('click', () => {
                    inputArea.style.display = 'none';
                    trigger.parentElement.style.display = 'flex';
                    replyField.value = '';
                });
                
                postBtn.addEventListener('click', async () => {
                    const content = replyField.value.trim();
                    if (!content) return;
                    
                    postBtn.disabled = true;
                    const data = { 
                        user_id: currentUser.id, 
                        content: content,
                        parent_id: c.id
                    };
                    data[`${targetType}_id`] = targetId;
                    
                    try {
                        const res = await fetch('../api/courses.php?type=comments', { method: 'POST', body: JSON.stringify(data) });
                        if (res.ok) {
                            loadComments(targetId, targetType, container);
                        }
                    } catch (e) {} finally { postBtn.disabled = false; }
                });

                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        if (confirm('Are you sure you want to delete this comment? All replies will also be removed.')) {
                            try {
                                const res = await fetch(`../api/courses.php?type=comments&id=${c.id}&user_id=${currentUser.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                    loadComments(targetId, targetType, container);
                                }
                            } catch (e) {}
                        }
                    });
                }
                
                container.appendChild(commentEl);
                
                // Recursively render replies
                if (c.replies.length > 0) {
                    c.replies.forEach(reply => renderComment(reply, depth + 1));
                }
            };
            
            rootComments.forEach(c => renderComment(c));
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {
            container.innerHTML = '<p style="color: red; font-size: 0.7rem;">Error loading comments.</p>';
        }
    }

    function createCommentSection(targetId, targetType) {
        const section = document.createElement('div');
        section.className = 'comment-section';
        section.style.marginTop = '1.5rem';
        section.style.paddingTop = '1.5rem';
        section.style.borderTop = '1px solid #eee';
        
        section.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        if (isAnonymous) {
            section.innerHTML = `
                <div style="background: #fff9eb; padding: 1.5rem; border-radius: 12px; border: 1px solid #ffeeba; text-align: center; margin-bottom: 1rem;">
                    <i data-lucide="lock" style="width: 24px; height: 24px; color: #856404; margin-bottom: 0.5rem;"></i>
                    <p style="font-size: 0.9rem; color: #856404; font-weight: 600;">Want to see and join the discussion?</p>
                    <p style="font-size: 0.8rem; color: #856404; margin-bottom: 1rem;">Sign in to participate in the public forum and save your progress permanently.</p>
                    <button class="btn btn-primary go-to-login-btn" style="background: #856404; border-color: #856404; font-size: 0.8rem;">Sign In to Comment</button>
                </div>
            `;
            const loginBtn = section.querySelector('.go-to-login-btn');
            if (loginBtn) {
                loginBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    switchView(loginView);
                });
            }
            if(typeof lucide !== 'undefined') lucide.createIcons();
            return section;
        }

        section.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; color: #666;">
                <i data-lucide="message-square" style="width: 16px;"></i>
                <h6 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 800;">Public Discussion</h6>
            </div>
            <div class="comments-list-container" style="margin-bottom: 1.5rem; padding-right: 5px;">
                <p style="text-align: center; color: #999; font-size: 0.8rem;">Loading discussion...</p>
            </div>
            <div class="comment-input-area" style="display: flex; gap: 10px;">
                <input type="text" class="comment-field" placeholder="Share your thoughts..." style="flex: 1; padding: 10px 15px; border-radius: 10px; border: 1px solid #eee; font-size: 0.85rem; background: #fafafa;">
                <button class="post-comment-btn btn btn-primary" style="padding: 10px 15px; border-radius: 10px; display: flex; align-items: center; justify-content: center;"><i data-lucide="send" style="width: 16px;"></i></button>
            </div>
        `;
        
        const list = section.querySelector('.comments-list-container');
        const input = section.querySelector('.comment-field');
        const btn = section.querySelector('.post-comment-btn');
        
        loadComments(targetId, targetType, list);
        
        const doPost = async () => {
            const content = input.value.trim();
            if (!content) return;
            
            btn.disabled = true;
            const data = { user_id: currentUser.id, content: content };
            data[`${targetType}_id`] = targetId;
            
            try {
                const res = await fetch('../api/courses.php?type=comments', { method: 'POST', body: JSON.stringify(data) });
                if (res.ok) {
                    input.value = '';
                    loadComments(targetId, targetType, list);
                }
            } catch (e) {} finally { btn.disabled = false; }
        };
        
        btn.addEventListener('click', doPost);
        input.addEventListener('keypress', (e) => { if(e.key === 'Enter') doPost(); });
        
        return section;
    }

    // --- Instructor Actions ---
    
    async function loadInstructorCourses() {
        try {
            const response = await fetch(`../api/courses.php?type=courses&instructor_id=${currentUser.id}`);
            const text = await response.text();
            let courses;
            try {
                courses = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse courses JSON:', text);
                return;
            }
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
        const courseNameEl = document.getElementById('current-course-name');
        if(courseNameEl) courseNameEl.textContent = selectedCourse.title;
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

    // --- Course Deletion Logic ---
    const deleteCourseBtn = document.getElementById('delete-course-btn');
    if (deleteCourseBtn) {
        deleteCourseBtn.addEventListener('click', async () => {
            if (!selectedCourse) return;

            const confirmName = prompt(`Are you sure you want to delete "${selectedCourse.title}"?\n\nThis action is PERMANENT and cannot be undone. All modules, activities, and student records will be destroyed.\n\nTo confirm, type the course title exactly as shown above:`);
            
            if (confirmName === selectedCourse.title) {
                try {
                    const response = await fetch(`../api/courses.php?type=courses&id=${selectedCourse.id}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();
                    
                    if (response.ok) {
                        alert(result.message || 'Course has been permanently deleted.');
                        selectedCourse = null;
                        
                        // Return to instructor dashboard
                        instructorCoursesSection.style.display = 'block';
                        courseManagerSection.style.display = 'none';
                        breadcrumb.style.display = 'none';
                        loadInstructorCourses();
                    } else {
                        alert(result.message || 'Failed to delete course.');
                    }
                } catch (error) {
                    console.error('Delete Course Error:', error);
                    alert('An error occurred during deletion. Please check the console.');
                }
            } else if (confirmName !== null) {
                alert('Course title did not match. Deletion cancelled.');
            }
        });
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
                    <td data-label="Student Name" style="padding: 0.75rem; font-weight: 600; color: #333; font-size: 0.85rem;">${s.first_name} ${s.last_name}</td>
                    <td data-label="Email" style="padding: 0.75rem; color: #666; font-size: 0.85rem;">${s.email}</td>
                    <td data-label="Joined At" style="padding: 0.75rem; color: #999; font-size: 0.75rem;">${date}</td>
                    <td data-label="Actions" style="padding: 0.5rem; text-align: center; position: relative;">
                        <button class="enrollee-options-btn" style="border: none; background: none; cursor: pointer; color: #999;"><i data-lucide="more-vertical" style="width: 16px;"></i></button>
                        <div class="enrollee-dropdown" style="display: none; position: absolute; right: 2rem; top: 2.5rem; background: white; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 100; min-width: 150px; overflow: hidden;">
                            <button class="view-user-info-btn" data-id="${s.id}" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: white; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="user" style="width: 12px;"></i> User Information</button>
                            <button class="view-user-progress-btn" data-id="${s.id}" data-name="${s.first_name}" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: white; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; gap: 8px;"><i data-lucide="bar-chart-2" style="width: 12px;"></i> View Progress</button>
                            <button class="unenroll-user-btn" data-id="${s.id}" data-name="${s.first_name} ${s.last_name}" style="width: 100%; text-align: left; padding: 10px 12px; border: none; background: white; cursor: pointer; font-size: 0.8rem; color: #ff4d4d; border-top: 1px solid #f9f9f9; display: flex; align-items: center; gap: 8px;"><i data-lucide="user-minus" style="width: 12px;"></i> Unenroll</button>
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
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: #f0f4ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 0.8rem; color: var(--primary-color);">
                        <i data-lucide="user" style="width: 30px; height: 30px;"></i>
                    </div>
                    <h3 style="margin-bottom: 0.1rem;">${u.first_name} ${u.last_name}</h3>
                    <p style="color: #666; font-size: 0.85rem;">Student Profile</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
                    <div><label style="font-size: 0.65rem; color: #999; text-transform: uppercase; font-weight: 700;">Email</label><p style="font-weight: 500; font-size: 0.85rem;">${u.email}</p></div>
                    <div><label style="font-size: 0.65rem; color: #999; text-transform: uppercase; font-weight: 700;">Contact</label><p style="font-weight: 500; font-size: 0.85rem;">${u.contact_number || 'N/A'}</p></div>
                    <div><label style="font-size: 0.65rem; color: #999; text-transform: uppercase; font-weight: 700;">Gender</label><p style="font-weight: 500; font-size: 0.85rem;">${u.gender || 'N/A'}</p></div>
                    <div><label style="font-size: 0.65rem; color: #999; text-transform: uppercase; font-weight: 700;">Birthdate</label><p style="font-weight: 500; font-size: 0.85rem;">${u.birthdate || 'N/A'}</p></div>
                </div>
                <div style="margin-top: 1rem;"><label style="font-size: 0.65rem; color: #999; text-transform: uppercase; font-weight: 700;">Address</label><p style="font-weight: 500; font-size: 0.85rem;">${u.address || 'No address provided.'}</p></div>
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
            el.querySelector('.rename-cat-btn').addEventListener('click', async (e) => { e.stopPropagation(); dropdown.style.display = 'none'; const newName = prompt('Enter new module name:', cat.name); if(newName && newName !== cat.name) { const res = await fetch('../api/courses.php?type=categories', { method: 'PUT', body: JSON.stringify({id: cat.id, name: newName}) }); if(res.ok) { if(selectedCategory?.id == cat.id) selectedCategory.name = newName; loadCategories(); } } });
            el.querySelector('.delete-cat-btn').addEventListener('click', async (e) => { e.stopPropagation(); dropdown.style.display = 'none'; if(confirm(`Are you sure you want to delete "${cat.name}" and all its activities?`)) { const res = await fetch(`../api/courses.php?type=categories&id=${cat.id}`, { method: 'DELETE' }); if(res.ok) { if(selectedCategory?.id == cat.id) { selectedCategory = null; document.getElementById('no-category-selected').style.display = 'block'; document.getElementById('category-details').style.display = 'none'; } loadCategories(); } } });
            el.addEventListener('click', (e) => { if(e.target.closest('.category-options')) return; selectedCategory = cat; loadCategories(); openActivityManager(); });
            list.appendChild(el);
        });
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }

    function openActivityManager() {
        const noCatMsg = document.getElementById('no-category-selected');
        const catDetails = document.getElementById('category-details');
        const catNameEl = document.getElementById('current-category-name');
        
        if(noCatMsg) noCatMsg.style.display = 'none';
        if(catDetails) catDetails.style.display = 'block';
        if(catNameEl) catNameEl.textContent = selectedCategory.name;
        loadCurriculumItems();
    }

    // --- Student Actions ---

    async function loadEnrolledCourses() {
        const res = await fetch(`../api/courses.php?type=enrollments&student_id=${currentUser.id}`);
        const enrolled = await res.json();
        const list = document.getElementById('enrolled-courses-list'); if(!list || !Array.isArray(enrolled)) return;
        list.innerHTML = enrolled.length ? '' : '<p style="color: #999; font-size: 0.9rem; text-align: center; padding: 1rem;">Explore the catalog to start learning!</p>';
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
        console.log('Opening modules list for course:', course.title);
        selectedCourse = course; selectedCourse.id = course.course_id || course.id; 
        const titleEl = document.getElementById('learning-course-title');
        if(titleEl) titleEl.textContent = course.title;
        
        learningCategoriesList.innerHTML = '<p style="padding: 1rem; color: #999;">Loading modules...</p>';
        switchView(learningModulesView); 
        loadLearningCategories();
    }

    if(backToModulesBtn) {
        backToModulesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Returning to modules list');
            switchView(learningModulesView);
        });
    }

    async function loadLearningCategories() {
        try {
            const response = await fetch(`../api/courses.php?type=categories&course_id=${selectedCourse.id}&student_id=${currentUser.id}`);
            const categories = await response.json();
            if (!Array.isArray(categories)) { learningCategoriesList.innerHTML = `<p style="padding: 1rem; color: #ff4d4d; font-size: 0.85rem;">Error loading modules.</p>`; return; }
            learningCategoriesList.innerHTML = '';
            let totalItems = 0; let totalCompleted = 0;
            const anonProgress = isAnonymous ? (JSON.parse(localStorage.getItem('anonProgress')) || { submissions: [], views: [] }) : null;
            
            categories.forEach(cat => {
                let t = parseInt(cat.total_items) || 0; 
                let c = parseInt(cat.completed_items) || 0;
                
                if (isAnonymous) {
                    // This is a bit rough as we don't know which activities are in which category easily without fetching them all,
                    // but for simplicity we can just rely on the next level's progress for now or fetch activities.
                    // Actually, let's keep the API's count for logged in and just handle the curriculum items individually.
                    // To accurately show category progress for anonymous, we'd need to know which items belong to which category.
                }

                const perc = t > 0 ? Math.round((c/t)*100) : 0; totalItems += t; totalCompleted += c;
                const el = document.createElement('div'); 
                el.className = 'category-item'; 
                el.style.padding = '2rem'; 
                el.style.borderRadius = '20px'; 
                el.style.cursor = 'pointer'; 
                el.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; 
                el.style.marginBottom = '1.5rem'; 
                el.style.background = 'white';
                el.style.border = '1px solid #eee';
                el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.02)';
                
                const progressBarHTML = t > 0 ? `
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="margin: 0; color: #333; font-size: 1.2rem;">${cat.name}</h3>
                        <span style="font-size: 0.9rem; font-weight: 800; color: var(--secondary-color); background: #f0f7ff; padding: 5px 12px; border-radius: 50px;">${perc}%</span>
                    </div>
                    <div style="height: 10px; width: 100%; background: #f0f0f0; border-radius: 10px; overflow: hidden;">
                        <div style="height: 100%; width: ${perc}%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); transition: width 0.6s ease;"></div>
                    </div>
                    <div style="margin-top: 1rem; font-size: 0.8rem; color: #999; display: flex; align-items: center; gap: 5px;">
                        <i data-lucide="info" style="width: 14px;"></i> Click to open module content
                    </div>
                ` : `
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; color: #333; font-size: 1.2rem;">${cat.name}</h3>
                        <i data-lucide="chevron-right" style="color: #ccc;"></i>
                    </div>
                `;
                el.innerHTML = progressBarHTML; 
                el.addEventListener('click', () => { 
                    console.log('Opening module content:', cat.name);
                    selectedCategory = cat; 
                    switchView(learningContentView);
                    loadLearningCurriculum(); 
                });
                learningCategoriesList.appendChild(el);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
            if (totalItems > 0) {
                const totalPerc = Math.round((totalCompleted/totalItems)*100); const totalContainer = document.createElement('div'); totalContainer.style.marginTop = '2rem'; totalContainer.style.paddingTop = '1.5rem'; totalContainer.style.borderTop = '1px solid #eee';
                totalContainer.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><span style="font-weight: 700; font-size: 0.85rem; color: #666; text-transform: uppercase;">Total Progress</span><span style="font-weight: 800; font-size: 1.1rem; color: var(--secondary-color);">${totalPerc}%</span></div><div style="height: 10px; width: 100%; background: #eee; border-radius: 10px; overflow: hidden; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);"><div style="height: 100%; width: ${totalPerc}%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);"></div></div>`;
                learningCategoriesList.appendChild(totalContainer);
                
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
        const moduleNameEl = document.getElementById('learning-module-name');
        if(moduleNameEl) moduleNameEl.textContent = selectedCategory.name;

        // Fetch latest category stats for accurate progress bar
        try {
            const statsRes = await fetch(`../api/courses.php?type=categories&course_id=${selectedCourse.id}&student_id=${currentUser.id}`);
            const categories = await statsRes.json();
            const currentCat = categories.find(c => c.id == selectedCategory.id);
            if(currentCat) {
                const t = parseInt(currentCat.total_items) || 0;
                const c = parseInt(currentCat.completed_items) || 0;
                const perc = t > 0 ? Math.round((c/t)*100) : 0;
                const progressBar = document.getElementById('module-progress-bar');
                const progressText = document.getElementById('module-progress-text');
                if(progressBar) progressBar.style.width = `${perc}%`;
                if(progressText) progressText.textContent = `${perc}%`;
                // Update the memory object too
                selectedCategory.completed_items = currentCat.completed_items;
                selectedCategory.total_items = currentCat.total_items;
            }
        } catch (err) { console.error("Failed to update progress bar stats:", err); }

        learningCurriculumItems.innerHTML = '<p style="text-align: center; padding: 2rem;">Loading lessons...</p>';
        try {
            const actRes = await fetch(`../api/courses.php?type=activities&category_id=${selectedCategory.id}&student_id=${currentUser.id}`);
            let activities = await actRes.json();
            const matRes = await fetch(`../api/courses.php?type=materials&category_id=${selectedCategory.id}&student_id=${currentUser.id}`);
            let materials = await matRes.json();
            
            if (isAnonymous) {
                const anonProgress = JSON.parse(localStorage.getItem('anonProgress')) || { submissions: [], views: [] };
                activities = activities.map(a => ({ ...a, is_done: anonProgress.submissions.includes(a.id) ? 1 : 0 }));
                materials = materials.map(m => ({ ...m, is_viewed: anonProgress.views.includes(m.id) ? 1 : 0 }));
            }
            if (!Array.isArray(activities) || !Array.isArray(materials)) { learningCurriculumItems.innerHTML = '<p style="padding: 2rem; color: red;">Failed to load curriculum.</p>'; return; }
            if (activities.length === 0 && materials.length === 0) { learningCurriculumItems.innerHTML = '<p style="text-align: center; padding: 3rem; color: #999;">This module is empty. Check back later!</p>'; return; }
            learningCurriculumItems.innerHTML = '';
            materials.forEach(mat => {
                const isViewed = parseInt(mat.is_viewed) > 0; const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1.2rem'; card.style.borderLeft = `4px solid ${isViewed ? '#2ecc71' : '#eee'}`;
                card.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="item-header"><div style="display: flex; align-items: center; gap: 12px;"><i data-lucide="${isViewed ? 'check-circle' : 'file-text'}" style="width: 20px; color: ${isViewed ? '#2ecc71' : '#999'}"></i><strong style="color: ${isViewed ? '#27ae60' : '#333'};">${mat.title}</strong></div><i data-lucide="chevron-down" class="dropdown-icon" style="width: 16px;"></i></div><div class="item-body" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1.5rem;">${mat.description || ''}</p>${getPreviewHTML(mat.url, mat.material_type)}<div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">${isViewed ? '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;"><i data-lucide="check" style="width:16px;"></i> Viewed</span>' : `<button class="btn btn-primary mark-viewed-btn" data-id="${mat.id}" style="padding: 0.6rem 1.2rem; font-size: 0.85rem; background: #2ecc71; border-color: #2ecc71;">Mark as Viewed</button>`}</div></div>`;
                const body = card.querySelector('.item-body');
                body.appendChild(createCommentSection(mat.id, 'material'));
                card.querySelector('.item-header').addEventListener('click', () => { const icon = card.querySelector('.dropdown-icon'); const isOpen = body.style.display === 'block'; body.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? '' : 'rotate(180deg)'; });
                if(!isViewed) { 
                    card.querySelector('.mark-viewed-btn').addEventListener('click', async (e) => { 
                        if (isAnonymous) {
                            let anonProgress = JSON.parse(localStorage.getItem('anonProgress')) || { submissions: [], views: [] };
                            if (!anonProgress.views.includes(mat.id)) {
                                anonProgress.views.push(mat.id);
                                localStorage.setItem('anonProgress', JSON.stringify(anonProgress));
                            }
                            loadLearningCurriculum(); loadLearningCategories();
                        } else {
                            const res = await fetch('../api/courses.php?type=material_views', { method: 'POST', body: JSON.stringify({ material_id: mat.id, student_id: currentUser.id }) }); 
                            if(res.ok) { loadLearningCurriculum(); loadLearningCategories(); } 
                        }
                    }); 
                }
                learningCurriculumItems.appendChild(card);
            });
            activities.forEach(act => {
                const isDone = parseInt(act.is_done) > 0; const card = document.createElement('div'); card.className = 'course-card'; card.style.padding = '1.2rem'; card.style.borderLeft = `4px solid ${isDone ? '#2ecc71' : 'var(--secondary-color)'}`;
                card.innerHTML = `<div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;" class="item-header"><div style="display: flex; align-items: center; gap: 12px;"><i data-lucide="${isDone ? 'check-circle' : 'activity'}" style="width: 20px; color: ${isDone ? '#2ecc71' : 'var(--secondary-color)'}"></i><strong style="color: ${isDone ? '#27ae60' : '#333'};">${act.title}</strong></div><i data-lucide="chevron-down" class="dropdown-icon" style="width: 16px;"></i></div><div class="item-body" style="display: none; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #eee;"><p style="font-size: 0.85rem; color: #666; margin-bottom: 1.5rem;">${act.description || ''}</p>${getPreviewHTML(act.content_url, 'google_form')}<div style="margin-top: 1.5rem; display: flex; justify-content: flex-end;">${isDone ? '<span style="color: #2ecc71; font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px;"><i data-lucide="check" style="width:16px;"></i> Completed</span>' : `<button class="btn btn-primary mark-done-btn" data-id="${act.id}" style="padding: 0.6rem 1.2rem; font-size: 0.85rem;">Mark as Done</button>`}</div></div>`;
                const body = card.querySelector('.item-body');
                body.appendChild(createCommentSection(act.id, 'activity'));
                card.querySelector('.item-header').addEventListener('click', () => { const icon = card.querySelector('.dropdown-icon'); const isOpen = body.style.display === 'block'; body.style.display = isOpen ? 'none' : 'block'; icon.style.transform = isOpen ? '' : 'rotate(180deg)'; });
                if(!isDone) { 
                    card.querySelector('.mark-done-btn').addEventListener('click', async (e) => { 
                        if (isAnonymous) {
                            let anonProgress = JSON.parse(localStorage.getItem('anonProgress')) || { submissions: [], views: [] };
                            if (!anonProgress.submissions.includes(act.id)) {
                                anonProgress.submissions.push(act.id);
                                localStorage.setItem('anonProgress', JSON.stringify(anonProgress));
                            }
                            loadLearningCurriculum(); loadLearningCategories();
                        } else {
                            const res = await fetch('../api/courses.php?type=submissions', { method: 'POST', body: JSON.stringify({ activity_id: act.id, student_id: currentUser.id }) }); 
                            if(res.ok) { loadLearningCurriculum(); loadLearningCategories(); } 
                        }
                    }); 
                }
                learningCurriculumItems.appendChild(card);
            });
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (e) {
            console.error('Error loading curriculum:', e);
            learningCurriculumItems.innerHTML = '<p style="padding: 2rem; color: red; text-align: center;">An error occurred while loading content. Please try again.</p>';
        }
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
    if (currentUser) { 
        if (currentUser.role === 'instructor') { 
            switchView(instructorDashboard); loadInstructorCourses(); 
        } else { 
            switchView(studentDashboard); 
            const nameDisplay = document.getElementById('student-name-display'); 
            if(nameDisplay && currentUser.name) nameDisplay.textContent = currentUser.name.split(' ')[0]; 
            loadStudentCourses(); loadEnrolledCourses(); 
        } 
    }
    document.querySelectorAll('.logout-btn').forEach(btn => btn.addEventListener('click', () => { 
        localStorage.removeItem('currentUser'); 
        localStorage.removeItem('anonProgress');
        window.location.reload(); 
    }));
    if(loginForm) { 
        loginForm.addEventListener('submit', async (e) => { 
            e.preventDefault(); 
            const data = { 
                email: document.getElementById('login-email').value, 
                password: document.getElementById('login-password').value 
            }; 
            try {
                const response = await fetch('../api/login.php', { method: 'POST', body: JSON.stringify(data) }); 
                const text = await response.text();
                let result;
                try {
                    result = JSON.parse(text);
                } catch (jsonErr) {
                    console.error('API Error Response:', text);
                    const msgEl = document.getElementById('login-message');
                    if(msgEl) {
                        if (text.includes('__test')) {
                            msgEl.innerHTML = '<strong>Hosting Security Challenge:</strong> Please <a href="../api/login.php" target="_blank" style="color: blue; text-decoration: underline;">click here</a> to verify your browser, then refresh this page and try again.';
                        } else {
                            msgEl.textContent = 'Server Error: The server returned an invalid response.';
                        }
                        msgEl.style.display = 'block';
                        msgEl.style.color = '#721c24';
                        msgEl.style.background = '#f8d7da';
                        msgEl.style.padding = '10px';
                        msgEl.style.borderRadius = '5px';
                        msgEl.style.marginTop = '10px';
                    }
                    return;
                }
                
                if (response.ok) { 
                    localStorage.setItem('currentUser', JSON.stringify(result.user)); 
                    window.location.reload(); 
                } else {
                    const msgEl = document.getElementById('login-message');
                    if(msgEl) {
                        msgEl.textContent = result.message || 'Login failed.';
                        msgEl.style.display = 'block';
                        msgEl.style.color = 'red';
                    }
                }
            } catch (fetchErr) {
                console.error('Login fetch error:', fetchErr);
            }
        }); 
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            
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

            const msgEl = document.getElementById('register-message');
            if (msgEl) msgEl.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            try {
                const response = await fetch('../api/register.php', {
                    method: 'POST',
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (msgEl) {
                    msgEl.textContent = result.message;
                    msgEl.style.display = 'block';
                    msgEl.style.color = response.ok ? '#2ecc71' : '#ff4d4d';
                }

                if (response.ok) {
                    registerForm.reset();
                    setTimeout(() => switchView(loginView), 2000);
                }
            } catch (err) {
                console.error('Registration error:', err);
                if (msgEl) {
                    msgEl.textContent = 'System Error. Please try again later.';
                    msgEl.style.display = 'block';
                    msgEl.style.color = '#ff4d4d';
                }
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    if(addCourseForm) { addCourseForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { instructor_id: currentUser.id, title: document.getElementById('course-title').value, description: document.getElementById('course-desc').value }; const response = await fetch('../api/courses.php?type=courses', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { loadInstructorCourses(); addCourseForm.reset(); } }); }
    if(searchInput) { searchInput.addEventListener('input', (e) => { loadStudentCourses(e.target.value); }); }

    function getPreviewHTML(url, type) {
        if (!url) return '';
        if (url.includes('docs.google.com/forms')) { 
            return `<div style="padding: 2rem; background: #fdf2f2; border-radius: 15px; text-align: center; border: 1px solid #fee2e2;">
                <div style="margin-bottom: 1rem;">
                    <i data-lucide="file-text" style="width: 48px; height: 48px; color: #b91c1c;"></i>
                </div>
                <h4 style="margin-bottom: 0.5rem; color: #b91c1c;">Google Form Activity</h4>
                <p style="font-size: 0.85rem; color: #7f1d1d; margin-bottom: 1.5rem;">This activity requires you to complete a Google Form.</p>
                <a href="${url}" target="_blank" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 8px; background: #7c3aed; border-color: #7c3aed;">
                    Open Google Form <i data-lucide="external-link" style="width: 16px;"></i>
                </a>
            </div>`; 
        }
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
                    const preview = card.querySelector('.preview-content');
                    preview.appendChild(createCommentSection(mat.id, 'material'));
                    
                    card.addEventListener('click', (e) => { 
                        if(e.target.closest('.edit-mat-btn') || e.target.closest('.edit-mode') || e.target.closest('.comment-section')) return; 
                        const icon = card.querySelector('.dropdown-icon'); 
                        const isOpen = preview.style.display === 'block'; 
                        preview.style.display = isOpen ? 'none' : 'block'; 
                        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; 
                    });
                    
                    card.querySelector('.edit-mat-btn').addEventListener('click', (e) => { e.stopPropagation(); card.querySelector('.edit-mode').style.display = 'block'; preview.style.display = 'none'; });
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
                    const preview = el.querySelector('.preview-content');
                    preview.appendChild(createCommentSection(act.id, 'activity'));
                    
                    el.addEventListener('click', (e) => { 
                        if(e.target.closest('.edit-act-btn') || e.target.closest('.edit-mode') || e.target.closest('.comment-section')) return; 
                        const icon = el.querySelector('.dropdown-icon'); 
                        const isOpen = preview.style.display === 'block'; 
                        preview.style.display = isOpen ? 'none' : 'block'; 
                        icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)'; 
                    });
                    
                    el.querySelector('.edit-act-btn').addEventListener('click', (e) => { e.stopPropagation(); el.querySelector('.edit-mode').style.display = 'block'; preview.style.display = 'none'; });
                    el.querySelector('.cancel-edit-act').addEventListener('click', (e) => { e.stopPropagation(); el.querySelector('.edit-mode').style.display = 'none'; });
                    el.querySelector('.inline-edit-act-form').addEventListener('submit', async (e) => { e.preventDefault(); const data = { id: act.id, title: el.querySelector('.edit-title').value, content_url: el.querySelector('.edit-url').value, sequence_number: el.querySelector('.edit-seq').value || 0, description: el.querySelector('.edit-desc').value, activity_type: 'google_form' }; const response = await fetch('../api/courses.php?type=activities', { method: 'PUT', body: JSON.stringify(data) }); if(response.ok) loadCurriculumItems(); });
                    container.appendChild(el); list.appendChild(container);
                });
            }
            if(typeof lucide !== 'undefined') lucide.createIcons();
        } catch (error) {}
    }
    if(document.getElementById('show-add-activity')) document.getElementById('show-add-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'block'; document.getElementById('add-material-container').style.display = 'none'; });
    if(document.getElementById('cancel-activity')) document.getElementById('cancel-activity').addEventListener('click', () => { document.getElementById('add-activity-container').style.display = 'none'; });
    if(document.getElementById('show-add-material')) document.getElementById('show-add-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'block'; document.getElementById('add-activity-container').style.display = 'none'; });
    if(document.getElementById('cancel-material')) document.getElementById('cancel-material').addEventListener('click', () => { document.getElementById('add-material-container').style.display = 'none'; });
    if(addActivityForm) {
        addActivityForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { category_id: selectedCategory.id, course_id: selectedCourse.id, title: document.getElementById('act-title').value, content_url: document.getElementById('act-url').value, activity_type: 'google_form', sequence_number: document.getElementById('act-sequence').value || 0, description: document.getElementById('act-desc-simple').value }; const response = await fetch('../api/courses.php?type=activities', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { addActivityForm.reset(); document.getElementById('act-sequence').value = 0; document.getElementById('add-activity-container').style.display = 'none'; loadCurriculumItems(); } });
    }
    if(addMaterialForm) {
        addMaterialForm.addEventListener('submit', async (e) => { e.preventDefault(); const data = { course_id: selectedCourse.id, category_id: selectedCategory.id, title: document.getElementById('mat-title').value, description: document.getElementById('mat-desc').value, url: document.getElementById('mat-url').value, material_type: document.getElementById('mat-type').value }; const response = await fetch('../api/courses.php?type=materials', { method: 'POST', body: JSON.stringify(data) }); if (response.ok) { addMaterialForm.reset(); document.getElementById('add-material-container').style.display = 'none'; loadCurriculumItems(); } });
    }

    if(addCategoryForm) {
        addCategoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                course_id: selectedCourse.id,
                name: document.getElementById('cat-name').value
            };
            const response = await fetch('../api/courses.php?type=categories', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            if (response.ok) {
                addCategoryForm.reset();
                loadCategories();
            }
        });
    }
});
