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
  setTimeout(() => t.classList.remove("show"), 2500);
}

document.getElementById("logout").onclick = async () => {
  await post("/api/logout", {});
  location.href = "/";
};

document.getElementById("send").onclick = async () => {
  const senderEmail = email.value.trim();
  const senderPass = pass.value.trim();
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("msg").value;
  const recipients = document.getElementById("rcpts").value;

  if (!senderEmail || !senderPass || !recipients)
    return toast("Fill all required fields", false);

  toast("Sending emails...");
  const res = await post("/api/send", {
    senderEmail,
    senderPass,
    subject,
    message,
    recipients
  });

  if (res.success) {
    toast(`✅ ${res.count} emails sent`, true);
    result.textContent = JSON.stringify(res.sent, null, 2);
  } else toast(`❌ ${res.error}`, false);
};
