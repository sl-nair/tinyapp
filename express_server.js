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

//function to create the short url id
function generateRandomString() {
  let result = "";
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++){
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result
};

app.get("/", (req, res) => {
  res.redirect("/urls")
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username)
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
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
app.post("/urls/:id", (req,res) => {
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
  const username = req.cookies.username;
  let templateVars;
  if(username) { 
    templateVars = { urls: urlDatabase, username: username};
  } else {
    templateVars = { urls: urlDatabase, username: false}
  }
  res.render("urls_index", templateVars); 
});
//renders the _new ejs when clients wants to create a new server
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  let templateVars;
  if(username) { 
    templateVars = { username: username};
  } else {
    templateVars = { username: false}
  }
  res.render("urls_new", templateVars);
});
// 
app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  let templateVars;
  if(username) { 
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, username: username};
  } else {
    templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, username: false}
  }
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log("Example app listening on port", PORT);
});