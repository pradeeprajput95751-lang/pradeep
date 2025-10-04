async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
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

  const popup = document.getElementById("popup");
  if (res.success) {
    popup.textContent = "✅ Mails sent successfully!";
    popup.classList.add("show");
  } else {
    popup.textContent = "❌ Failed: " + res.error;
    popup.style.background = "#dc3545";
    popup.classList.add("show");
  }

  setTimeout(() => popup.classList.remove("show"), 3000);
}

async function logout() {
  await post("/api/logout", {});
  window.location.reload();
}

document.getElementById("sendBtn").addEventListener("click", sendMail);
document.getElementById("logoutBtn").addEventListener("click", logout);
