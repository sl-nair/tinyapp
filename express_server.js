const express = require('express');
const app = express();
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const PORT = 8080;
const { getUser , urlsForUser , generateRandomString} = require('./helpers');

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['frX0pYXolqDFoIXt4SJZ4xcEYeqfzSst'],

}));
app.use(express.urlencoded({ extended: true }));

//Databases
const urlDatabase = {
  
};

const users = {
};


//Routes

// Get route to homepage
app.get("/", (req, res) => {
  user_ID = req.session.user_ID;
  if (user_ID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[user_ID] };
    res.render("urls_login", templateVars);
  }
});

// get route to render the index ejs on the urls page
app.get("/urls", (req, res) => {
  user_ID = req.session.user_ID;
  if (!user_ID) {
    res.status(403).send("403 Error - Please login to access the URLs");
  } else {
    const templateVars = { urls: urlsForUser(user_ID, urlDatabase), user: users[user_ID] };
    res.render("urls_index", templateVars);
  }
});

//renders the _new ejs template when clients wants to create a new server
app.get("/urls/new", (req, res) => {
  user_ID = req.session.user_ID;
  if (user_ID) {
    const templateVars = { user: users[user_ID] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  };
});

//renders the urls_show template to see infomation about the specific shortURL/longURL pairing
app.get("/urls/:id", (req, res) => {
  user_ID = req.session.user_ID;
  const shortId = req.params.id
  if (!user_ID) {
    res.status(403).send("403 Error - Please login");
  } else if (!urlDatabase[shortId]) {
    res.send("404 Error: This URL does not exist");
  } else if (!urlsForUser(user_ID, urlDatabase)[shortId]) {
    res.status(403).send("403 Error - URL does not belong to current user");
  } else {
    const longURL = urlDatabase[shortId].longURL
    const templateVars = { id: shortId, longURL, user: users[user_ID] };
    res.render("urls_show", templateVars);
  }
});

//redirects the short url to the long url browser
app.get("/u/:id", (req, res) => {
  const shortId = req.params.id;
  if (urlDatabase[shortId]) {
    const longURL = urlDatabase[shortId].longURL;
    res.redirect(longURL);
  } else {
    res.send("404 Error: This URL does not exist");
  }
});

//route that posts the new short url and the long url to the urls database
app.post("/urls", (req, res) => {
  let newShortURL = generateRandomString();
  if (req.session.user_ID) {
    urlDatabase[newShortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_ID,
    };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.status(403).send("Please login to shorten URLs");
  }
});

//post route to update the longurl when client edits
app.post("/urls/:id", (req, res) => {
  user_ID = req.session.user_ID;
  const shortId = req.params.id;
  if (!user_ID) {
    res.status(403).send("403 Error - Please login");
  } else if (!urlsForUser(user_ID, urlDatabase)[shortId]) {
    res.status(403).send("403 Error - URL does not belong to current user");
  } else if (!urlDatabase[shortId]) {
    res.status(404).send("404 Error: This URL does not exist");
  } else {
    urlDatabase[shortId].longURL = req.body.newUrl;
    res.redirect("/urls");
  }
});

//post route for the deletion of a url from the database
app.post("/urls/:id/delete", (req, res) => {
  user_ID = req.session.user_ID;
  const shortId = req.params.id;
  if (!user_ID) {
    res.status(403).send("403 Error - Please login");
  } else if (!urlsForUser(user_ID, urlDatabase)[shortId]) {
    res.status(403).send("403 Error - URL does not belong to current user");
  } else if (!urlDatabase[shortId]) {
    res.send("404 Error: This URL does not exist");
  } else {
    delete urlDatabase[shortId];
    res.redirect("/urls");
  }
});

//GET login route to render the login template and form
app.get("/login", (req, res) => {
  user_ID = req.session.user_ID;
  if (user_ID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[user_ID] };
    res.render("urls_login", templateVars);
  }
});

// GET Route to render the registration template 
app.get("/register", (req, res) => {
  user_ID = req.session.user_ID;
  if (user_ID) {
    res.redirect("/urls");
  } else {
    const templateVars = { user: users[user_ID] };
    res.render("urls_registration", templateVars);
  }
});

//POST route to post login information
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
    }
  } catch (error) {
    res.status(403).send("403 Error - User does not exist. Please register.");
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
  } else if (currentUserEmail !== undefined) {
    res.status(400).send("400 Error - User already exists. Please login.");
  } else {
    users[userID] = userObj;
    req.session.user_ID = userID;
    res.redirect("/urls");
  }
});

//logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log("Example app listening on port", PORT);
});