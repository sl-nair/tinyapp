const getUser = (email, database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};


const urlsForUser = (id, database) => {
  const userURLs = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};


module.exports = { getUser , urlsForUser};