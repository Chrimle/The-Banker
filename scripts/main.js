import { getNearestHorizontalRotation, getNearestVerticalRotation } from './maths.js';
import { setupHowToPopup } from './how-to-popup.js';
import { getFewestBillsForSum, getRandomBillsForSum, getValueSum } from './bills.js';
import { TransactionType } from './transactionType.js';
import { SpeechBubble } from './SpeechBubble.js';
import { SoundPlayer } from './SoundPlayer.js';
import { GameStatsManager } from './gameStats.js';
import { TransferBox } from './TransferBox.js';
import { CustomerManager } from './customer.js';
import { GoogleAnalytics } from './google-analytics.js';
import { insertAccountLedger } from '../resources/modules/account-ledger/script.js';

const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;
const overlay = document.getElementById("refresh-overlay");

window.addEventListener("resize", () => {
    if (window.innerWidth !== initialWidth || window.innerHeight !== initialHeight) {
        overlay.style.display = "flex";
    }
});

insertAccountLedger();

// Create a pseudo random economy before starting
for (let i = 0; i < 100; i++) {
    CustomerManager.simulateEconomyTick();
}

let currentCustomer;
let customerTransactionType;
let customerTransactionSum = 0;
let customerDeposited = false;
let billsInDrawer = [];

SpeechBubble.getRejectButton().addEventListener('click', function () {
    console.debug('Customer rejected');
    GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), false);
    SpeechBubble.rejectCustomer();
    GameStatsManager.incrementRejected();
    setTimeout(() => {
        spawnCustomer();
    }, 2000);
});

function spawnCustomer() {
    CustomerManager.simulateEconomyTick();
    currentCustomer = CustomerManager.getRandomCustomer();
    customerTransactionType = currentCustomer.getDesiredTransactionType();
    GoogleAnalytics.reportLevelStart(customerTransactionType.toString());
    spawnIdCardForCurrentCustomer();
    if (customerTransactionType === TransactionType.WITHDRAWAL) {
        customerTransactionSum = currentCustomer.getDesiredTransactionAmount();
        SpeechBubble.requestWithdraw(customerTransactionSum);
        SpeechBubble.showRejectButton();
    }
    if (customerTransactionType === TransactionType.DEPOSIT) {
        customerTransactionSum = currentCustomer.getDesiredTransactionAmount();
        SpeechBubble.requestDeposit(customerTransactionSum);
        if (!TransferBox.IS_LID_OPEN && !isLidDragged) {
            const billsInDrawer = Array.from(document.getElementById('table').querySelectorAll('.bill'))
                .filter(isBillInDrawer);
            if (billsInDrawer.length === 0) {
                spawnBillInDrawer();
                SpeechBubble.hideRejectButton();
            } else {
                customerDeposited = false;
                SpeechBubble.showRejectButton();
            }
        } else {
            customerDeposited = false;
            SpeechBubble.showRejectButton();
        }
    }
    SpeechBubble.showSpeechBubble();
}

export function cloneIdCardTemplate() {
    return document.getElementById('id-card-template').content.firstElementChild.cloneNode(true);
}

function spawnIdCardForCurrentCustomer() {
    const previousIdCard = table.querySelector(".id-card-details");
    if (previousIdCard) {
        previousIdCard.remove();
    }

    const idCard = cloneIdCardTemplate();
    const [lastName, firstName] = idCard.querySelector(".id-card-details").children;
    idCard.querySelector(".id-card-ssn").textContent = currentCustomer.ssn;
    lastName.textContent = currentCustomer.lastName;
    firstName.textContent = currentCustomer.firstName;

    const drawerBorders = TransferBox.getBoundingBox();
    idCard.style.left = `${drawerBorders.left + (drawerBorders.right - drawerBorders.left) / 2 - (220 / 2)}px`;
    idCard.style.top = `${(drawerBorders.top) - (100 / 2)}px`;
    idCard.style.zIndex = "0";

    table.appendChild(idCard);
}

const table = document.getElementById('table');

table.addEventListener('wheel', (e) => {
    e.preventDefault();
});

let zIndexCounter = 1;
let active = null;

function moveBillToDrawer(bill) {
    const drawerBorders = TransferBox.getBoundingBox();
    bill.style.left = `${drawerBorders.left + (drawerBorders.right - drawerBorders.left) / 2 - (220 / 2)}px`;
    bill.style.top = `${(drawerBorders.top / 3) - (100 / 2)}px`;
    billsInDrawer.push(bill);
    console.debug('Bills in drawer: ' + billsInDrawer.length);
    billsInDrawer.forEach((billInDrawer, index) => {
        billInDrawer.style.zIndex = index + 1;
    });
    TransferBox.getLidHtmlElement().style.zIndex = billsInDrawer.length + 2;
}

function moveBillToTraySlot(bill, traySlot) {
    const traySlotBorders = traySlot.getBoundingClientRect();
    bill.style.left = `${traySlotBorders.left - (((100 + 15) / 2) + 5)}px`;
    bill.style.top = `${table.offsetHeight - (((100 + 10) / 2) + 10)}px`;
    bill.dataset.rot = getNearestVerticalRotation(parseInt(bill.dataset.rot));
}

function spawnBillInDrawer() {
    getRandomBillsForSum(customerTransactionSum)
        .forEach(bill => {
            bill.dataset.rot = "270";
            moveBillToDrawer(bill);
            updateBillVisual(bill);
            bill.addEventListener('pointerdown', onPointerDown);
            bill.addEventListener('pointerup', onPointerUp);
            bill.addEventListener('dblclick', onDblClick);
            bill.addEventListener('pointermove', onPointerMove);
            bill.addEventListener('wheel', onWheel);
            table.appendChild(bill);
            zIndexCounter++;
        })
    console.debug(`Deposit Sum: $${customerTransactionSum}`);
    customerDeposited = true;
}

function onPointerDown(e) {
    const bill = e.currentTarget;
    bill.setPointerCapture(e.pointerId);

    active = bill;

    const index = billsInDrawer.indexOf(bill);
    if (index !== -1) {
        billsInDrawer.splice(index, 1);
        console.debug('Bills in drawer: ' + billsInDrawer.length);
    }

    bill.style.left = `${e.clientX - 120}px`;
    bill.style.top = `${e.clientY - 150}px`;

    bill.style.zIndex = ++zIndexCounter;
    bill.classList.add('dragging');
    updateBillVisual(bill);
}

function onPointerUp(e) {
    if (!active) return;
    const bill = active;
    active = null;
    try { bill.releasePointerCapture(e.pointerId); } catch (_) { }
    bill.classList.remove('dragging');

    if (isBillInDrawer(bill)) {
        if (TransferBox.IS_LID_OPEN) {
            moveBillToDrawer(bill);
            updateBillVisual(bill);
        } else {
            bill.dataset.rot = getNearestHorizontalRotation(parseInt(bill.dataset.rot));
            updateBillVisual(bill);
            bill.style.top = `${170}px`;
        }
    } else if (isBillInTray(bill)) {
        for (const traySlot of document.querySelectorAll(".tray-slot")) {
            if (isBillInContainer(bill, traySlot)) {
                moveBillToTraySlot(bill, traySlot);
                updateBillVisual(bill);
                return;
            }
        }
        bill.dataset.rot = getNearestHorizontalRotation(parseInt(bill.dataset.rot));
        bill.style.top = `${table.offsetHeight - 245}px`;
        updateBillVisual(bill);
    }
    else {
        updateBillVisual(bill);
    }
}

function isBillInContainer(bill, container) {
    const billRect = bill.getBoundingClientRect();
    const billCenter = {
        x: billRect.left + billRect.width / 2,
        y: billRect.top + billRect.height / 2
    };
    const containerBorders = container.getBoundingClientRect();
    return billCenter.x > containerBorders.left &&
        billCenter.x < containerBorders.right &&
        billCenter.y < containerBorders.bottom &&
        billCenter.y > containerBorders.top;
}

function isBillInTray(bill) {
    return isBillInContainer(bill, document.querySelector(".tray"));
}

function isBillInDrawer(bill) {
    const billRect = bill.getBoundingClientRect();
    const billCenter = {
        x: billRect.left + billRect.width / 2,
        y: billRect.top + billRect.height / 2
    };
    const drawerBorders = TransferBox.getBoundingBox();
    return billCenter.x > drawerBorders.left &&
        billCenter.x < drawerBorders.right &&
        billCenter.y < drawerBorders.bottom &&
        billCenter.y > drawerBorders.top;
}

function onPointerMove(e) {
    if (!active) return;
    const bill = active;
    const newLeft = e.clientX - 120;
    const newTop = e.clientY - 150;

    const maxLeft = table.clientWidth - bill.offsetWidth;
    const maxTop = table.clientHeight - bill.offsetHeight;
    bill.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
    bill.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';
}

function onWheel(e) {
    const bill = e.currentTarget;
    if (!bill.classList.contains('dragging') && isBillInTray(bill)) {
        return;
    }
    const rot = parseFloat(bill.dataset.rot || "0");
    const step = (e.deltaY > 0) ? 15 : -15;
    bill.dataset.rot = String(rot + step);
    updateBillVisual(bill);
}

function onDblClick(e) {
    flipBill(e.currentTarget);
}

function flipBill(bill) {
    const flipped = !(bill.dataset.flipped === "true");
    bill.dataset.flipped = flipped ? "true" : "false";
    const inner = bill.querySelector('.inner');
    if (inner) inner.style.transform = `rotateY(${flipped ? 180 : 0}deg)`;
}

function updateBillVisual(b) {
    const rot = parseFloat(b.dataset.rot || "0");
    const scale = b.classList.contains('dragging') ? 1.06 : 1;
    b.style.transform = `rotate(${rot}deg) scale(${scale})`;
}

let isLidDragged = false;
let startY = 0;

function closeDrawerLid() {
    TransferBox.closeLid();

    console.debug(`Number of bills in drawer: ${billsInDrawer.length}`);
    if (customerTransactionType === TransactionType.DEPOSIT) {
        if (customerDeposited === false) {
            if (billsInDrawer.length === 0) {
                spawnBillInDrawer();
                SpeechBubble.hideRejectButton();
                return;
            } else {
                SpeechBubble.depositBoxOccupied();
                setTimeout(() => {
                    SpeechBubble.requestDeposit(customerTransactionSum);
                }, 2000);
                return;
            }
        } else {
            if (billsInDrawer.length === 0) {
                currentCustomer.deposit(customerTransactionSum);
                SpeechBubble.satisfyCustomer();
                GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), true);
                GameStatsManager.incrementDeposit();
                setTimeout(() => {
                    spawnCustomer();
                }, 2000);
                return;
            } else {
                SpeechBubble.depositNotTaken();
                setTimeout(() => {
                    SpeechBubble.requestDeposit(customerTransactionSum);
                }, 2000);
                return;
            }
        }
    }
    if (customerTransactionType === TransactionType.WITHDRAWAL) {
        const billValue = getValueSum(billsInDrawer);
        console.debug(`Withdrawal Sum: $${billValue} (${billsInDrawer.length} bills)`);
        if (billValue == customerTransactionSum) {
            if (billsInDrawer.length === getFewestBillsForSum(customerTransactionSum)) {
                console.log('Perfect Withdrawal (fewest bills possible)');
                GameStatsManager.incrementPerfectWithdrawal();
            }
            billsInDrawer.forEach(bill => bill.remove());
            billsInDrawer.length = 0;
            currentCustomer.withdraw(customerTransactionSum);
            SpeechBubble.satisfyCustomer();
            GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), true);
            GameStatsManager.incrementWithdraw();
            setTimeout(() => {
                spawnCustomer();
            }, 2000);
        } else {
            SpeechBubble.incorrectWithdrawSum(customerTransactionSum, billValue);
            setTimeout(() => {
                SpeechBubble.requestWithdraw(customerTransactionSum);
            }, 2000);
        }
    }
}

TransferBox.getLidHtmlElement().addEventListener('mousedown', (e) => {
    if (TransferBox.IS_LID_OPEN) {
        SoundPlayer.playLidSlide();
        SoundPlayer.playLidClick();
        return closeDrawerLid();
    }
    isLidDragged = true;
    startY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isLidDragged) return;
    SoundPlayer.playLidSlide();
    TransferBox.moveLid({ value: e.clientY - startY });
});

document.addEventListener('mouseup', () => {
    if (!isLidDragged) return;
    const matrix = new DOMMatrix(window.getComputedStyle(TransferBox.getLidHtmlElement()).transform || 'none');
    if ((parseInt(matrix.m42) || 0) < TransferBox.LID_OPEN_TRANSLATE_Y / 2) {
        TransferBox.openLid();
    } else {
        TransferBox.closeLid();
    }
    isLidDragged = false;
    SoundPlayer.playLidClick();
});

setupHowToPopup();

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

export function cloneReceiptDispenserTemplate() {
    return document.getElementById('receipt-dispenser-template').content.firstElementChild.cloneNode(true);
}

const receiptDispenser = cloneReceiptDispenserTemplate();
table.appendChild(receiptDispenser);

spawnCustomer();

document.querySelector(".center").addEventListener('click', () => {
    document.querySelector(".lore-popup").hidden = !document.querySelector(".lore-popup").hidden;
})