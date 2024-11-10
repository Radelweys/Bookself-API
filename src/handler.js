const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading
  } = request.payload;

  // Validasi jika properti 'name' tidak ada
  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    }).code(400);
  }

  // Validasi jika 'readPage' lebih besar dari 'pageCount'
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    }).code(400);
  }

  // Validasi jika properti wajib lainnya tidak ada
  if (!author || !summary || !publisher) {
    return h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi semua properti yang diperlukan (author, summary, publisher)'
    }).code(400);
  }

  const id = nanoid(20);  // ID unik untuk buku
  const finished = pageCount === readPage;  // Status apakah buku selesai dibaca
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // Membuat objek buku baru
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);  // Menyimpan buku baru ke dalam array

  // Response berhasil menambahkan buku
  return h.response({
    status: 'success',
    message: 'Buku berhasil ditambahkan',
    data: {
      bookId: id,
    },
  }).code(201);
};

const getAllBookHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  // Mulai dengan semua buku yang ada
  let filteredBooks = books;

  // Filter berdasarkan 'name' (case-insensitive)
  if (name) {
    filteredBooks = filteredBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Filter berdasarkan 'reading' (0 atau 1)
  if (reading !== undefined) {
    const isReading = reading === '1'; // reading: 1 berarti true, 0 berarti false
    filteredBooks = filteredBooks.filter((book) => book.reading === isReading);
  }

  // Filter berdasarkan 'finished' (0 atau 1)
  if (finished !== undefined) {
    const isFinished = finished === '1'; // finished: 1 berarti true, 0 berarti false
    filteredBooks = filteredBooks.filter((book) => book.finished === isFinished);
  }

  // Jika tidak ada buku yang memenuhi filter, kembalikan array kosong
  if (filteredBooks.length === 0) {
    return h.response({
      status: 'success',
      data: {
        books: [],
      },
    }).code(200);
  }

  // Mapping untuk hanya mengembalikan properti id, name, dan publisher
  const responseBooks = filteredBooks.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  return h.response({
    status: 'success',
    data: {
      books: responseBooks,
    },
  }).code(200);
};



const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.find((b) => b.id === bookId);

  if (book) {
    return h.response({
      status: 'success',
      data: {
        book,
      },
    }).code(200);
  }

  return h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  }).code(404);
};

const updateBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

  if (!name) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    }).code(400);
  }
  if (readPage > pageCount) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    }).code(400);
  }
  const index = books.findIndex((book) => book.id === bookId);
  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    }).code(404);
  }
  const updatedAt = new Date().toISOString();
  books[index] = {
    ...books[index],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
    finished: pageCount === readPage,
  };
  return h.response({
    status: 'success',
    message: 'Buku berhasil diperbarui',
  }).code(200);
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;


  const index = books.findIndex((book) => book.id === bookId);

  if (index === -1) {
    return h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    }).code(404);
  }

  books.splice(index, 1);

  return h.response({
    status: 'success',
    message: 'Buku berhasil dihapus',
  }).code(200);
};


module.exports = {
  addBookHandler,
  getAllBookHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};