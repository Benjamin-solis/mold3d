// ========================================
// MOLD3D - Main Application Logic
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollEffects();
    initMobileMenu();
    initApp();
});

// ========================================
// Navigation
// ========================================
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

    // Handle anchor navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            closeMobileMenu();
        });
    });

    // Handle floating cart click (if on the same page, although now it's a link to cart.html)
    // We keep this just in case we want to intercept clicks, but standard link behavior is fine now.
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const sectionTop = section.offsetTop - headerHeight;

        window.scrollTo({
            top: sectionTop,
            behavior: 'smooth'
        });
    }
}

function showCartSection() {
    const cartSection = document.getElementById('cart');
    const otherSections = document.querySelectorAll('.section:not(#cart)');

    otherSections.forEach(section => section.classList.add('hidden'));
    cartSection.classList.remove('hidden');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function hideCartSection() {
    const cartSection = document.getElementById('cart');
    const otherSections = document.querySelectorAll('.section:not(#cart)');

    cartSection.classList.add('hidden');
    otherSections.forEach(section => section.classList.remove('hidden'));
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');

    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
}

function closeMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.getElementById('menuToggle');

    navMenu.classList.remove('active');
    menuToggle.classList.remove('active');
}

// ========================================
// Scroll Effects
// ========================================
function initScrollEffects() {
    const header = document.getElementById('header');

    // Header scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Reveal animations
    revealElements();
}

// Separate function to handle reveal animations
// Can be called multiple times when new elements are added
function revealElements() {
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
        revealObserver.observe(element);
    });
}

// ========================================
// App Initialization
// ========================================
async function initApp() {
    try {
        // Load products
        await loadProducts();

        // Initialize cart
        updateCartDisplay();

        console.log('✅ MOLD3D App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
    }
}

// ========================================
// Utility Functions
// ========================================
function formatPrice(price) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0
    }).format(price);
}

// Export utility functions
window.formatPrice = formatPrice;
window.revealElements = revealElements;
