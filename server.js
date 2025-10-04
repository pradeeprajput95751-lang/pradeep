const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from public folder
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// ✅ Hardcoded login credentials
const USER = { username: "admin", password: "12345" };

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username, password);
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    return res.json({ success: true });
  } else {
    return res.json({ success: false, error: "Invalid credentials" });
  }
});

// Logout API
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
