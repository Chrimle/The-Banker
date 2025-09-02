import { ANALYTICS_CONSENT, GOOGLE_ANALYTICS_ID } from "./constants.js";

export class GoogleAnalytics {

    static #gtag = null;

    static KEY_EVENT = 'event';
    static EVENT_TUTORIAL_BEGIN = 'tutorial_begin';
    static EVENT_TUTORIAL_COMPLETE = 'tutorial_complete';
    static EVENT_LEVEL_START = 'level_start';
    static EVENT_LEVEL_END = 'level_end';

    static initialize() {
        console.log('Initializing Google Analytics...');

        let script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`;
        document.head.appendChild(script);

        script.onload = function () {
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'personalization_storage': 'denied',
                'security_storage': 'granted'
            });
            gtag('js', new Date());
            gtag('config', GOOGLE_ANALYTICS_ID);
            GoogleAnalytics.setGtagFunction(gtag);
            GoogleAnalytics.updateAnalyticsStorageConsent();
        };
    }

    static setGtagFunction(gtagFunction) {
        this.#gtag = gtagFunction;
    }

    static updateAnalyticsStorageConsent() {
        console.log('Updating analytics_storage consent to', GoogleAnalytics.isAnalyticsConsented() ? 'granted' : 'denied');
        
        this.#gtag('consent', 'update', {
            'analytics_storage': GoogleAnalytics.isAnalyticsConsented() ? 'granted' : 'denied'
        });
    }

    static reportEvent(eventName, functionToCall) {
        if (typeof this.#gtag !== 'function') {
            console.debug(`Google Analytics not initialized yet, not reporting event: ${eventName}`);
            return;
        }
        console.debug(`Reporting event to Google Analytics: ${eventName}`);
        functionToCall();
    }

    static reportTutorialBegin() {
        this.reportEvent(this.EVENT_TUTORIAL_BEGIN, () => {
            this.#gtag(this.KEY_EVENT, this.EVENT_TUTORIAL_BEGIN);
        });
    }

    static reportTutorialComplete() {
        this.reportEvent(this.EVENT_TUTORIAL_COMPLETE, () => {
            this.#gtag(this.KEY_EVENT, this.EVENT_TUTORIAL_COMPLETE);
        });
    }

    static reportLevelStart(levelName) {
        this.reportEvent(this.EVENT_LEVEL_START, () => {
            this.#gtag(this.KEY_EVENT, this.EVENT_LEVEL_START, {
                level_name: levelName
            });
        });
    }

    static reportLevelEnd(levelName, success) {
        this.reportEvent(this.EVENT_LEVEL_END, () => {
            this.#gtag(this.KEY_EVENT, this.EVENT_LEVEL_END, {
                level_name: levelName,
                success: success
            });
        });
    }

    static isAnalyticsConsented() {
        return localStorage.getItem(ANALYTICS_CONSENT) === 'true';
    }

    static isAnalyticsConsentSet() {
        return localStorage.getItem(ANALYTICS_CONSENT) !== null;
    }

    static setAnalyticsConsented(consent) {
        localStorage.setItem(ANALYTICS_CONSENT, consent ? 'true' : 'false');
        this.updateAnalyticsStorageConsent();
    }
}