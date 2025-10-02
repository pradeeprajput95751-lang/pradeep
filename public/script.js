const API_BASE = window.location.origin;

async function postJSON(url, data) {
  const res = await fetch(API_BASE + url, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    credentials:"include",
    body:JSON.stringify(data)
  });
  return res.json();
}

document.getElementById("loginBtn").addEventListener("click", async()=>{
  const username=document.getElementById("username").value;
  const password=document.getElementById("password").value;
  const res=await postJSON("/api/login",{username,password});
  if(res.success){document.getElementById("authArea").style.display="none";document.getElementById("appArea").style.display="block";}
  else alert(res.error||"Login failed");
});

document.getElementById("logoutBtn").addEventListener("click", async()=>{
  await postJSON("/api/logout",{});
  document.getElementById("authArea").style.display="block";
  document.getElementById("appArea").style.display="none";
});

document.getElementById("sendBtn").addEventListener("click", async()=>{
  const senderName=document.getElementById("senderName").value;
  const senderEmail=document.getElementById("senderEmail").value;
  const senderPass=document.getElementById("senderPass").value;
  const subject=document.getElementById("subject").value;
  const message=document.getElementById("message").value;
  const recipients=document.getElementById("recipients").value;

  if(!senderEmail||!senderPass){alert("Sender Email & Password required");return;}

  const res=await postJSON("/api/send",{senderName,senderEmail,senderPass,subject,message,recipients});
  document.getElementById("results").textContent=JSON.stringify(res,null,2);

  if(res.success){
    alert(`Mail sending completed!\n\n${res.results.map(r=>`${r.to}: ${r.status}`).join("\n")}`);
  } else alert("Mail sending failed!");
});
