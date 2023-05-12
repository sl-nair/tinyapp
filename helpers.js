/**
 * @description 
 * @param {*} email 
 * @param {*} database 
 * @returns user Object or undefined
 */
const getUser = (email, database) => {
  for (const user in database) {
    if (email === database[user].email) {
      return database[user];
    }
  }
  return undefined;
};

/**
 * @param {*} id 
 * @param {*} database 
 * @returns urls object that has the same userID as the user thats logged in
 */
const urlsForUser = (id, database) => {
  const userURLs = {};
  for (let url in database) {
    if (id === database[url].userID) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

/**
 * @param {*}  
 * @returns a 6 digit alphanumeric string
 */

const generateRandomString = function() {
  let result = "";
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let charLength = chars.length;
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * charLength));
  }
  return result;
};

module.exports = { getUser , urlsForUser , generateRandomString};