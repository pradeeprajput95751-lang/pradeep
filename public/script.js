async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // ✅ session cookies
    body: JSON.stringify(data)
  });
  return res.json();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await post("/api/login", { username, password });
  console.log("Login response:", res);
  if (res.success) {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("appBox").style.display = "block";
  } else {
    alert("Login failed: " + (res.error || "Try again"));
  }
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

  if (!senderEmail || !senderPass || !recipients) {
    alert("Fill all fields!");
    return;
  }

  const res = await post("/api/send", {
    senderEmail, senderPass, subject, message, recipients
  });

  if (res.success) {
    alert("✅ Mail process complete!");
    document.getElementById("results").textContent = res.results.join("\n");
  } else {
    alert("❌ " + res.error);
  }
}
