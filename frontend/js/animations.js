function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.classList.toggle('hidden', !show);
}

function animateDashboard() {
    const sections = document.querySelectorAll('.chart-card, .metric-card, .insight-box, .panel');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(12px)';
        section.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, 120 * index);
    });
}
