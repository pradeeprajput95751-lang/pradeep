async function post(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return res.json();
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  console.log("🔐 Logging in...", username);

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

// ✅ Attach click event (fix)
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", login);
});
