// Simple navigation handler
document.addEventListener('DOMContentLoaded', function () {
    // Handle nav link clicks
    document.querySelectorAll('.nav-link, [data-target]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');

            if (targetId) {
                showContent(targetId);
            }
        });
    });

    // Handle back buttons
    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function () {
            showMainMenu();
        });
    });

    // Form submission handling (if needed)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Here you would add form validation
            // For example, you could use FormData to collect the inputs
            const formData = new FormData(this);

            // Send form data using fetch (server-side handling)
            fetch('/login', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    if (data.message === "Login successful") {
                        // Handle successful login
                        document.querySelector('.login-error-message').textContent = 'Login successful!';
                        // Maybe redirect or update UI
                    } else {
                        // Handle login error
                        document.querySelector('.login-error-message').textContent = 'Login failed. Please try again.';
                    }
                })
                .catch(error => {
                    document.querySelector('.login-error-message').textContent = 'An error occurred. Please try again.';
                    console.error('Error:', error);
                });
        });
    }
});

// Function to show specific content
function showContent(targetId) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show target section
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.classList.add('active');

        // Add class to hide menu
        document.querySelector('nav').classList.add('content-loaded');
    }
}

// Function to show main menu
function showMainMenu() {
    // Hide all content sections except default
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Show default view
    document.getElementById('default-view').classList.add('active');

    // Remove class to show menu again
    document.querySelector('nav').classList.remove('content-loaded');
}