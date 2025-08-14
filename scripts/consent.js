import { loadGoogleAnalytics } from "./google-analytics.js";

const ANALYTICS_CONSENT = 'consented-analytics';

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
        document.getElementById('analytics-banner').style.display = 'flex';
        break;
}

document.getElementById('analytics-accept').addEventListener('click', function () {
    console.debug('Analytics consented');
    localStorage.setItem(ANALYTICS_CONSENT, 'true');
    document.getElementById('analytics-banner').style.display = 'none';
    loadGoogleAnalytics();
});

document.getElementById('analytics-reject').addEventListener('click', function () {
    console.debug('Analytics not consented');
    localStorage.setItem(ANALYTICS_CONSENT, 'false');
    document.getElementById('analytics-banner').style.display = 'none';
});