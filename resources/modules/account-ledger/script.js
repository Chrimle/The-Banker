
export async function insertAccountLedger() {
    const response = await fetch("./resources/modules/account-ledger/template.html");
    const html = await response.text();
    document.querySelector("#table").insertAdjacentHTML("beforeend", html);

    if (!document.getElementById("account-ledger-style")) {
        const link = document.createElement("link");
        link.id = "account-ledger-style";
        link.rel = "stylesheet";
        link.href = "./resources/modules/account-ledger/style.css";
        document.head.appendChild(link);
    }

    const ACCOUNT_LEDGER_WIDTH = 400;
    const ACCOUNT_LEDGER_HEIGHT = 275;


    const tableBody = document.querySelector("#ledger-table");

    function createRow() {
        const row = document.createElement("tr");
        const headers = ["SSN", "Name", "Balance", "Loan"];
        headers.forEach(() => {
            const td = document.createElement("td");
            const input = document.createElement("input");
            input.type = "text";
            input.addEventListener("input", () => {
                if (row === tableBody.lastElementChild) {
                    addRow();
                }
            });
            td.appendChild(input);
            row.appendChild(td);
        });
        return row;
    }

    function addRow() {
        tableBody.appendChild(createRow());
    }

    for (let i = 0; i < 13; i++) addRow();

    const box = document.getElementById("ledger-box");
    const header = document.getElementById("ledger-header");
    let offsetX = 0, offsetY = 0, dragging = false;

    box.addEventListener("mousedown", (e) => {
        dragging = true;
        offsetX = e.clientX - box.offsetLeft;
        offsetY = e.clientY - box.offsetTop;
    });
    document.addEventListener("mousemove", (e) => {
        if (dragging) {
            const maxLeft = table.clientWidth - ACCOUNT_LEDGER_WIDTH;
            const maxTop = table.clientHeight - ACCOUNT_LEDGER_HEIGHT;

            box.style.left = Math.max(0, Math.min(maxLeft, e.clientX - offsetX)) + "px";
            box.style.top = Math.max(0, Math.min(maxTop, e.clientY - offsetY)) + "px";
        }
    });
    document.addEventListener("mouseup", () => dragging = false);

    box.style.display = "block";
}