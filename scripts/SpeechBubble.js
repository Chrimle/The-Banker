export class SpeechBubble {

    static SPEECH_BUBBLE = '.speech-bubble';
    static TEXT = '.speech-bubble-text';
    static REJECT_BUTTON = '.speech-bubble-reject';

    static getSpeechBubble() {
        return document.querySelector(SpeechBubble.SPEECH_BUBBLE);
    }

    static getTextElement() {
        return document.querySelector(SpeechBubble.TEXT);
    }

    static getRejectButton() {
        return document.querySelector(SpeechBubble.REJECT_BUTTON);
    }


    static setText(text) {
        this.getTextElement().textContent = text;
    }

    static showRejectButton() {
        this.getRejectButton().style.display = 'block';
    }

    static hideRejectButton() {
        this.getRejectButton().style.display = 'none';
    }

    static hideSpeechBubble() {
        this.getSpeechBubble().style.opacity = '0';
    }

    static showSpeechBubble() {
        this.getSpeechBubble().style.opacity = '1';
    }

    static rejectCustomer() {
        console.debug('Customer rejected');
        SpeechBubble.setText(`Rude! 😢`);
        SpeechBubble.hideRejectButton();
        SpeechBubble.hideSpeechBubble();
    }

    static satisfyCustomer() {
        console.debug('Customer satisfied');
        SpeechBubble.setText(`Thank you! 😊`);
        SpeechBubble.hideRejectButton();
        SpeechBubble.hideSpeechBubble();
    }

    static requestWithdraw(sum) {
        SpeechBubble.setText(`Hello! I would like to withdraw $${sum} please.`);
    }

    static requestDeposit(sum) {
        SpeechBubble.setText(`Hello! I would like to deposit $${sum} please.`);
    }

    static incorrectWithdrawSum(expectedSum, actualSum) {
        SpeechBubble.setText(`I asked for $${expectedSum}, but you gave me $${actualSum}.`);
    }

    static depositBoxOccupied() {
        SpeechBubble.setText(`I asked to make a deposit, please empty the Transfer Box.`);
    }

    static depositNotTaken() {
        SpeechBubble.setText(`I asked to make a deposit, please take my money.`);
    }

}