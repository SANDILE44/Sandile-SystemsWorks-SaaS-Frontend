
    document.addEventListener("DOMContentLoaded", function() {
        // Initialize Lucide Icons
        lucide.createIcons();

        // Mobile Menu DOM Elements
        const menuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        if (menuBtn && mobileMenu && menuIcon) {
            menuBtn.addEventListener('click', () => {
                // Toggle hidden class on panel
                const isHidden = mobileMenu.classList.toggle('hidden');
                
                // Dynamically update icon attribute based on state
                if (isHidden) {
                    menuIcon.setAttribute('data-lucide', 'menu');
                } else {
                    menuIcon.setAttribute('data-lucide', 'x');
                }
                
                // Re-render only the changed icon node
                lucide.createIcons({
                    attrs: {
                        class: 'w-6 h-6'
                    }
                });
            });
        }
    });
