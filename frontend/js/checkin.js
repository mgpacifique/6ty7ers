const form = document.getElementById("checkin-form");
const errorBox = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("full_name").value.trim();
  const phone_number = document.getElementById("phone_number").value.trim();
  const department = document.getElementById("department").value;

  try {
    const session = await apiPost("/patients/check-in", { full_name, phone_number });

    // department isn't stored by the backend yet, so we pass it along in the URL for now
    const params = new URLSearchParams({
      token: session.public_token,
      department,
    });
    window.location.href = `queue.html?${params.toString()}`;

  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove("hidden");
  }
});