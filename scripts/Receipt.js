
export class Receipt {

    static createHtmlElement(tableHtmlElement) {
        const receipt = document.getElementById("receipt-template").content.firstElementChild.cloneNode(true);
        this.onSsnInput(receipt);
        tableHtmlElement.appendChild(receipt);
        return receipt;
    }

    static onSsnInput(receipt) {
        const ssnInput = receipt.querySelector(".receipt-input-ssn");
        ssnInput.addEventListener("input", () => {
            let digits = ssnInput.value.replace(/\D/g, "").slice(0, 9);
            let out = digits;
            if (digits.length > 5) out = digits.slice(0, 3) + "-" + digits.slice(3, 5) + "-" + digits.slice(5);
            else if (digits.length > 3) out = digits.slice(0, 3) + "-" + digits.slice(3);
            ssnInput.value = out;
        });
    }

}