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

//HELPER FUNCTIONS
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

const getUserByEmail = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
  return null
}

const getPassword = (password) => {
  for (const user in users) {
    if (password === users[user].password) {
      return user;
    }
  }
  return null
}

const getID = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return users[user].id;
    }
  }
  return null
}
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//login route
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const currentUserEmail = getUserByEmail(email)

  if (currentUserEmail === null) {
    res.status(403).send("403 Error - User does not exist. Please register.");
  } else if (getPassword(password) === null) {
    res.status(403).send("403 Error - Password does not match.");
  } else {
    // set cookie with user id
    const currentID = getID(email)
    res.cookie("user_ID", currentID);
    res.redirect("/urls");
  }
    
});

app.get("/login", (req, res) => {
  username = req.cookies.user_ID;
  templateVars = { user: users[username] };
  res.render("urls_login", templateVars)

})

//Posts the registration information
app.post("/register", (req, res) => {
  userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userObj ={
    id: userID,
    email,
    password,
  };
  const currentUserEmail = getUserByEmail(email)

  if (email === "" || password === "") {
    res.status(400).send("400 Error - Email or password field empty")
  } else if (currentUserEmail === null) {
    users[userID] = userObj;
    res.cookie("user_ID", userID);
    res.redirect("/urls");
  } else {
    res.status(400).send("400 Error - User already exists. Please login.")
  };
})

// Route to get the register page
app.get("/register", (req, res) => {
  const templateVars = { user: users[username] };
  res.render("urls_registration", templateVars);
})

//logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect("/login");
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