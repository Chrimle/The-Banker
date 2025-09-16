
export class Receipt {

    static createHtmlElement(tableHtmlElement) {
        const receipt = document.getElementById('receipt-template').content.firstElementChild.cloneNode(true);
        receipt.addlistene
        tableHtmlElement.appendChild(receipt);
        return receipt;
    }

}