document.addEventListener('DOMContentLoaded', () => {
    const toggleAuthBtn = document.getElementById('toggle-auth');
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');

    const switchView = (viewToShow, viewToHide, navText) => {
        viewToHide.classList.remove('active');
        setTimeout(() => {
            viewToShow.classList.add('active');
            toggleAuthBtn.textContent = navText;
        }, 100);
    };

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
});
