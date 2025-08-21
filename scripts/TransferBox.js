export class TransferBox {

    static LID_OPEN_TRANSLATE_Y = -130;

    static IS_LID_OPEN = false;

    static getDrawerHtmlElement() {
        return document.querySelector('.drawer');
    }

    static getLidHtmlElement() {
        return document.querySelector('.lid');
    }

    static getBoundingBox() {
        const clientRect = TransferBox.getDrawerHtmlElement().getBoundingClientRect();
        return {
            left: clientRect.left,
            right: clientRect.right,
            top: clientRect.top,
            bottom: clientRect.bottom
        };
    }

    static moveLid({ value = 0 } = {}) {
        const newTranslateY = Math.min(0, Math.max(TransferBox.LID_OPEN_TRANSLATE_Y, value));
        TransferBox.getLidHtmlElement().style.transform = `translate(-50%, ${newTranslateY}px)`;
        TransferBox.IS_LID_OPEN = newTranslateY === TransferBox.LID_OPEN_TRANSLATE_Y;
        return TransferBox.IS_LID_OPEN;
    }

    static closeLid() {
        return TransferBox.moveLid();
    }

    static openLid() {
        return TransferBox.moveLid({ value: TransferBox.LID_OPEN_TRANSLATE_Y });
    }
}