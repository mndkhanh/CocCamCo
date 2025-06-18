const btnMenu = document.getElementById('btn-menu');
const sidebar = document.getElementById('sidebar');
const btnClose = document.getElementById('btn-close');

// Mở sidebar
btnMenu.addEventListener('click', () => {
    sidebar.style.left = '0';
    sidebar.style.pointerEvents = 'auto';
});

// Đóng sidebar
btnClose.addEventListener('click', () => {
    sidebar.style.left = '-100%';
    sidebar.style.pointerEvents = 'none';
});

const header = document.querySelector('header');

function smoothScrollTo(targetId, headerOffset = 200) {
    const target = document.getElementById(targetId);
    if (target) {
        const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}
// Handle nav and sidebar links
document.querySelectorAll('.nav-links a[href^="#"], #sidebar a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        smoothScrollTo(targetId);

        if (sidebar.contains(link)) {
            sidebar.style.left = '-100%';
            sidebar.style.pointerEvents = 'none';
        }
    });
});

// Handle logo click
const logoLink = document.querySelector('#logo-link');
if (logoLink) {
    logoLink.addEventListener('click', e => {
        e.preventDefault();
        smoothScrollTo('hero'); // Assuming your hero section has id="hero"
    });
}

// Đóng sidebar khi click ra ngoài
document.addEventListener('click', (e) => {
    const isClickInsideSidebar = sidebar.contains(e.target);
    const isClickOnBtnMenu = btnMenu.contains(e.target);
    if (!isClickInsideSidebar && !isClickOnBtnMenu) {
        sidebar.style.left = '-100%';
        sidebar.style.pointerEvents = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            setTimeout(() => {

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100); // Delay to ensure layout is fully rendered
        }
    }
});