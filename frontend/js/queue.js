const params = new URLSearchParams(window.location.search);
const token = params.get("token") || "—";
const department = params.get("department") || "General Medicine";

document.getElementById("token-value").textContent = token;
document.getElementById("department-label").textContent = department;
document.getElementById("wait-note").textContent =
  "We'll notify you by SMS as your turn approaches";