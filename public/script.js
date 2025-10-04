async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return res.json();
}

document.getElementById("loginBtn").onclick = async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await postJSON("/api/login", { username, password });
  if (res.success) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";
  } else {
    alert(res.error || "Login failed!");
  }
};

document.getElementById("logoutBtn").onclick = async () => {
  await postJSON("/api/logout", {});
  location.reload();
};

document.getElementById("sendBtn").onclick = async () => {
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  if (!senderEmail || !senderPass || !recipients) {
    alert("Please fill sender email, password, and recipients!");
    return;
  }

  const res = await postJSON("/api/send", { senderEmail, senderPass, subject, message, recipients });

  if (res.success) {
    alert("✅ All mails processed!");
    document.getElementById("results").textContent = res.results.join("\n");
  } else {
    alert("❌ Failed: " + (res.error || "Unknown error"));
  }
};
