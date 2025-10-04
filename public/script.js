async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await post("/api/login", { username, password });
  if (res.success) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";
  } else {
    alert("❌ Invalid login!");
  }
}

async function logout() {
  await post("/api/logout", {});
  location.reload();
}

async function sendMail() {
  const senderName = document.getElementById("senderName").value;
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  if (!senderEmail || !senderPass || !recipients) {
    alert("⚠️ Please fill all fields!");
    return;
  }

  const res = await post("/api/send", {
    senderName,
    senderEmail,
    senderPass,
    subject,
    message,
    recipients,
  });

  if (res.success) {
    alert("✅ All mails processed successfully!");
    document.getElementById("results").textContent = res.results.join("\n");
  } else {
    alert("❌ Error: " + res.error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("loginBtn").addEventListener("click", login);
  document.getElementById("sendBtn").addEventListener("click", sendMail);
  document.getElementById("logoutBtn").addEventListener("click", logout);
});
