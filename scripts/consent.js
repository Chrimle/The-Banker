const ANALYTICS_CONSENT = 'consented-analytics';

switch (localStorage.getItem(ANALYTICS_CONSENT)) {
    case 'true':
        console.debug('Analytics consented');
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
    localStorage.setItem(ANALYTICS_CONSENT, 'true');
    document.getElementById('analytics-banner').style.display = 'none';
    loadGoogleAnalytics();
});

document.getElementById('analytics-reject').addEventListener('click', function () {
    localStorage.setItem(ANALYTICS_CONSENT, 'false');
    document.getElementById('analytics-banner').style.display = 'none';
});