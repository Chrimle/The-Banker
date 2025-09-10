import { randomInt } from "./maths.js";
import { TransactionType } from "./transactionType.js";

export const TOTAL_CUSTOMERS = 25;

/*
* This multiplied by 1000 customers, will result in a $1M economy.
*/
export const INITIAL_CASH_ON_HAND = 100;

export const DEFAULT_DESIRED_CASH_ON_HAND = 20;

export const FIRST_NAMES = [
    "Andrew",
    "Brian",
    "Charles",
    "Daniel",
    "Emily",
    "Frank",
    "Grace",
    "Hannah",
    "Isaac",
    "James",
    "Kimberly",
    "Lauren",
    "Matthew",
    "Nicole",
    "Oscar",
    "Patrick",
    "Quentin",
    "Robert",
    "Sarah",
    "Thomas",
    "Ulysses",
    "Victoria",
    "William",
    "Xavier",
    "Yolanda",
    "Zachary"
];

export const LAST_NAMES = [
    "Anderson",
    "Bennett",
    "Clark",
    "Dalton",
    "Ellsworth",
    "Fleming",
    "Granger",
    "Henderson",
    "Ingram",
    "Jefferson",
    "Keller",
    "Langford",
    "Morrison",
    "Norton",
    "Osborne",
    "Prescott",
    "Quimby",
    "Rutledge",
    "Sanders",
    "Thompson",
    "Ulrich",
    "Vaughn",
    "Whitaker",
    "Xenos",
    "Yates",
    "Zimmerman"
];

export function generateSSN() {
    const area = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const group = String(Math.floor(Math.random() * 100)).padStart(2, "0");
    const serial = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
    return `${area}-${group}-${serial}`;
}

export function generateFirstName() {
    return FIRST_NAMES[randomInt(0, FIRST_NAMES.length - 1)];
}

export function generateLastName() {
    return LAST_NAMES[randomInt(0, LAST_NAMES.length - 1)];
}

export class Customer {
    constructor(firstName, lastName, ssn, bankBalance = 0, loanAmount = 0, cashOnHand = 0, hasAccount = true, desiredTransactionType = null) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.ssn = ssn;
        this.bankBalance = bankBalance;
        this.loanAmount = loanAmount;
        this.cashOnHand = cashOnHand;
        this.hasAccount = hasAccount;
        this.desiredTransactionType = desiredTransactionType;
    }

    hasSufficientFunds(amount) {
        return this.bankBalance >= amount;
    }

    deposit(amount) {
        this.bankBalance += amount;
        this.cashOnHand -= amount;
    }

    withdraw(amount) {
        this.bankBalance -= amount;
        this.cashOnHand += amount;
    }

    getDesiredTransactionType() {
        if (this.cashOnHand > DEFAULT_DESIRED_CASH_ON_HAND && this.cashOnHand > this.bankBalance) {
            this.desiredTransactionType = TransactionType.DEPOSIT;
        } else if (this.cashOnHand < DEFAULT_DESIRED_CASH_ON_HAND && this.bankBalance > 0) {
            this.desiredTransactionType = TransactionType.WITHDRAWAL;
        } else {
            this.desiredTransactionType = null;
        }
        return this.desiredTransactionType;
    }

    isBankTransactionDesired() {
        return this.getDesiredTransactionType() !== null;
    }

    getDesiredTransactionAmount() {
        if (this.desiredTransactionType === TransactionType.DEPOSIT) {
            return this.cashOnHand - DEFAULT_DESIRED_CASH_ON_HAND;
        }
        if (this.desiredTransactionType === TransactionType.WITHDRAWAL) {
            return Math.min(DEFAULT_DESIRED_CASH_ON_HAND - this.cashOnHand, this.bankBalance);
        }
        return 0;
    }
}

export class CustomerManager {

    static #customers = [];

    static {
        // Pre-register some customers
        for (let i = 0; i < TOTAL_CUSTOMERS; i++) {
            this.generateCustomer();
        }
    }

    static generateCustomer() {
        const firstName = generateFirstName();
        const lastName = generateLastName();
        let ssn;
        do {
            ssn = generateSSN();
        } while (this.isCustomerRegistered(ssn));

        const bankBalance = 0;
        const loanAmount = 0;
        const customer = new Customer(firstName, lastName, ssn, bankBalance, loanAmount, INITIAL_CASH_ON_HAND);
        this.registerCustomer(customer);
        return customer;
    }

    static registerCustomer(customer) {
        this.#customers.push(customer);
    }

    static getRandomCustomer() {
        if (this.#customers.length === 0) throw new Error("No customers registered.");
        console.debug(this.#customers);
        const randomCustomers = this.#customers.filter(c => c.isBankTransactionDesired());
        if (randomCustomers.length === 0) {
            this.simulateEconomyTick();
            return this.getRandomCustomer();
        }
        return randomCustomers[randomInt(0, randomCustomers.length - 1)];
    }

    static getAllCustomers() {
        return this.#customers;
    }

    static isCustomerRegistered(ssn) {
        return this.#customers.some(c => c.ssn === ssn);
    }

    static findCustomerBySSN(ssn) {
        return this.#customers.find(c => c.ssn === ssn);
    }

    static simulateEconomyTick() {
        // Pick two different random people       
        const receiver = this.#customers[randomInt(0, this.#customers.length - 1)];
        let provider;
        do {
            provider = this.#customers[randomInt(0, this.#customers.length - 1)]
        } while (provider.ssn === receiver.ssn || provider.cashOnHand === 0);

        const transactionSum = Math.max(Math.round(provider.cashOnHand / 10), 1);

        provider.cashOnHand -= transactionSum;
        receiver.cashOnHand += transactionSum;

        console.log(`${provider.firstName} ${provider.lastName} gives $${transactionSum.toFixed(2)} to ${receiver.firstName} ${receiver.lastName}`);
    }


}