const books = [];
const RENDER_EVENT = 'render-booklist';
const SEARCH_EVENT = 'search_event'
const SAVED_EVENT = 'saved-booklist';
const STORAGE_KEY = 'BOOKLIST_APP';

function isStorageExist() /* boolean */ {
    if (typeof(Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }
    return true;
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, writer, year, isCompleted) {
    return {
        id,
        title,
        writer,
        year,
        isCompleted
    }
}

function addBook() {
    const title = document.getElementById('title').value;
    const writer = document.getElementById('writer').value;
    const year = document.getElementById('year').value;
    const checkDone = document.getElementById('checkDone').checked;

    const generatedId = generateId();
    const bookObject = generateBookObject(generatedId, title, writer, year, checkDone);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    //Ke lokasi buku dan membuatnya flashing
    window.location.hash = "";
    window.location.hash = bookObject.id;
    const bookAdded = document.getElementById(bookObject.id)
    setTimeout(() => {
        bookAdded.style.backgroundColor = 'yellow';
    }, 200);
    setTimeout(() => {
        bookAdded.style.backgroundColor = null;
        window.location.hash = "";
        window.location.hash = "add-booklist";
    }, 1500);


    saveData();

}

function makeBook(bookObject) {
    //Book title div part
    const bookTitle = document.createElement('span');
    bookTitle.innerText = bookObject.title;

    const bookTitleDiv = document.createElement('div');
    bookTitleDiv.classList.add('book-title');
    bookTitleDiv.append(bookTitle);

    //Book writer div part
    const bookWriter = document.createElement('span');
    bookWriter.innerText = bookObject.writer;

    const bookWriterDiv = document.createElement('div');
    bookWriterDiv.classList.add('book-writer');
    bookWriterDiv.append(bookWriter);

    //Book year div part
    const bookYear = document.createElement('span');
    bookYear.innerText = bookObject.year;

    const bookYearDiv = document.createElement('div');
    bookYearDiv.classList.add('book-year');
    bookYearDiv.append(bookYear);

    //Append all the div to book container
    const bookItemContainer = document.createElement('div');
    bookItemContainer.classList.add('book-item');
    bookItemContainer.append(bookTitleDiv, bookWriterDiv, bookYearDiv);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    //Delete button
    const trashButtonSpan = document.createElement('span');
    trashButtonSpan.innerText = "Hapus";
    const trashButton = document.createElement('button');
    trashButton.classList.add('fill', 'delete');
    trashButton.append(trashButtonSpan)
    trashButton.addEventListener('click', function() {
        removeBookFromReadingList(bookObject.id);
    });

    //Edit Button
    const editButtonSpan = document.createElement('span');
    editButtonSpan.innerText = "Edit";
    const editButton = document.createElement('button');
    editButton.classList.add('fill', 'edit');
    editButton.append(editButtonSpan)
    editButton.addEventListener('click', function() {
        editBook(bookObject.id);
    });

    if (bookObject.isCompleted) {
        // Tombol baca lagi
        const readAgainSpan = document.createElement('span');
        readAgainSpan.innerText = "Pindah";
        const readAgainButton = document.createElement('button');
        readAgainButton.classList.add('fill', 'readAgain');
        readAgainButton.append(readAgainSpan)
        readAgainButton.addEventListener('click', function() {
            readBookAgain(bookObject.id);
        });

        buttonContainer.append(readAgainButton, editButton, trashButton);
    } else {
        // Tombol selesai
        const readDoneSpan = document.createElement('span');
        readDoneSpan.innerText = "Selesai";
        const readDoneButton = document.createElement('button');
        readDoneButton.classList.add('fill', 'readDone');
        readDoneButton.append(readDoneSpan)
        readDoneButton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
        });

        buttonContainer.append(readDoneButton, editButton, trashButton);
    }

    bookItemContainer.append(buttonContainer);

    //Set ID to book container
    bookItemContainer.setAttribute("id", bookObject.id);

    return bookItemContainer;
}

function removeBookFromReadingList(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === null) return;

    books.splice(bookTarget, 1);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget === null) return;

    document.getElementById('title').value = bookTarget.title;
    document.getElementById('year').value = bookTarget.year;
    document.getElementById('writer').value = bookTarget.writer;
    document.getElementById('checkDone').checked = bookTarget.isCompleted;

    //Show edit button
    const editData = document.getElementsByName("Edit")
    const editDataFunc = () => {
        console.log("Ini object buku yang akan diedit %o", bookTarget);
        bookTarget.title = document.getElementById('title').value;
        bookTarget.writer = document.getElementById('writer').value;
        bookTarget.year = document.getElementById('year').value;
        bookTarget.isCompleted = document.getElementById('checkDone').checked;
        editData[0].style.display = "none"
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    editData[0].style.display = "block"
    editData[0].onclick = editDataFunc;

    window.location.hash = "";
    window.location.hash = "add-booklist";
}


function readBookAgain(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

}

function findBook(bookId) {
    console.log("Book id in findbook %o", bookId);

    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const todo of data) {
            books.push(todo);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    // const submitForm = document.getElementById('form')
    // submitForm.addEventListener('submit', function(event) {
    //     event.preventDefault()
    //     addBook()
    // })

    const addData = document.getElementsByName("Add")
    addData[0].addEventListener('click', function(event) {
        event.preventDefault()
        addBook()
    });

    const searchSubmit = document.getElementById('search');
    searchSubmit.addEventListener('submit', function(event) {
        event.preventDefault()
        document.dispatchEvent(new Event(SEARCH_EVENT));
    })


})


document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBookList = document.getElementById('books-pending');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('books-done');
    completedBookList.innerHTML = '';

    let doneCounter = 0
    let pendingCounter = 0

    for (const book of books) {
        const bookElement = makeBook(book);

        if (!book.isCompleted) {
            uncompletedBookList.append(bookElement);
            pendingCounter++
        } else {
            completedBookList.append(bookElement);
            doneCounter++
        }
    }
    const doneCounterDOM = document.getElementById('done-counter');
    doneCounterDOM.innerHTML = doneCounter;

    const pendingCounterDOM = document.getElementById('pending-counter');
    pendingCounterDOM.innerHTML = pendingCounter;


});

document.addEventListener(SEARCH_EVENT, function() {

    var searchValue = document.getElementById('searchValue').value

    const uncompletedBookList = document.getElementById('books-pending');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('books-done');
    completedBookList.innerHTML = '';

    let doneCounter = 0
    let pendingCounter = 0

    console.log("Search value is%o", searchValue);
    for (const book of books) {
        const bookElement = makeBook(book);
        console.log("Book title is %o", book.title.toLowerCase());

        if (!book.isCompleted) {
            if (book.title.toLowerCase().includes(searchValue.toLowerCase())) {
                uncompletedBookList.append(bookElement);
                pendingCounter++
            }

        } else {
            if (book.title.toLowerCase().includes(searchValue.toLowerCase())) {
                completedBookList.append(bookElement);
                doneCounter++
            }

        }
    }
    const doneCounterDOM = document.getElementById('done-counter');
    doneCounterDOM.innerHTML = doneCounter;

    const pendingCounterDOM = document.getElementById('pending-counter');
    pendingCounterDOM.innerHTML = pendingCounter;

    searchValue = ""

});

document.addEventListener(SAVED_EVENT, function() {
    console.log(localStorage.getItem(STORAGE_KEY));
});