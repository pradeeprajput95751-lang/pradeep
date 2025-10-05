// public/script.js
async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // VERY IMPORTANT: send cookies
    body: JSON.stringify(data),
  });
  return res.json();
}

async function getJSON(url) {
  const r = await fetch(url, { credentials: "include" });
  return r.json();
}

async function login() {
  const username = document.getElementById("loginUser").value;
  const password = document.getElementById("loginPass").value;

  const res = await postJSON("/api/login", { username, password });
  console.log("login res:", res);
  if (res.success) {
    // confirm session
    const who = await getJSON("/api/whoami");
    console.log("whoami after login:", who);
    if (who.loggedIn) {
      document.getElementById("loginArea").classList.add("hidden");
      document.getElementById("appArea").classList.remove("hidden");
      showToast("Login successful", true);
      return;
    }
  }
  showToast("Login failed", false);
}

async function sendMail() {
  const payload = {
    provider: document.getElementById("provider") ? document.getElementById("provider").value : "gmail",
    senderName: document.getElementById("senderName").value,
    senderEmail: document.getElementById("senderEmail").value,
    senderPass: document.getElementById("senderPass").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
    recipients: document.getElementById("recipients").value,
  };

  const res = await postJSON("/api/send", payload);
  console.log("send res:", res);
  if (res.success) {
    showToast("Mails processed", true);
    if (res.results) {
      document.getElementById("results").textContent = res.results.map(r => r.success ? `${r.to} ✅` : `${r.to} ❌ ${r.error}`).join("\n");
    }
  } else {
    // if session problem => show helpful message
    if (res.error && res.error.toLowerCase().includes("not logged")) {
      showToast("Not logged in — please login again", false);
      // show login area
      document.getElementById("appArea").classList.add("hidden");
      document.getElementById("loginArea").classList.remove("hidden");
    } else {
      showToast("Send failed: " + (res.error || "unknown"), false);
    }
  }
}

function showToast(text, ok = true) {
  const t = document.getElementById("toast");
  t.textContent = text;
  t.style.background = ok ? "#22c55e" : "#ef4444";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("sendBtn")?.addEventListener("click", sendMail);
  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    await postJSON("/api/logout", {});
    location.reload();
  });

  // optional: check if already logged in on load
  getJSON("/api/whoami").then(w => {
    if (w.loggedIn) {
      document.getElementById("loginArea")?.classList.add("hidden");
      document.getElementById("appArea")?.classList.remove("hidden");
    }
  }).catch(()=>{});
});
