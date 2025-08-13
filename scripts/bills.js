
export function getBillDenomination(bill) {
    return parseInt(bill.dataset.value, 10);
}

export function getValueSum(bills) {
    return bills.map(getBillDenomination).reduce((sum, val) => sum + val, 0);
}