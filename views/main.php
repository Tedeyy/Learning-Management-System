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
    <div id="register-view" class="auth-card view">
        <h2>Create Account</h2>
        <p>Join EduReady and start learning today.</p>
        
        <div id="register-message" style="margin-bottom: 1rem; text-align: center; font-size: 0.9rem; display: none"></div>
        
        <form id="register-form">
            <div class="form-group">
                <label for="reg-name">Full Name</label>
                <input type="text" id="reg-name" placeholder="John Doe" required>
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
