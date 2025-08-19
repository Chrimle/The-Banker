fetch("./resources/modules/cookie-banner/template.html")
  .then(r => r.text())
  .then(html => {
    document.body.insertAdjacentHTML("beforeend", html);
    document.getElementById("analytics-banner").style.display = "flex";
  });
