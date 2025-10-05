async function sendMail() {
  const senderName = document.getElementById("senderName").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;
  const status = document.getElementById("status");

  if (!senderName || !email || !password || !subject || !message || !recipients) {
    status.innerText = "⚠️ Please fill all fields!";
    return;
  }

  status.innerText = "⏳ Sending mails...";
  const res = await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderName, email, password, subject, message, recipients })
  });

  const data = await res.json();
  if (data.success) {
    status.innerText = `✅ ${data.sent} emails sent successfully!`;
    showPopup();
  } else {
    status.innerText = `❌ Failed: ${data.message}`;
  }
}

async function logout() {
  window.location.href = "/";
}

function showPopup() {
  const popup = document.getElementById("popup");
  popup.style.display = "block";
  setTimeout(() => (popup.style.display = "none"), 3000);
}
