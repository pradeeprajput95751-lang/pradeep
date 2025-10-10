async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const status = document.getElementById("login-status");

  status.textContent = "⏳ Logging in...";

  try {
    const res = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.ok) {
      localStorage.setItem("loggedIn", "true");
      alert("✅ Login successful!");
      window.location.href = "launcher.html";
    } else {
      status.textContent = "❌ Invalid username or password";
      status.style.color = "red";
    }
  } catch (err) {
    status.textContent = "⚠️ Server error: " + err.message;
    status.style.color = "red";
  }
}

// ---------- SEND BULK EMAILS ----------
async function sendBulkEmails() {
  const senderName = document.getElementById("senderName").value;
  const yourEmail = document.getElementById("yourEmail").value;
  const appPassword = document.getElementById("appPassword").value;
  const subject = document.getElementById("subject").value;
  const messageBody = document.getElementById("message").value;
  const emails = document.getElementById("emails").value
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e);

  const btn = document.getElementById("sendBtn");
  const statusText = document.getElementById("statusText");

  btn.disabled = true;
  btn.style.background = "red";
  statusText.textContent = "📨 Sending...";
  statusText.style.color = "red";

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderName, yourEmail, appPassword, subject, messageBody, emails }),
  });

  const data = await res.json();
  btn.disabled = false;
  btn.style.background = "#007bff";

  if (data.ok) {
    statusText.textContent = `✅ ${data.count} emails sent successfully!`;
    statusText.style.color = "green";
    alert(`✅ ${data.count} emails sent successfully!`);
  } else {
    statusText.textContent = `❌ Failed: ${data.error}`;
    statusText.style.color = "red";
    alert(`❌ ${data.error}`);
  }
}

// ---------- LOGOUT ----------
function handleLogout() {
  if (localStorage.getItem("logoutClick") === "1") {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("logoutClick");
    window.location.href = "login.html";
  } else {
    localStorage.setItem("logoutClick", "1");
    alert("⚠️ Click again to confirm logout!");
  }
}
