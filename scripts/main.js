import { randomInt } from './maths.js';
import { setupHowToPopup } from './how-to-popup.js';
import { BILL_DENOMINATIONS, getValueSum } from './bills.js';
import { BUG_REPORT_URL } from './constants.js';
import { TransactionType } from './transactionType.js';
import { SpeechBubble } from './SpeechBubble.js';

const versionMeta = document.querySelector('meta[name="version"]');
const versionNumber = versionMeta ? versionMeta.content : "N/A";

const pill = document.querySelector(".version-pill");
pill.textContent = `v${versionNumber}`;

let customerTransactionType;
let customerTransactionSum = 0;
let customerDeposited = false;
const speechBubble = document.querySelector('.speech-bubble');
const rejectButton = speechBubble.querySelector('.speech-bubble-reject');

rejectButton.addEventListener('click', function () {
    console.debug('Customer rejected');
    SpeechBubble.rejectCustomer();
    setTimeout(() => {
        spawnCustomer();
    }, 2000);
});

function spawnCustomer() {
    customerTransactionType = randomInt(0, 1) ? TransactionType.WITHDRAWAL : TransactionType.DEPOSIT;
    customerTransactionSum = BILL_DENOMINATIONS[randomInt(0, BILL_DENOMINATIONS.length - 1)];

    if (customerTransactionType === TransactionType.WITHDRAWAL) {
        SpeechBubble.requestWithdraw(customerTransactionSum);
        SpeechBubble.showRejectButton();
    }
    if (customerTransactionType === TransactionType.DEPOSIT) {
        SpeechBubble.requestDeposit(customerTransactionSum);
        if (!isLidOpen && !isLidDragged) {
            const billsInDrawer = Array.from(document.getElementById('table').querySelectorAll('.bill'))
                .filter(isBillInDrawer);
            if (billsInDrawer.length === 0) {
                spawnBillInDrawer(0);
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

function getDrawerEdges() {
    const drawerRect = document.querySelector('.drawer').getBoundingClientRect();
    return {
        left: drawerRect.left,
        right: drawerRect.right,
        top: drawerRect.top,
        bottom: drawerRect.bottom
    };
}

const table = document.getElementById('table');

table.addEventListener('wheel', (e) => {
    e.preventDefault();
});

const billTemplate = document.getElementById('bill-template');
let zIndexCounter = 1;
let active = null;
let downX = 0, downY = 0;

function createBill(value) {
    const bill = billTemplate.content.firstElementChild.cloneNode(true);
    bill.dataset.value = value;
    bill.querySelector('.denom-topleft').textContent = value;
    bill.querySelector('.denom-topright').textContent = value;
    bill.querySelector('.denom-bottomright').textContent = value;
    bill.querySelector('.denom-bottomleft').textContent = value;

    bill.addEventListener('pointerdown', onPointerDown);
    bill.addEventListener('pointerup', onPointerUp);
    bill.addEventListener('dblclick', onDblClick);
    bill.addEventListener('pointermove', onPointerMove);
    bill.addEventListener('wheel', onWheel);
    return bill;
}

BILL_DENOMINATIONS.forEach((value) => {
    const bill = createBill(value);
    bill.dataset.rot = randomInt(0, 23) * 15;
    bill.style.left = `${randomInt(0, 500)}px`;
    bill.style.top = `${randomInt(200, 500)}px`;
    table.appendChild(bill);
    updateBillVisual(bill);
});

function spawnBillInDrawer(timeout) {
    const newBill = createBill(customerTransactionSum);
    const drawerBorders = getDrawerEdges();
    newBill.style.left = `${drawerBorders.left + (drawerBorders.right - drawerBorders.left) / 2 - (220 / 2)}px`;
    newBill.style.top = `${(drawerBorders.bottom - drawerBorders.top) / 2 - (100 / 2)}px`;
    setTimeout(() => {
        table.appendChild(newBill);
    }, timeout);
    console.debug(`Deposit Sum: $${newBill.dataset.value}`);
    customerDeposited = true;
}

function onPointerDown(e) {
    const bill = e.currentTarget;
    bill.setPointerCapture(e.pointerId);

    active = bill;
    const rect = bill.getBoundingClientRect();

    downX = e.clientX;
    downY = e.clientY;
    active._offsetX = e.clientX - rect.left;
    active._offsetY = e.clientY - rect.top;

    bill.style.zIndex = ++zIndexCounter;
    bill.classList.add('dragging');
    updateBillVisual(bill);
}

function onPointerUp(e) {
    if (!active) return;
    const bill = active;
    try { bill.releasePointerCapture(e.pointerId); } catch (_) { }
    bill.classList.remove('dragging');

    if (isBillInDrawer(bill)) {
        bill.dataset.rot = "0";
        updateBillVisual(bill);
        if (isLidOpen) {
            const drawerBorders = getDrawerEdges();
            bill.style.left = `${drawerBorders.left + (drawerBorders.right - drawerBorders.left) / 2 - (220 / 2)}px`;
            bill.style.top = `${(drawerBorders.bottom - drawerBorders.top) / 2 - (100 / 2)}px`;
        } else {
            bill.style.top = `${175}px`;
        }
    } else {
        updateBillVisual(bill);
    }
    active = null;
}

function isBillInDrawer(bill) {
    const billRect = bill.getBoundingClientRect();
    const billCenter = {
        x: billRect.left + billRect.width / 2,
        y: billRect.top + billRect.height / 2
    };
    const drawerBorders = getDrawerEdges();
    return billCenter.x > drawerBorders.left &&
        billCenter.x < drawerBorders.right &&
        billCenter.y < drawerBorders.bottom &&
        billCenter.y > drawerBorders.top
}

function onPointerMove(e) {
    if (!active) return;
    const tableRect = table.getBoundingClientRect();
    const bill = active;
    const newLeft = e.clientX - tableRect.left - bill._offsetX;
    const newTop = e.clientY - tableRect.top - bill._offsetY;

    const maxLeft = table.clientWidth - bill.offsetWidth;
    const maxTop = table.clientHeight - bill.offsetHeight;
    bill.style.left = Math.max(0, Math.min(maxLeft, newLeft)) + 'px';
    bill.style.top = Math.max(0, Math.min(maxTop, newTop)) + 'px';
}

function onWheel(e) {
    const bill = e.currentTarget;
    if (isBillInDrawer(bill)) return;
    const rot = parseFloat(bill.dataset.rot || "0");
    const step = (e.deltaY > 0) ? 15 : -15;
    bill.dataset.rot = String(rot + step);
    updateBillVisual(bill);
}

function onDblClick(e) {
    const bill = e.currentTarget;
    bill.dataset.flipped = (bill.dataset.flipped === "true") ? "false" : "true";
    updateBillVisual(bill);
}

function updateBillVisual(b) {
    const rot = parseFloat(b.dataset.rot || "0");
    const flipped = b.dataset.flipped === "true";
    const scale = b.classList.contains('dragging') ? 1.06 : 1;
    b.style.transform = `rotate(${rot}deg) scale(${scale})`;
    const inner = b.querySelector('.inner');
    if (inner) inner.style.transform = `rotateY(${flipped ? 180 : 0}deg)`;
}

const lid = document.querySelector('.lid');
let isLidDragged = false;
let isLidOpen = false;
let startY = 0;

const maxOpen = 130;

function closeDrawerLid() {
    isLidOpen = false;
    lid.style.transform = `translate(-50%, 0px)`;
    const billsInDrawer = Array.from(document.getElementById('table').querySelectorAll('.bill'))
        .filter(isBillInDrawer);

    console.debug(`Number of bills in drawer: ${billsInDrawer.length}`);
    if (customerTransactionType === TransactionType.DEPOSIT) {
        if (customerDeposited === false) {
            if (billsInDrawer.length === 0) {
                spawnBillInDrawer(50);
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
                SpeechBubble.satisfyCustomer();
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
            billsInDrawer.forEach(bill => bill.remove());
            SpeechBubble.satisfyCustomer();
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

lid.addEventListener('mousedown', (e) => {
    if (isLidOpen) {
        return closeDrawerLid();
    }
    isLidDragged = true;
    startY = e.clientY;
});

document.addEventListener('mousemove', (e) => {
    if (!isLidDragged) return;
    lid.style.transform = `translate(-50%, ${Math.min(0, Math.max(e.clientY - startY, -maxOpen))}px)`;
});

document.addEventListener('mouseup', () => {
    if (!isLidDragged) return;
    const matrix = new DOMMatrix(window.getComputedStyle(lid).transform || 'none');
    if ((parseInt(matrix.m42) || 0) < -maxOpen / 2) {
        lid.style.transform = `translate(-50%, ${-maxOpen}px)`;
        isLidOpen = true;
    } else {
        lid.style.transform = `translate(-50%, 0px)`;
    }
    isLidDragged = false;
});

setupHowToPopup();

document.getElementById('bug-btn').addEventListener('click', function () {
    window.open(BUG_REPORT_URL, '_blank');
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

spawnCustomer();
