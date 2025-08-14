
export const BILL_DENOMINATIONS = [1, 2, 5, 10, 20, 50, 100];

export function getBillDenomination(bill) {
    return parseInt(bill.dataset.value, 10);
}

export function getValueSum(bills) {
    return bills.map(getBillDenomination).reduce((sum, val) => sum + val, 0);
}

export function getFewestBillsForSum(sum) {

    let numberOfBills = 0;
    let highestDenominationIndex = BILL_DENOMINATIONS.length - 1;

    while (sum > 0) {
        if (BILL_DENOMINATIONS[highestDenominationIndex] <= sum) {
            sum -= BILL_DENOMINATIONS[highestDenominationIndex];
            numberOfBills++;
        } else {
            highestDenominationIndex--;
        }
    }
    return numberOfBills;
}
