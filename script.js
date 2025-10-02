// 👇 Apna backend URL yaha set karo
// Agar local run kar rahe ho to: "http://localhost:3000"
// Agar deploy kar diya to: "https://your-app.onrender.com"
const API_BASE = "http://localhost:3000";

async function postJSON(url, data) {
  const res = await fetch(API_BASE + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // session cookies ke liye
    body: JSON.stringify(data)
  });
  return res.json();
}

document.getElementById("loginBtn").addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await postJSON("/api/login", { username, password });

  if (res.success) {
    document.getElementById("authArea").style.display = "none";
    document.getElementById("appArea").style.display = "block";
  } else {
    alert(res.error || "Login failed");
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await postJSON("/api/logout", {});
  document.getElementById("authArea").style.display = "block";
  document.getElementById("appArea").style.display = "none";
});

document.getElementById("sendBtn").addEventListener("click", async () => {
  const senderName = document.getElementById("senderName").value;
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  if (!senderEmail || !senderPass) {
    alert("Sender Email & Password required");
    return;
  }

  const res = await postJSON("/api/send", {
    senderName, senderEmail, senderPass, subject, message, recipients
  });

  document.getElementById("results").textContent = JSON.stringify(res, null, 2);
});
