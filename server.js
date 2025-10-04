const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Static folder
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "bulkmailer@123",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // local/test ke liye
  })
);

// ✅ Credentials
const USER = { username: "admin", password: "12345" };

// Serve frontend
app.get("/", (req, res) => res.sendFile(path.join(publicPath, "index.html")));

// Login
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

// Logout
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
