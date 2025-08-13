
export function setupHowToPopup() {

    document.getElementById('info-btn').addEventListener('click', function () {
        document.getElementById('howto-popup').hidden = false;
    });

    document.querySelector('.howto-popup-close').addEventListener('click', function () {
        document.getElementById('howto-popup').hidden = true;
    });

    document.getElementById('howto-popup').addEventListener('click', function (e) {
        if (e.target === this) this.hidden = true;
    });
}