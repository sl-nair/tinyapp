const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')

const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

let users = {

};

let username;

//function to create the short url id
function generateRandomString() {
  let result = "";
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result
};



app.get("/", (req, res) => {
  // username = req.cookies.user_ID;
  res.redirect("/urls");
});

//login route
app.post("/login", (req, res) => {
  username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

//Posts the registration information
app.post("/register", (req, res) => {
  userID = generateRandomString();
  users[userID] = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_ID", userID);

  res.redirect("/urls");
})

// Route to get the register page
app.get("/register", (req, res) => {
  const templateVars = { user: users[username] };
  res.render("urls_registration", templateVars);
})

//logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/");
})

//route that posts the new short url and the long url
app.post("/urls", (req, res) => {
  let newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${newID}`);
});

//post route for the deletion of a url from the database
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls")
});

//post route to update the longurl when client edits
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.newUrl
  res.redirect("/urls")
})

//redirects the short url to the long url browser
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});
// get route to render the index ejs on the urls page
app.get("/urls", (req, res) => {
  username = req.cookies.user_ID;
  // console.log(users[username], "this is the username"); 
  templateVars = { urls: urlDatabase, user: users[username] };
  res.render("urls_index", templateVars);
});
//renders the _new ejs when clients wants to create a new server
app.get("/urls/new", (req, res) => {
  username = req.cookies.user_ID;
  templateVars = { user: users[username] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  username = req.cookies.user_ID;
  templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, user: users[username] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log("Example app listening on port", PORT);
});