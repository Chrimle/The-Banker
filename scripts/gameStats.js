
const LSKEY_GAME_STATS = "gameStats";

const GAME_STAT_KEYS = Object.freeze({
    REJECTED: "rejectedCount",
    WITHDRAW: "withdrawCount",
    DEPOSIT: "depositCount",
    PERFECT_WITHDRAW: "perfectWithdrawalCount",
});

const DEFAULT_GAME_STATS = Object.freeze({
    [GAME_STAT_KEYS.REJECTED]: 0,
    [GAME_STAT_KEYS.WITHDRAW]: 0,
    [GAME_STAT_KEYS.DEPOSIT]: 0,
    [GAME_STAT_KEYS.PERFECT_WITHDRAW]: 0,
});

function loadRawStats() {
    try {
        return JSON.parse(localStorage.getItem(LSKEY_GAME_STATS)) || {};
    } catch {
        return {};
    }
}

function saveRawStats(stats) {
    localStorage.setItem(LSKEY_GAME_STATS, JSON.stringify(stats));
}

export function loadGameStats() {
    const raw = loadRawStats();
    return { ...DEFAULT_GAME_STATS, ...raw };
}

export function saveGameStats(stats) {
    const filtered = {};
    for (const key of Object.values(GAME_STAT_KEYS)) {
        filtered[key] = stats[key] ?? DEFAULT_GAME_STATS[key];
    }
    saveRawStats(filtered);
}

export function resetGameStats() {
    saveRawStats(DEFAULT_GAME_STATS);
    return { ...DEFAULT_GAME_STATS };
}

function incrementStat(key, amount = 1) {
    if (!Object.values(GAME_STAT_KEYS).includes(key)) {
        throw new Error(`Invalid stat key: ${key}`);
    }
    const stats = loadGameStats();
    stats[key] += amount;
    saveGameStats(stats);
    return stats[key];
}

export function incrementWithdraw(amount = 1){
    return incrementStat(GAME_STAT_KEYS.WITHDRAW, amount);
}

export function incrementDeposit(amount = 1) {
    return incrementStat(GAME_STAT_KEYS.DEPOSIT, amount);
}

export function incrementRejected(amount = 1) {
    return incrementStat(GAME_STAT_KEYS.REJECTED, amount);
}

export function incrementPerfectWithdrawal(amount = 1) {
    return incrementStat(GAME_STAT_KEYS.PERFECT_WITHDRAW, amount);
}

