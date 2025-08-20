import { randomInt } from './maths.js';
import { setupHowToPopup } from './how-to-popup.js';
import { BILL_DENOMINATIONS, createBillWithValue, getFewestBillsForSum, getValueSum } from './bills.js';
import { BUG_REPORT_URL } from './constants.js';
import { TransactionType } from './transactionType.js';
import { SpeechBubble } from './SpeechBubble.js';
import { SoundPlayer } from './SoundPlayer.js';

const WEIGHTED_WITHDRAWALS = [
    { amount: 10, weight: 5 },
    { amount: 20, weight: 8 },
    { amount: 30, weight: 12 },
    { amount: 40, weight: 18 },
    { amount: 50, weight: 25 },
    { amount: 60, weight: 35 },
    { amount: 70, weight: 50 },
    { amount: 80, weight: 70 },
    { amount: 90, weight: 90 },
    { amount: 100, weight: 100 },
    { amount: 120, weight: 90 },
    { amount: 150, weight: 70 },
    { amount: 180, weight: 50 },
    { amount: 200, weight: 35 },
    { amount: 250, weight: 25 },
    { amount: 300, weight: 18 },
    { amount: 350, weight: 12 },
    { amount: 400, weight: 8 },
    { amount: 450, weight: 5 },
    { amount: 500, weight: 3 },
    { amount: 600, weight: 2 },
    { amount: 700, weight: 1 },
    { amount: 800, weight: 1 },
    { amount: 900, weight: 1 },
    { amount: 1000, weight: 1 },
];

function getWeightedWithdrawal() {
    const totalWeight = WEIGHTED_WITHDRAWALS.reduce((sum, w) => sum + w.weight, 0);
    let r = Math.random() * totalWeight;
    for (const w of WEIGHTED_WITHDRAWALS) {
        if (r < w.weight) return w.amount;
        r -= w.weight;
    }
}

let customerTransactionType;
let customerTransactionSum = 0;
let customerDeposited = false;
let rejectedCount = 0;
let withdrawCount = 0;
let depositCount = 0;
let perfectWithdrawalCount = 0;

SpeechBubble.getRejectButton().addEventListener('click', function () {
    console.debug('Customer rejected');
    SpeechBubble.rejectCustomer();
    rejectedCount++;
    updateStatsPad();
    setTimeout(() => {
        spawnCustomer();
    }, 2000);
});

function spawnCustomer() {
    customerTransactionType = randomInt(0, 1) ? TransactionType.WITHDRAWAL : TransactionType.DEPOSIT;

    if (customerTransactionType === TransactionType.WITHDRAWAL) {
        customerTransactionSum = getWeightedWithdrawal();
        SpeechBubble.requestWithdraw(customerTransactionSum);
        SpeechBubble.showRejectButton();
    }
    if (customerTransactionType === TransactionType.DEPOSIT) {
        customerTransactionSum = BILL_DENOMINATIONS[randomInt(0, BILL_DENOMINATIONS.length - 1)];
        SpeechBubble.requestDeposit(customerTransactionSum);
        if (!isLidOpen && !isLidDragged) {
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

let zIndexCounter = 1;
let active = null;

function createBill(value) {
    const bill = createBillWithValue(value);
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

function moveBillToDrawer(bill) {
    const drawerBorders = getDrawerEdges();
    bill.style.left = `${drawerBorders.left + (drawerBorders.right - drawerBorders.left) / 2 - (220 / 2)}px`;
    bill.style.top = `${(drawerBorders.top / 3) - (100 / 2)}px`;
}

function spawnBillInDrawer({ delay = 0 } = {}) {
    const newBill = createBill(customerTransactionSum);
    moveBillToDrawer(newBill);
    newBill.dataset.rot = "270";
    updateBillVisual(newBill);
    setTimeout(() => {
        table.appendChild(newBill);
    }, delay);
    console.debug(`Deposit Sum: $${newBill.dataset.value}`);
    customerDeposited = true;
}

function onPointerDown(e) {
    const bill = e.currentTarget;
    bill.setPointerCapture(e.pointerId);

    active = bill;

    bill.style.left = `${e.clientX - 120}px`;
    bill.style.top = `${e.clientY - 150}px`;

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
        if (isLidOpen) {
            moveBillToDrawer(bill);
            updateBillVisual(bill);
        } else {
            bill.dataset.rot = "0";
            updateBillVisual(bill);
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

const maxOpen = -130;

function updateLid({ value = 0 } = {}) {
    const newTranslateY = Math.min(0, Math.max(value, maxOpen));
    lid.style.transform = `translate(-50%, ${newTranslateY}px)`;
    isLidOpen = newTranslateY === maxOpen;
}

function closeDrawerLid() {
    updateLid();
    const billsInDrawer = Array.from(document.getElementById('table').querySelectorAll('.bill'))
        .filter(isBillInDrawer);

    console.debug(`Number of bills in drawer: ${billsInDrawer.length}`);
    if (customerTransactionType === TransactionType.DEPOSIT) {
        if (customerDeposited === false) {
            if (billsInDrawer.length === 0) {
                spawnBillInDrawer({ delay: 100 });
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
                depositCount++;
                updateStatsPad();
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
                perfectWithdrawalCount++;
            }
            billsInDrawer.forEach(bill => bill.remove());
            SpeechBubble.satisfyCustomer();
            withdrawCount++;
            updateStatsPad();
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
    updateLid({ value: e.clientY - startY })
});

document.addEventListener('mouseup', () => {
    if (!isLidDragged) return;
    const matrix = new DOMMatrix(window.getComputedStyle(lid).transform || 'none');
    if ((parseInt(matrix.m42) || 0) < maxOpen / 2) {
        updateLid({ value: maxOpen });
    } else {
        updateLid();
    }
    isLidDragged = false;
    SoundPlayer.playLidClick();
});

const statsPad = document.getElementById('stats-pad-template').content.firstElementChild.cloneNode(true);

function createStatsPad() {
    const depositRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
    depositRow.querySelector('.stats-pad-key').textContent = 'Deposits';
    depositRow.querySelector('.stats-pad-value').textContent = '0';
    statsPad.appendChild(depositRow);

    const withdrawRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
    withdrawRow.querySelector('.stats-pad-key').textContent = 'Withdraws';
    withdrawRow.querySelector('.stats-pad-value').textContent = '0';
    statsPad.appendChild(withdrawRow);

    const totalRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
    totalRow.querySelector('.stats-pad-key').textContent = 'Total';
    totalRow.querySelector('.stats-pad-value').textContent = '0';
    statsPad.appendChild(totalRow);

    const rejectRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
    rejectRow.querySelector('.stats-pad-key').textContent = 'Rejected';
    rejectRow.querySelector('.stats-pad-value').textContent = '0';
    statsPad.appendChild(rejectRow);

    const perfectWithdrawalRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
    perfectWithdrawalRow.querySelector('.stats-pad-key').textContent = 'Perfect Withdraws';
    perfectWithdrawalRow.querySelector('.stats-pad-value').textContent = '0';
    statsPad.appendChild(perfectWithdrawalRow);

    //statsPad.style.left = `${randomInt(0, 500)}px`;
    statsPad.style.left = `0px`;
    //statsPad.style.bottom = `${randomInt(200, 500)}px`;
    statsPad.style.bottom = `0px`;

    table.appendChild(statsPad);
}

function updateStatsPad() {
    statsPad.children[1].querySelector('.stats-pad-value').textContent = `${depositCount}`;
    statsPad.children[2].querySelector('.stats-pad-value').textContent = `${withdrawCount}`;
    statsPad.children[3].querySelector('.stats-pad-value').textContent = `${withdrawCount + depositCount}`;
    statsPad.children[4].querySelector('.stats-pad-value').textContent = `${rejectedCount}`;
    statsPad.children[5].querySelector('.stats-pad-value').textContent = `${perfectWithdrawalCount}`;
}

createStatsPad();

setupHowToPopup();

document.getElementById('bug-btn').addEventListener('click', function () {
    window.open(BUG_REPORT_URL, '_blank');
});

document.getElementById('roadmap-btn').addEventListener('click', function () {
    window.open('./roadmap.html', '_blank');
});

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

spawnCustomer();
