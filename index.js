const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 4000;

// Middleware to parse JSON request body
app.use(express.json());

// Serve static files from 'static' directory
app.use(express.static('static'));

// Path to books.json file
const booksFilePath = path.resolve(__dirname, 'books.json');

// Utility functions for reading and writing to books.json
const readBooksFile = () => {
  if (!fs.existsSync(booksFilePath)) {
    fs.writeFileSync(booksFilePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(booksFilePath, 'utf8'));
};

const writeBooksFile = (data) => {
  fs.writeFileSync(booksFilePath, JSON.stringify(data, null, 2));
};

// Serve the homepage
app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'pages/index.html'));
});

// 1. Create a New Book
app.post('/books', (req, res) => {
  const { book_id, title, author, genre, year, copies } = req.body;

  // Validate input
  if (!book_id || !title || !author || !genre || !year || !copies) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const books = readBooksFile();

  // Check for duplicate book_id
  if (books.some((book) => book.book_id === book_id)) {
    return res.status(409).json({ message: 'Book with this ID already exists.' });
  }

  const newBook = { book_id, title, author, genre, year, copies };
  books.push(newBook);
  writeBooksFile(books);

  res.status(201).json(newBook);
});

// 2. Retrieve All Books
app.get('/books', (req, res) => {
  const books = readBooksFile();
  res.json(books);
});

// 3. Retrieve a Specific Book by ID
app.get('/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooksFile();
  const book = books.find((b) => b.book_id === id);

  if (!book) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  res.json(book);
});

// 4. Update a Book by ID
app.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;
  const books = readBooksFile();

  const bookIndex = books.findIndex((b) => b.book_id === id);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  books[bookIndex] = { ...books[bookIndex], ...updatedData };
  writeBooksFile(books);

  res.json(books[bookIndex]);
});

// 5. Delete a Book by ID
app.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const books = readBooksFile();

  const filteredBooks = books.filter((b) => b.book_id !== id);

  if (filteredBooks.length === books.length) {
    return res.status(404).json({ message: 'Book not found.' });
  }

  writeBooksFile(filteredBooks);
  res.json({ message: 'Book deleted successfully.' });
});

// Start the server
app.listen(port, () => {
  console.log(`Library Management System API running at http://localhost:${port}`);
});
