
export class StatsPad {

    static #statsPadElement = null;


    static initialize() {
        this.#statsPadElement = document.getElementById('stats-pad-template').content.firstElementChild.cloneNode(true);

        // Deposits
        const depositRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
        depositRow.querySelector('.stats-pad-key').textContent = 'Deposits';
        depositRow.querySelector('.stats-pad-value').textContent = '0';
        this.#statsPadElement.appendChild(depositRow);

        // Withdrawals
        const withdrawRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
        withdrawRow.querySelector('.stats-pad-key').textContent = 'Withdraws';
        withdrawRow.querySelector('.stats-pad-value').textContent = '0';
        this.#statsPadElement.appendChild(withdrawRow);

        // Totals
        const totalRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
        totalRow.querySelector('.stats-pad-key').textContent = 'Total';
        totalRow.querySelector('.stats-pad-value').textContent = '0';
        this.#statsPadElement.appendChild(totalRow);

        // Rejected
        const rejectRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
        rejectRow.querySelector('.stats-pad-key').textContent = 'Rejected';
        rejectRow.querySelector('.stats-pad-value').textContent = '0';
        this.#statsPadElement.appendChild(rejectRow);

        // Perfect Withdrawals
        const perfectWithdrawalRow = document.getElementById('stats-pad-row-template').content.firstElementChild.cloneNode(true);
        perfectWithdrawalRow.querySelector('.stats-pad-key').textContent = 'Perfect Withdraws';
        perfectWithdrawalRow.querySelector('.stats-pad-value').textContent = '0';
        this.#statsPadElement.appendChild(perfectWithdrawalRow);

        table.appendChild(this.#statsPadElement);

        document.getElementById('stats-toggle').addEventListener('click', () => {
            if (this.#statsPadElement.style.display === 'none' || this.#statsPadElement.style.display === '') {
                this.#statsPadElement.style.display = 'flex';
            } else {
                this.#statsPadElement.style.display = 'none';
            }
        });
    }

    static refresh({ depositCount, withdrawCount, rejectedCount, perfectWithdrawalCount }) {
        const rows = this.#statsPadElement.querySelectorAll('.stats-pad-row');
        rows[0].querySelector('.stats-pad-value').textContent = `${depositCount}`;
        rows[1].querySelector('.stats-pad-value').textContent = `${withdrawCount}`;
        rows[2].querySelector('.stats-pad-value').textContent = `${depositCount + withdrawCount}`;
        rows[3].querySelector('.stats-pad-value').textContent = `${rejectedCount}`;
        rows[4].querySelector('.stats-pad-value').textContent = `${perfectWithdrawalCount}`;
    }

}