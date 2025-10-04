async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

document.getElementById("loginBtn").onclick = async () => {
  const username = username.value;
  const password = password.value;
  const res = await postJSON("/api/login", { username, password });
  if (res.success) {
    loginBox.style.display = "none";
    appBox.style.display = "block";
  } else alert("Login failed!");
};

document.getElementById("logoutBtn").onclick = async () => {
  await postJSON("/api/logout", {});
  location.reload();
};

document.getElementById("sendBtn").onclick = async () => {
  const senderEmail = senderEmail.value;
  const senderPass = senderPass.value;
  const subject = subject.value;
  const message = message.value;
  const recipients = recipients.value;

  if (!senderEmail || !senderPass || !recipients)
    return alert("Fill all fields!");

  const res = await postJSON("/api/send", {
    senderEmail, senderPass, subject, message, recipients,
  });

  if (res.success) {
    alert("✅ Mail Sent!");
    results.textContent = res.results.join("\n");
  } else {
    alert("❌ " + (res.error || "Error"));
  }
};
