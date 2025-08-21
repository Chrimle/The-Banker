export class TransferBox {

    static getHtmlElement() {
        return document.querySelector('.drawer');
    }

    static getBoundingBox() {
        const clientRect = TransferBox.getHtmlElement().getBoundingClientRect();
        return {
            left: clientRect.left,
            right: clientRect.right,
            top: clientRect.top,
            bottom: clientRect.bottom
        };
    }
}