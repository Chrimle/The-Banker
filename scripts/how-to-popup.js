
const HAS_READ_HOW_TO = 'has-read-how-to';

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

    if (localStorage.getItem(HAS_READ_HOW_TO) === null) {
        document.getElementById('howto-popup').hidden = false;
        localStorage.setItem(HAS_READ_HOW_TO, 'true');
    }
}