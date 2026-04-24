document.addEventListener('DOMContentLoaded', () => {
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMsg = document.getElementById('login-message');
    const registerMsg = document.getElementById('register-message');

    const switchView = (viewToShow, viewToHide, navText) => {
        viewToHide.classList.remove('active');
        setTimeout(() => {
            viewToShow.classList.add('active');
            toggleAuthBtn.textContent = navText;
            loginMsg.style.display = 'none';
            registerMsg.style.display = 'none';
        }, 100);
    };

    const showMessage = (element, message, isError = true) => {
        element.textContent = message;
        element.style.color = isError ? '#e74c3c' : '#2ecc71';
        element.style.display = 'block';
    };

    // Navigation toggles
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(registerView, loginView, 'Login');
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(loginView, registerView, 'Sign Up');
    });

    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (loginView.classList.contains('active')) {
            switchView(registerView, loginView, 'Login');
        } else {
            switchView(loginView, registerView, 'Sign Up');
        }
    });

    // Handle Registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        try {
            const response = await fetch('../api/register.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(registerMsg, 'Registration successful! Redirecting to login...', false);
                setTimeout(() => switchView(loginView, registerView, 'Sign Up'), 2000);
            } else {
                showMessage(registerMsg, result.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showMessage(registerMsg, 'Server connection failed. Please ensure your XAMPP server is running and the database exists.');
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('../api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                showMessage(loginMsg, 'Login successful! Welcome, ' + result.user.name, false);
                // Redirect or update UI for logged-in state
                setTimeout(() => {
                    window.location.href = '../Index.html'; // Or dashboard if you have one
                }, 1500);
            } else {
                showMessage(loginMsg, result.message || 'Login failed.');
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage(loginMsg, 'Server connection failed. Please ensure your XAMPP server is running and the database exists.');
        }
    });
});
