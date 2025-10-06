document.getElementById("loginForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please enter your Gmail ID and App Password");
    return;
  }

  localStorage.setItem("yourEmail", email);
  localStorage.setItem("appPassword", password);
  window.location.href = "launcher.html";
});
