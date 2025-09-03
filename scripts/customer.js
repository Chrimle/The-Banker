import { randomInt } from "./maths.js";

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
    constructor(firstName, lastName, ssn, bankBalance = 0, loanAmount = 0) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.ssn = ssn;
        this.bankBalance = bankBalance;
        this.loanAmount = loanAmount;
    }

    hasSufficientFunds(amount) {
        return this.bankBalance >= amount;
    }

    deposit(amount) {
        this.bankBalance += amount;
    }

    withdraw(amount) {
        //if (this.hasSufficientFunds(amount)) {
        this.bankBalance -= amount;
        //    return true;
        //}
        // return false;
    }
}

export class CustomerManager {

    static #customers = [];

    static generateCustomer() {
        const firstName = generateFirstName();
        const lastName = generateLastName();
        let ssn;
        do {
            ssn = generateSSN();
        } while (this.isCustomerRegistered(ssn));

        const bankBalance = 0;
        const loanAmount = 0;
        const customer = new Customer(firstName, lastName, ssn, bankBalance, loanAmount);
        this.registerCustomer(customer);
        return customer;
    }

    static registerCustomer(customer) {
        this.#customers.push(customer);
        console.debug(this.#customers);
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