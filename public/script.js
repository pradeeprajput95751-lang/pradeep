const loginBtn = document.getElementById("loginBtn");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

if (loginBtn) {
  loginBtn.onclick = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include"
    });

    if (res.ok) location.href = "/launcher";
    else document.getElementById("msg").innerText = "❌ Invalid login!";
  };
}

if (sendBtn) {
  sendBtn.onclick = async () => {
    const senderName = document.getElementById("senderName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value;
    const recipients = document.getElementById("recipients").value;

    const res = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ senderName, email, password, subject, message, recipients })
    });

    const data = await res.json();
    const popup = document.getElementById("popup");
    if (data.success) {
      popup.innerText = `✅ Sent to ${data.sent} recipients!`;
      popup.style.display = "block";
      setTimeout(() => (popup.style.display = "none"), 3000);
    } else {
      popup.innerText = `❌ ${data.message}`;
      popup.style.background = "#e74c3c";
      popup.style.display = "block";
      setTimeout(() => (popup.style.display = "none"), 3000);
    }
  };
}

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    location.href = "/";
  };
}
