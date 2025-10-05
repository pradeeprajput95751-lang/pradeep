// public/script.js
async function postJSON(url, data){
  const r = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    credentials: "include",
    body: JSON.stringify(data)
  });
  return r.json();
}

function showToast(msg, ok=true){
  const t = document.getElementById("toast");
  t.textContent = msg; t.style.background = ok ? "#16a34a" : "#ef4444";
  t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 3000);
}

document.getElementById("logoutBtn").addEventListener("click", async ()=>{
  await postJSON("/api/logout", {});
  window.location.href = "/";
});

document.getElementById("sendBtn").addEventListener("click", async ()=>{
  const senderName = document.getElementById("senderName").value.trim();
  const senderEmail = document.getElementById("senderEmail").value.trim();
  const senderPass = document.getElementById("senderPass").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value;
  const recipients = document.getElementById("recipients").value;

  if (!senderEmail || !recipients) { showToast("Please fill sender email and recipients", false); return; }

  // user can optionally enter desired delay in ms via browser console or you can add an input field.
  // defaultDelay used here. MIN enforced server-side to 300ms.
  const defaultDelayMs = 300; // frontend hint; server enforces min 300ms
  showToast("Sending emails... please wait", true);

  const res = await postJSON("/api/send", { senderName, senderEmail, subject, message, recipients, delayMs: defaultDelayMs });

  if (res.success) {
    const m = `Mode: ${res.mode}\nSent: ${res.sent}\n`;
    const resultsText = (res.results || []).map(r => r.to ? (r.success ? `${r.to} ✅` : `${r.to} ❌ ${r.error}`) : JSON.stringify(r)).join("\n");
    document.getElementById("results").textContent = m + "\n" + resultsText;
    showToast(`✅ ${res.sent} emails processed`, true);
  } else {
    showToast(`Failed: ${res.error || res.message}`, false);
    document.getElementById("results").textContent = JSON.stringify(res);
  }
});
