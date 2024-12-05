const db = require("../config/db");


const getAllStudents = async () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM students"; // Replace with your table name
    db.query(query, (err, results) => {
      if (err) {
        return reject(err); // Reject the promise if there's an error
      }
      resolve(results); // Resolve the promise with results
    });
  });
};

module.exports = { getAllStudents };
