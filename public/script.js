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
    document.getElementById("mailBox").style.display = "block";
    showPopup("✅ Login successful!", "success");
  } else {
    showPopup("❌ Invalid credentials", "error");
  }
}

async function sendMail() {
  const senderName = document.getElementById("senderName").value;
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  const res = await post("/api/send", {
    senderName,
    senderEmail,
    senderPass,
    subject,
    message,
    recipients,
  });

  if (res.success) {
    showPopup("✅ Mails sent successfully!", "success");
  } else {
    showPopup("❌ " + (res.error || "Failed"), "error");
  }
}

async function logout() {
  await post("/api/logout", {});
  location.reload();
}

function showPopup(msg, type) {
  const popup = document.getElementById("popup");
  popup.textContent = msg;
  popup.style.background = type === "success" ? "#28a745" : "#dc3545";
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 3000);
}

document.getElementById("loginBtn").addEventListener("click", login);
document.getElementById("sendBtn").addEventListener("click", sendMail);
document.getElementById("logoutBtn").addEventListener("click", logout);
