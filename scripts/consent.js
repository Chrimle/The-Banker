import { insertCookieBannerTemplate } from "../resources/modules/cookie-banner/script.js";
import { ANALYTICS_CONSENT } from "./constants.js";
import { loadGoogleAnalytics } from "./google-analytics.js";

function setupAcceptButton() {
    document.getElementById('analytics-accept').addEventListener('click', function () {
        console.debug('Analytics consented');
        localStorage.setItem(ANALYTICS_CONSENT, 'true');
        document.getElementById('analytics-banner').style.display = 'none';
        loadGoogleAnalytics();
    });
}

function setupRejectButton() {
    document.getElementById('analytics-reject').addEventListener('click', function () {
        console.debug('Analytics not consented');
        localStorage.setItem(ANALYTICS_CONSENT, 'false');
        document.getElementById('analytics-banner').style.display = 'none';
    });
}

switch (localStorage.getItem(ANALYTICS_CONSENT)) {
    case 'true':
        console.debug('Analytics consented');
        loadGoogleAnalytics();
        break;
    case 'false':
        console.debug('Analytics not consented');
        break;
    default:
        console.debug('Analytics consent not set, showing banner');
        await insertCookieBannerTemplate();
        setupAcceptButton();
        setupRejectButton();
        break;
}
