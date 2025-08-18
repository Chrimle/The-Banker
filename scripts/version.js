
const versionMeta = document.querySelector('meta[name="version"]');
const versionNumber = versionMeta ? versionMeta.content : "N/A";

const pill = document.querySelector(".version-pill");
pill.textContent = `v${versionNumber}`;
pill.addEventListener('click', () => {
    window.open(COMMIT_HISTORY_URL, '_blank');
});
