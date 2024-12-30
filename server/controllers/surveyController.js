const dbUserConn = require("../config/dbConnection"); // load the database connection
const bcrypt = require("bcrypt"); // load the bcrypt cypher module

/***********
 * The joblist function returns the list of job titles with additional statistical information
 **********/
const jobList = (req, res) => {
  return new Promise((resolve, reject) => {
    dbUserConn.query(
      `
                Select * from Jobs_In_Demand;
        `,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);  // Make sure resolve is called on successful query
        }
      }
    );
  })
  .then(results => {
    res.json(results);
  }).catch(err => {
    console.log(err);
    res.sendStatus(500);  // Sending internal server error on failure
  });
};

/***************
 * The survey function receives the user input and stores it in the database
 **************/
const survey = (req, res) => {
  const { email, SchoolID, JobTitle, CreatorEmail } = req.body;
 
  return bcrypt
    .hash(email.split("@")[0], process.env.SALT)
    .then((hashedUser) => {
      return new Promise((resolve, reject) => {
        dbUserConn.query(
          `
            Replace Student_Job_Interest
            (User, SchoolID, JobTitle, CreatorEmail)
            values
            (?,?,?,?);
          `,
          [hashedUser, SchoolID, JobTitle, CreatorEmail],
          (err, results) => {
            if (err) {
              reject(err);  // Reject the promise if there is an error
            }
            resolve(results);  // Resolve the promise with the query results
          }
        );
      });
    })
    .catch(err => {
      console.log(err);  // Log the error
      throw err;  // Re-throw the error to propagate it
    });
};






/**************
 * The results function returns the survey results to the browser
 **************/
const results = (req, res) => {
  const { SchoolID } = req.body;

  if (SchoolID === null) {
    return new Promise((resolve, reject) => {
      dbUserConn.query(
        `
          SELECT B.SchoolName, COUNT(*) AS studentCount 
          FROM Student_Job_Interest A
          JOIN NYC_High_Schools B ON A.SchoolID = B.SchoolID
          WHERE A.SchoolID IS NOT NULL
          GROUP BY B.SchoolName
          ORDER BY studentCount DESC;
        `,
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);  // Resolve with the query results
          }
        }
      );
    })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
  } else {
    return new Promise((resolve, reject) => {
      dbUserConn.query(
        `
          SELECT JobTitle, COUNT(*) AS studentCount 
          FROM Student_Job_Interest
          WHERE SchoolID = ?
          GROUP BY JobTitle
          ORDER BY studentCount DESC;
        `,
        [SchoolID],
        (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        }
      );
    })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      console.log(err);
      res.sendStatus(500);
    });
  }
};

// Export the functions
module.exports = { jobList, survey, results };
