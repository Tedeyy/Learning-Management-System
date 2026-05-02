<nav id="navbar" class="scrolled">
    <div class="container">
        <a href="../index.html" class="logo">
            <img src="../assets/img/logo.jpg" alt="EduReady Logo">
            EduReady
        </a>
        
        <!-- Guest Links (Login/Register) -->
        <ul class="nav-links" id="nav-guest">
            <li style="display: flex; align-items: center; gap: 1rem; color: #64748b; font-size: 0.9rem;">
                <span>Want to track your progress?</span>
                <a href="#" id="toggle-auth" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Sign In</a>
            </li>
        </ul>

        <!-- Student Links -->
        <ul class="nav-links" id="nav-student" style="display: none;">
            <li><a href="#">My Learnings</a></li>
            <li><a href="#">Explore</a></li>
            <li><a href="#" class="logout-btn">Logout</a></li>
        </ul>

        <!-- Instructor Links -->
        <ul class="nav-links" id="nav-instructor" style="display: none;">
            <li><a href="#">My Courses</a></li>
            <li><a href="#">Analytics</a></li>
            <li><a href="#" class="logout-btn">Logout</a></li>
        </ul>

        <div class="menu-toggle" id="mobile-menu">
            <span></span>
            <span></span>
            <span></span>
        </div>
    </div>
</nav>