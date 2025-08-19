export async function insertCookieBannerTemplate() {
    const response = await fetch("./resources/modules/cookie-banner/template.html");
    const html = await response.text();
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("analytics-banner").style.display = "flex";
}
