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

// Chọn tất cả link trong nav-links và sidebar có href bắt đầu bằng #
document.querySelectorAll('.nav-links a[href^="#"], #sidebar a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            // Scroll mượt
            target.scrollIntoView({ behavior: 'smooth' });
            // Nếu link trong sidebar thì đóng sidebar luôn
            if (sidebar.contains(link)) {
                sidebar.style.left = '-100%';
                sidebar.style.pointerEvents = 'none';
            }
        }
    });
});
