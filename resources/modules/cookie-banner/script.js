export async function insertCookieBannerTemplate() {
    const response = await fetch("./resources/modules/cookie-banner/template.html");
    const html = await response.text();
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("analytics-banner").style.display = "flex";

    if (!document.getElementById("cookie-banner-style")) {
        const link = document.createElement("link");
        link.id = "cookie-banner-style";
        link.rel = "stylesheet";
        link.href = "./resources/modules/cookie-banner/style.css";
        document.head.appendChild(link);
    }
}
