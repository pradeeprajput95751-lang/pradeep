// public/script.js
const loginArea = document.getElementById("loginArea");
const appArea = document.getElementById("appArea");
const toast = document.getElementById("toast");

function showToast(text, ok = true) {
  toast.textContent = text;
  toast.style.background = ok ? "#22c55e" : "#ef4444";
  toast.classList.remove("hidden");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 3000);
}

async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

// Login button
document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;
  const r = await postJSON("/api/login", { username, password });
  if (r.success) {
    loginArea.classList.add("hidden");
    appArea.classList.remove("hidden");
    showToast("Login successful", true);
  } else {
    showToast("Invalid credentials", false);
  }
});

// Provider toggle (show custom host/port if needed)
const provider = document.getElementById("provider");
const customConfig = document.getElementById("customConfig");
provider.addEventListener("change", () => {
  if (provider.value === "custom") customConfig.classList.remove("hidden");
  else customConfig.classList.add("hidden");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await postJSON("/api/logout", {});
  appArea.classList.add("hidden");
  loginArea.classList.remove("hidden");
  showToast("Logged out", true);
});

// Send all
document.getElementById("sendBtn").addEventListener("click", async () => {
  const providerVal = provider.value;
  const senderName = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  if (!senderEmail || !senderPass || !recipients) {
    showToast("Please fill sender, password and recipients", false);
    return;
  }

  const payload = {
    provider: providerVal,
    customHost: document.getElementById("customHost")?.value || "",
    customPort: document.getElementById("customPort")?.value || "",
    senderName, senderEmail, senderPass, subject, message, recipients
  };

  const res = await postJSON("/api/send", payload);

  if (res.success) {
    // show success toast and render results
    showToast("✅ Mails processed", true);
    const out = res.results.map(r => {
      if (r.success) return `${r.to} ✅ Sent`;
      return `${r.to} ❌ ${r.error}`;
    }).join("\n");
    document.getElementById("results").textContent = out;
  } else {
    showToast("Sending failed: " + (res.error || "unknown"), false);
  }
});
