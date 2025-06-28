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
    
    setTimeout(() => {
        document.getElementById("home-animation-svg").style.opacity = 1;
        var style = document.createElement('style');
        style.innerHTML = `
            .livestream-icon svg {
                animation: iconEntrance 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }

            .livestream-icon::before {
                animation: pulse 1.5s ease-out 0.5s forwards;
            }
        `
        document.head.appendChild(style);
    }, 500);
    

    function startNewStream() {
        toast.success('Connecting', `Preparing to start a new stream...`);
        preloaderControl.show()
        setTimeout(() => {
            preloaderControl.hide();
            toast.warning('Development Notice', 'The Livestream View feature is under development, please wait for the next version!');
        }, 4000);
    }
});