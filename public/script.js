async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

async function getJSON(url) {
  const res = await fetch(url, { credentials: "include" });
  return res.json();
}

function showToast(msg, ok = true) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = ok ? "#22c55e" : "#ef4444";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

// 🔐 LOGIN
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  if (!username || !password) return showToast("Enter credentials ❌", false);

  const res = await postJSON("/api/login", { username, password });
  if (res.success) {
    showToast("Login successful ✅", true);
    setTimeout(() => (window.location.href = "/launcher.html"), 1000);
  } else {
    showToast("Invalid username/password ❌", false);
  }
}

// 📤 SEND EMAILS
async function sendMail() {
  const data = {
    senderName: document.getElementById("senderName").value,
    senderEmail: document.getElementById("senderEmail").value,
    senderPass: document.getElementById("senderPass").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
    recipients: document.getElementById("recipients").value,
  };

  const res = await postJSON("/api/send", data);

  if (res.success) {
    showToast("Emails sent successfully ✅", true);
    document.getElementById("results").textContent = res.results
      .map(r => (r.success ? `${r.to} ✅` : `${r.to} ❌ ${r.error}`))
      .join("\n");
  } else {
    showToast(res.error || "Send failed ❌", false);
  }
}

// 🚪 LOGOUT
async function logout() {
  await postJSON("/api/logout", {});
  showToast("Logged out ✅", true);
  setTimeout(() => (window.location.href = "/login.html"), 1000);
}
