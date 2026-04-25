document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Reveal on Scroll
    const revealElements = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        for (let i = 0; i < revealElements.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = revealElements[i].getBoundingClientRect().top;
            const elementVisible = 150;
            if (elementTop < windowHeight - elementVisible) {
                revealElements[i].classList.add('active');
            }
        }
    };

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Run once on load

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click or click outside
        document.addEventListener('click', (e) => {
            const isClickInsideMenu = e.target.closest('.nav-links');
            const isClickOnToggle = e.target.closest('.menu-toggle');
            
            if (isClickInsideMenu && e.target.closest('a')) {
                // Clicked a link inside
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            } else if (!isClickInsideMenu && !isClickOnToggle) {
                // Clicked outside
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }
});
