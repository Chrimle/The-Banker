import { randomInt } from "./maths.js";

export const TOTAL_CUSTOMERS = 100;

/*
* This multiplied by 1000 customers, will result in a $1M economy.
*/
export const INITIAL_CASH_ON_HAND = 1000;

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
    constructor(firstName, lastName, ssn, bankBalance = 0, loanAmount = 0, cashOnHand = 0, hasAccount = true) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.ssn = ssn;
        this.bankBalance = bankBalance;
        this.loanAmount = loanAmount;
        this.cashOnHand = cashOnHand;
        this.hasAccount = hasAccount;
    }

    hasSufficientFunds(amount) {
        return this.bankBalance >= amount;
    }

    deposit(amount) {
        this.bankBalance += amount;
        this.cashOnHand -= amount;
    }

    withdraw(amount) {
        //if (this.hasSufficientFunds(amount)) {
        this.bankBalance -= amount;
        this.cashOnHand += amount;
        //    return true;
        //}
        // return false;
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
        const index = randomInt(0, this.#customers.length - 1);
        return this.#customers[index];
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
}