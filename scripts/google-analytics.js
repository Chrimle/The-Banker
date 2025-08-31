import { ANALYTICS_CONSENT, GOOGLE_ANALYTICS_ID } from "./constants.js";

export function loadGoogleAnalytics() {
    let script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
    document.head.appendChild(script);

    script.onload = function () {
        window.dataLayer = window.dataLayer || [];
        function gtag() { dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GOOGLE_ANALYTICS_ID);
        GoogleAnalytics.setGtagFunction(gtag);
    };
}

export class GoogleAnalytics {

    static #gtag = null;

    static setGtagFunction(gtagFunction) {
        this.#gtag = gtagFunction;
    }

    static reportTutorialBegin() {
        if (!this.isAnalyticsConsented() || typeof this.#gtag !== 'function') {
            console.debug('Analytics not consented, not reporting tutorial begin');
            return;
        }
        console.debug('Reporting tutorial begin to Google Analytics');
        this.#gtag("event", "tutorial_begin");
    }

    static reportTutorialComplete() {
        if (!this.isAnalyticsConsented() || typeof this.#gtag !== 'function') {
            console.debug('Analytics not consented, not reporting tutorial complete');
            return;
        }
        console.debug('Reporting tutorial complete to Google Analytics');
        this.#gtag("event", "tutorial_complete");
    }

    static isAnalyticsConsented() {
        return localStorage.getItem(ANALYTICS_CONSENT) === 'true';
    }
}