const express = require('express'); // Load the node.js webserver
const router = express.Router(); // Extract the Router from the webserver for us to use.
const surveyController = require('../controllers/surveyController.js'); // Load the controller for business logic and database access
const refController = require('../controllers/refController.js'); // Load the reference controller (e.g., for school list)

// Route to load the school list (GET request)
router.get('/school-list', refController.schoolList);

// Route to load the job list (GET request)
router.get('/joblist', surveyController.jobList);

// Route to handle user job selection (POST request)
router.post('/survey', (req, res) => {
  // Ensure that the survey function is returning a promise and we handle it correctly
  surveyController.survey(req, res)
    .then(result => {
      res.json(result);  // Send the result as JSON response
    })
    .catch(err => {
      console.error(err);  // Log the error
      res.status(500).json({ message: "An error occurred while processing your survey." }); // Send a 500 error with a message
    });
});



// Route to load the poll result data for the chart (POST request)
router.post('/results', (req, res) => {
  surveyController.results(req, res)
    .catch(err => {
      console.error(err); // Log the error
      res.status(500).json({ message: "An error occurred while retrieving the results." }); // Send a 500 error with a message
    });
});

// Make the above code accessible for other code modules
module.exports = router;

