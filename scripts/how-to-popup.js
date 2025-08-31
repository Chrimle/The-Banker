import { GoogleAnalytics } from "./google-analytics.js";

const HAS_READ_HOW_TO = 'has-read-how-to';

export function setupHowToPopup() {

    document.getElementById('info-btn').addEventListener('click', function () {
        document.getElementById('howto-popup').hidden = false;
        GoogleAnalytics.reportTutorialBegin();
    });

    document.querySelector('.howto-popup-close').addEventListener('click', function () {
        document.getElementById('howto-popup').hidden = true;
        GoogleAnalytics.reportTutorialComplete();
    });

    document.querySelector('.howto-popup-play-button').addEventListener('click', function () {
        document.getElementById('howto-popup').hidden = true;
        GoogleAnalytics.reportTutorialComplete();
    });

    document.getElementById('howto-popup').addEventListener('click', function (e) {
        if (e.target === this) {
            this.hidden = true;
            GoogleAnalytics.reportTutorialComplete();
        }
    });

    if (localStorage.getItem(HAS_READ_HOW_TO) === null) {
        GoogleAnalytics.reportTutorialBegin();
        document.getElementById('howto-popup').hidden = false;
        localStorage.setItem(HAS_READ_HOW_TO, 'true');
    }
}