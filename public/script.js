async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data)
  });
  return res.json();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await post("/api/login", { username, password });
  if (res.success) {
    document.getElementById("login").style.display = "none";
    document.getElementById("app").style.display = "block";
  } else alert("Login failed!");
}

async function logout() {
  await post("/api/logout", {});
  location.reload();
}

async function sendMail() {
  const senderEmail = document.getElementById("senderEmail").value;
  const senderPass = document.getElementById("senderPass").value;
  const subject = document.getElementById("subject").value;
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  const res = await post("/api/send", { senderEmail, senderPass, subject, message, recipients });
  if (res.success) {
    alert("✅ Mail process complete!");
    document.getElementById("result").textContent = res.results.join("\n");
  } else {
    alert("❌ " + res.error);
  }
}
