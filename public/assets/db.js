// set global vars
let db;
let budgetVersion;

// create database
const request = indexedDB.open('BudgetTransactions', 1);

request.onupgradeneeded = function (e) {
  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('BudgetTransactions', { autoIncrement: true });
  }
};

// if error, display it
request.onerror = () => {
  displayActionFailure(this.error);
};

// when first loaded up, check to see if user is online, if they are send whatever cached requests are in DB
request.onsuccess = function (e) {
  db = e.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

// send cached entries to database
function checkDatabase() {
  let transaction = db.transaction(['BudgetTransactions'], 'readwrite');
  const store = transaction.objectStore('BudgetTransactions');
  const getAll = store.getAll();

  // if fetch from database succeeds, send cached entries to API
  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
      .then((response) => response.json())
      .then((res) => {
        if (res.length !== 0) {
          // remove entries from database
          transaction = db.transaction(['BudgetTransactions'], 'readwrite');
          transaction.objectStore('BudgetTransactions').clear();
        }
      });
    }
  };

  // if fetch from database fails, display error message
  getAll.onerror = () => {
    displayActionFailure(this.error);
  }
}

// save transaction
const saveRecord = (record) => {
  console.log('Fetch failed, saving to IndexedDB');

  const transaction = db.transaction(['BudgetTransactions'], 'readwrite');
  transaction.objectStore('BudgetTransactions').add(record);
};

window.addEventListener('online', checkDatabase);