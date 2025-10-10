async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (data.ok) {
    localStorage.setItem("loggedIn", "true");
    alert("✅ Login Successful!");
    window.location.href = "launcher.html";
  } else {
    alert("❌ Invalid login details!");
  }
}

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
  btn.textContent = "⏳ Sending...";
  btn.disabled = true;

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderName, yourEmail, appPassword, subject, messageBody, emails }),
  });

  const data = await res.json();
  btn.textContent = "📨 Send All";
  btn.disabled = false;

  if (data.ok) {
    alert(`✅ ${data.count} emails sent successfully!`);
  } else {
    alert(`❌ Failed: ${data.error}`);
  }
}

function handleLogout() {
  if (localStorage.getItem("logoutClick") === "1") {
    localStorage.removeItem("logoutClick");
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
  } else {
    localStorage.setItem("logoutClick", "1");
    alert("⚠️ Click logout again to confirm!");
  }
}
