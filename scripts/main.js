import { getNearestHorizontalRotation, getNearestVerticalRotation, randomInt } from './maths.js';
import { setupHowToPopup } from './how-to-popup.js';
import { BILL_DENOMINATIONS, createBillWithValue, getFewestBillsForSum, getValueSum } from './bills.js';
import { TransactionType } from './transactionType.js';
import { SpeechBubble } from './SpeechBubble.js';
import { SoundPlayer } from './SoundPlayer.js';
import { incrementDeposit, incrementPerfectWithdrawal, incrementRejected, incrementWithdraw, loadGameStats } from './gameStats.js';
import { TransferBox } from './TransferBox.js';
import { CustomerManager } from './customer.js';
import { GoogleAnalytics } from './google-analytics.js';

const initialWidth = window.innerWidth;
const initialHeight = window.innerHeight;
const overlay = document.getElementById("refresh-overlay");

window.addEventListener("resize", () => {
    if (window.innerWidth !== initialWidth || window.innerHeight !== initialHeight) {
        overlay.style.display = "flex";
    }
});

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

let currentCustomer;
let customerTransactionType;
let customerTransactionSum = 0;
let customerDeposited = false;
let billsInDrawer = [];

SpeechBubble.getRejectButton().addEventListener('click', function () {
    console.debug('Customer rejected');
    GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), false);
    SpeechBubble.rejectCustomer();
    incrementRejected();
    updateStatsPad();
    setTimeout(() => {
        spawnCustomer();
    }, 2000);
});

function spawnCustomer() {
    customerTransactionType = randomInt(0, 1) ? TransactionType.WITHDRAWAL : TransactionType.DEPOSIT;
    GoogleAnalytics.reportLevelStart(customerTransactionType.toString());
    currentCustomer = CustomerManager.getRandomCustomer();
    spawnIdCardForCurrentCustomer();
    if (customerTransactionType === TransactionType.WITHDRAWAL) {
        customerTransactionSum = getWeightedWithdrawal();
        SpeechBubble.requestWithdraw(customerTransactionSum);
        SpeechBubble.showRejectButton();
    }
    if (customerTransactionType === TransactionType.DEPOSIT) {
        customerTransactionSum = BILL_DENOMINATIONS[randomInt(0, BILL_DENOMINATIONS.length - 1)];
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
                currentCustomer.deposit(customerTransactionSum);
                SpeechBubble.satisfyCustomer();
                GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), true);
                incrementDeposit();
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
                incrementPerfectWithdrawal();
            }
            billsInDrawer.forEach(bill => bill.remove());
            billsInDrawer.length = 0;
            currentCustomer.withdraw(customerTransactionSum);
            SpeechBubble.satisfyCustomer();
            GoogleAnalytics.reportLevelEnd(customerTransactionType.toString(), true);
            incrementWithdraw();
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

    table.appendChild(statsPad);

    document.getElementById('stats-toggle').addEventListener('click', () => {
        if (statsPad.style.display === 'none' || statsPad.style.display === '') {
            statsPad.style.display = 'flex';
        } else {
            statsPad.style.display = 'none';
        }
    });
}

function updateStatsPad() {
    const gameStats = loadGameStats();
    statsPad.children[1].querySelector('.stats-pad-value').textContent = `${gameStats.depositCount}`;
    statsPad.children[2].querySelector('.stats-pad-value').textContent = `${gameStats.withdrawCount}`;
    statsPad.children[3].querySelector('.stats-pad-value').textContent = `${gameStats.withdrawCount + gameStats.depositCount}`;
    statsPad.children[4].querySelector('.stats-pad-value').textContent = `${gameStats.rejectedCount}`;
    statsPad.children[5].querySelector('.stats-pad-value').textContent = `${gameStats.perfectWithdrawalCount}`;
}

createStatsPad();
updateStatsPad();

setupHowToPopup();

document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
});

spawnCustomer();

document.querySelector(".center").addEventListener('click', () => {
    document.querySelector(".lore-popup").hidden = !document.querySelector(".lore-popup").hidden;
})