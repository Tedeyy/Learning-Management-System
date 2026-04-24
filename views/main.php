<?php 
    include 'content/header.php'; 
    include 'content/navbar.php';
?>

<main class="auth-container">
    <!-- Login View -->
    <div id="login-view" class="auth-card view active">
        <h2>Welcome Back</h2>
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
        
        <div id="register-message" style="margin-bottom: 1rem; text-align: center; font-size: 0.9rem; display: none"></div>
        
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
                    <select id="reg-role" class="form-control" style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid #ddd;" required>
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
                    <select id="reg-gender" class="form-control" style="width:100%; padding:0.8rem; border-radius:10px; border:1px solid #ddd;" required>
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
</main>

<?php include 'content/footer.php'; ?>
