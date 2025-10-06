async function sendBulkEmails() {
  const sendBtn = document.getElementById("sendBtn");
  const statusText = document.getElementById("statusText");

  sendBtn.disabled = true;
  sendBtn.style.background = "red";
  statusText.innerText = "📨 Sending...";
  statusText.style.color = "red";

  try {
    const yourEmail = localStorage.getItem("yourEmail");
    const appPassword = localStorage.getItem("appPassword");
    const senderName = document.getElementById("senderName").value;
    const subject = document.getElementById("subject").value;
    const messageBody = document.getElementById("message").value;
    const emails = document
      .getElementById("emails")
      .value.split("\n")
      .map((e) => e.trim())
      .filter((e) => e);

    if (!yourEmail || !appPassword) {
      alert("❌ Not logged in");
      window.location.href = "login.html";
      return;
    }

    const res = await fetch("/send-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderName,
        yourEmail,
        appPassword,
        subject,
        messageBody,
        emails,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      statusText.innerText = "✅ Sent successfully!";
      statusText.style.color = "green";
      alert(`✅ ${data.count} emails sent successfully!`);
    } else {
      throw new Error(data.error || "Unknown error");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Failed: " + err.message);
    statusText.innerText = "❌ Failed!";
    statusText.style.color = "red";
  } finally {
    sendBtn.disabled = false;
    sendBtn.style.background = "#007bff";
  }
}

function logout() {
  localStorage.removeItem("yourEmail");
  localStorage.removeItem("appPassword");
  window.location.href = "login.html";
}
