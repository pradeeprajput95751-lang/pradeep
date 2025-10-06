async function sendBulkEmails() {
  const sendBtn = document.getElementById("sendBtn");
  const statusText = document.getElementById("statusText");

  sendBtn.disabled = true;
  sendBtn.style.background = "red";
  statusText.textContent = "📤 Sending...";
  statusText.style.color = "orange";

  const yourEmail = localStorage.getItem("yourEmail");
  const appPassword = localStorage.getItem("appPassword");
  const senderName = document.getElementById("senderName").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const messageBody = document.getElementById("message").value.trim();
  const emails = document.getElementById("emails").value.split("\n").map(e => e.trim()).filter(Boolean);

  if (!yourEmail || !appPassword) {
    alert("❌ Not logged in");
    window.location.href = "login.html";
    return;
  }

  const res = await fetch("/send-bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ senderName, yourEmail, appPassword, subject, messageBody, emails })
  });

  const data = await res.json();

  if (data.ok) {
    statusText.textContent = `✅ ${data.count} emails sent successfully!`;
    statusText.style.color = "lime";
    alert(`✅ ${data.count} emails sent successfully!`);
  } else {
    statusText.textContent = `❌ ${data.error}`;
    statusText.style.color = "red";
  }

  sendBtn.disabled = false;
  sendBtn.style.background = "#007bff";
}

function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}
