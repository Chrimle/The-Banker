import { insertCookieBannerTemplate } from "../resources/modules/cookie-banner/script.js";
import { GoogleAnalytics } from "./google-analytics.js";

function setupAcceptButton() {
    document.getElementById('analytics-accept').addEventListener('click', function () {
        console.debug('Analytics consented');
        GoogleAnalytics.setAnalyticsConsented(true);
        document.getElementById('analytics-banner').style.display = 'none';
    });
}

function setupRejectButton() {
    document.getElementById('analytics-reject').addEventListener('click', function () {
        console.debug('Analytics not consented');
        GoogleAnalytics.setAnalyticsConsented(false);
        document.getElementById('analytics-banner').style.display = 'none';
    });
}

GoogleAnalytics.initialize();

if (!GoogleAnalytics.isAnalyticsConsentSet()) {
    console.debug('Analytics consent not set, showing banner');
    await insertCookieBannerTemplate();
    setupAcceptButton();
    setupRejectButton();
}
