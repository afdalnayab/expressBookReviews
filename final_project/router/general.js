const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ============================================================================
// Task 6: Register a new user
// ============================================================================
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// ============================================================================
// Task 1 & Task 10: Get the book list available in the shop
// (Implemented using async/await with Promise)
// ============================================================================
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        if (books) {
          resolve(books);
        } else {
          reject(new Error("Unable to fetch book list"));
        }
      });
    };

    const bookList = await getBooks();
    return res.status(200).send(JSON.stringify(bookList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// ============================================================================
// Task 2 & Task 11: Get book details based on ISBN
// (Implemented using Promise callbacks: .then() and .catch())
// ============================================================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBN = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ status: 404, message: `Book with ISBN ${isbn} not found` });
    }
  });

  getBookByISBN
    .then((book) => {
      return res.status(200).json(book);
    })
    .catch((err) => {
      return res.status(err.status || 500).json({ message: err.message });
    });
});

// ============================================================================
// Task 3 & Task 12: Get book details based on author
// (Implemented using async/await with Promise)
// ============================================================================
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();

  try {
    const getBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(
          book => book.author.toLowerCase() === author
        );

        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject({ status: 404, message: `No books found by author '${author}'` });
        }
      });
    };

    const booksByAuthor = await getBooksByAuthor();
    return res.status(200).json(booksByAuthor);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// ============================================================================
// Task 4 & Task 13: Get all books based on title
// (Implemented using async/await with Promise)
// ============================================================================
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
    const getBooksByTitle = () => {
      return new Promise((resolve, reject) => {
        const matchingBooks = Object.values(books).filter(
          book => book.title.toLowerCase().includes(title)
        );

        if (matchingBooks.length > 0) {
          resolve(matchingBooks);
        } else {
          reject({ status: 404, message: `No books found with title '${title}'` });
        }
      });
    };

    const booksByTitle = await getBooksByTitle();
    return res.status(200).json(booksByTitle);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message });
  }
});

// ============================================================================
// Task 5: Get book review based on ISBN
// ============================================================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
});

// ============================================================================
// Tasks 10 - 13: Axios Helper Functions (using Promise callbacks / async-await)
// ============================================================================

// Task 10: Add the code for getting the list of books available in the shop using async/await with Axios
const getBookListAxios = async (url = 'http://localhost:5000/') => {
  try {
    const response = await axios.get(url);
    console.log("Task 10 (Axios): List of all books:", response.data);
    return response.data;
  } catch (error) {
    console.error("Task 10 (Axios): Error retrieving books:", error.message);
    throw error;
  }
};

// Task 11: Add the code for getting the book details based on ISBN using Promise callbacks with Axios
const getBookByISBNAxios = (isbn, baseUrl = 'http://localhost:5000/isbn/') => {
  return axios.get(`${baseUrl}${isbn}`)
    .then(response => {
      console.log(`Task 11 (Axios): Book details for ISBN ${isbn}:`, response.data);
      return response.data;
    })
    .catch(error => {
      console.error(`Task 11 (Axios): Error retrieving book by ISBN:`, error.message);
      throw error;
    });
};

// Task 12: Add the code for getting the book details based on Author using async/await with Axios
const getBookByAuthorAxios = async (author, baseUrl = 'http://localhost:5000/author/') => {
  try {
    const response = await axios.get(`${baseUrl}${encodeURIComponent(author)}`);
    console.log(`Task 12 (Axios): Book details for author '${author}':`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Task 12 (Axios): Error retrieving books by author:`, error.message);
    throw error;
  }
};

// Task 13: Add the code for getting the book details based on Title using async/await with Axios
const getBookByTitleAxios = async (title, baseUrl = 'http://localhost:5000/title/') => {
  try {
    const response = await axios.get(`${baseUrl}${encodeURIComponent(title)}`);
    console.log(`Task 13 (Axios): Book details for title '${title}':`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Task 13 (Axios): Error retrieving books by title:`, error.message);
    throw error;
  }
};

module.exports.general = public_users;
module.exports.getBookListAxios = getBookListAxios;
module.exports.getBookByISBNAxios = getBookByISBNAxios;
module.exports.getBookByAuthorAxios = getBookByAuthorAxios;
module.exports.getBookByTitleAxios = getBookByTitleAxios;
