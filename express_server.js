const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080;
const { getUser , urlsForUser } = require('./helpers');

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['frX0pYXolqDFoIXt4SJZ4xcEYeqfzSst'],

}));
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

let users = {
};


let username;

//HELPER FUNCTIONS
//function to create the short url id
const generateRandomString = function() {
  let result = "";
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};



//GET ROUTES

app.get("/", (req, res) => {
  username = req.session.user_ID;
  if (username) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[username] };
    res.render("urls_login", templateVars);
  }
});

// get route to render the index ejs on the urls page
app.get("/urls", (req, res) => {
  username = req.session.user_ID;
  if (!username) {
    res.redirect("/login");
  } else {
    const templateVars = { urls: urlsForUser(username, urlDatabase), user: users[username] };
    res.render("urls_index", templateVars);
  }
});

//login route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  try {
    const currentUserEmail = getUser(email, users).email;
    const userPassword = getUser(email,users).password;

    if (currentUserEmail === email) {
      if (bcrypt.compareSync(password, userPassword)) {
        // set cookie with user id when logging in
        const currentID = getUser(email, users).id;
        req.session.user_ID = currentID;
        res.redirect("/urls");
      } else {
        res.status(403).send("403 Error - Password does not match.");
      }
    } else {
      res.status(403).send("403 Error - User does not exist. Please register.");
    }
  } catch (error) {
    res.status(403).send("403 Error - User does not exist. Please register.");
  }
});

app.get("/login", (req, res) => {
  username = req.session.user_ID;
  if (username) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[username] };
    res.render("urls_login", templateVars);
  }

});

//Posts the registration information
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassoword = bcrypt.hashSync(req.body.password, 10);
  const userObj = {
    id: userID,
    email,
    password: hashedPassoword,
  };
  const currentUserEmail = getUser(email, users);

  if ((email === "" &&  password !== "") || (email !== "" &&  password === "") || (email === "" &&  password === "")) {
    res.status(400).send("400 Error - Email or password field empty");
  } else if (currentUserEmail !== null) {
    res.status(400).send("400 Error - User already exists. Please login.");
  } else {
    users[userID] = userObj;
    req.session.user_ID = userID;
    res.redirect("/urls");
  }
});

// Route to get the register page
app.get("/register", (req, res) => {
  username = req.session.user_ID;
  if (username) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[username] };
    res.render("urls_registration", templateVars);
  }
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//route that posts the new short url and the long url
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  if (req.session.user_ID) {
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID,
    };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.send("Please login to shorten URLs");
  }
});

//post route for the deletion of a url from the database
app.post("/urls/:id/delete", (req, res) => {
  if (!username) {
    res.status(403).send("403 Error - Please login");
  } else if (!urlsForUser(username, urlDatabase)[req.params.id]) {
    res.status(403).send("403 Error - URL does not belong to current user");
  } else if (!urlDatabase[req.params.id]) {
    res.send("404 Error: This URL does not exist");
  } else {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
});

//post route to update the longurl when client edits
app.post("/urls/:id", (req, res) => {

  urlDatabase[req.params.id].longURL = req.body.newUrl;
  res.redirect("/urls");
});

//redirects the short url to the long url browser
app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
  } else {
    res.send("404 Error: This URL does not exist");
  }
});

//renders the _new ejs when clients wants to create a new server
app.get("/urls/new", (req, res) => {
  username = req.session.user_ID;
  if (username) {
    const templateVars = { user: users[username] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});
//renders the urls_show template to see infomation about the specific shortURL/longURL pairing
app.get("/urls/:id", (req, res) => {
  username = req.session.user_ID;
  if (!username) {
    res.status(403).send("403 Error - Please login");
  } else if (!urlsForUser(username, urlDatabase)[req.params.id]) {
    res.status(403).send("403 Error - URL does not belong to current user");
  } else {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], urls: urlDatabase, user: users[username] };
    res.render("urls_show", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log("Example app listening on port", PORT);
});