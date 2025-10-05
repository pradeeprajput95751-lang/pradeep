// public/script.js
async function post(url, data) {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return r.json();
}

function toast(msg, ok = true) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = ok ? "#16a34a" : "#ef4444";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

document.getElementById("logout").addEventListener("click", async () => {
  await post("/api/logout", {});
  window.location.href = "/";
});

document.getElementById("send").addEventListener("click", async () => {
  const senderName = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("email").value.trim();
  const senderPass = document.getElementById("pass").value.trim();
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("msg").value;
  const recipients = document.getElementById("rcpts").value;

  // clear previous UI
  document.getElementById("summary").textContent = "";
  document.getElementById("failedList").innerHTML = "";

  if (!senderEmail || !senderPass || !recipients) {
    toast("Fill all required fields", false);
    return;
  }

  toast("Sending emails... (this may take a moment)", true);

  const res = await post("/api/send", {
    senderName,
    senderEmail,
    senderPass,
    subject,
    message,
    recipients
  });

  if (!res || !res.success) {
    toast(`Failed: ${res && (res.error || res.message) ? (res.error || res.message) : "Unknown error"}`, false);
    return;
  }

  // Friendly summary
  const total = res.total ?? (res.sent ? res.sent.length : 0);
  const okCount = res.count ?? (res.sent ? res.sent.filter(s => s.ok).length : 0);
  const failCount = total - okCount;

  const summaryEl = document.getElementById("summary");
  summaryEl.innerHTML = `<strong>Result:</strong> ${okCount} / ${total} emails sent successfully.`;

  // If some failed, show a compact list (not raw JSON)
  if (failCount > 0 && Array.isArray(res.results)) {
    const failed = res.results.filter(r => !r.ok);
    const failedListEl = document.getElementById("failedList");
    failedListEl.innerHTML = `<li><strong>Failed (${failed.length}):</strong></li>`;
    failed.forEach(f => {
      const li = document.createElement("li");
      li.textContent = `${f.to} — ${f.error || "Failed"}`;
      failedListEl.appendChild(li);
    });
    toast(`Finished: ${okCount} sent, ${failed.length} failed`, false);
  } else {
    toast(`✅ ${okCount} emails sent successfully`, true);
  }
});
