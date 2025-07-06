document.addEventListener('DOMContentLoaded', function () {
    // Start new stream button
    document.querySelector('.btn-new')?.addEventListener('click', startNewStream);

    document.getElementById('advanced-toggle').addEventListener('click', function (e) {
        e.preventDefault();
        const settings = document.getElementById('advanced-settings');
        const section = document.getElementsByClassName('code-section')[0];
        const toggle = this;

        if (settings.style.display === 'flex') {
            settings.style.display = 'none';
            section.classList.toggle('expand')
            toggle.textContent = 'Click to open advanced Connection Settings';
        } else {
            settings.style.display = 'flex';
            section.classList.toggle('expand')
            toggle.textContent = 'Click to hide advanced Connection Settings';
        }
    });
});