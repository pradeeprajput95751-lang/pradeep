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
  const username = username.value;
  const password = document.getElementById("password").value;
  const res = await postJSON("/api/login", { username, password });
  if (res.success) {
    document.querySelector(".card").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else alert("Login failed!");
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

  const res = await postJSON("/api/send", { senderEmail, senderPass, subject, message, recipients });
  document.getElementById("results").textContent = JSON.stringify(res, null, 2);

  if (res.success) alert("✅ All mails processed!");
  else alert("❌ Error sending mails.");
};
