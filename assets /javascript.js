var config = {
    apiKey: "AIzaSyAUfOnK6AmyGoPTIRWQJRUyEKt9Z_Wy5h8",
    authDomain: "train-scheduler-b525c.firebaseapp.com",
    databaseURL: "https://train-scheduler-b525c.firebaseio.com",
    projectId: "train-scheduler-b525c",
    storageBucket: "train-scheduler-b525c.appspot.com",
    messagingSenderId: "644134339966"
};
firebase.initializeApp(config);

var database = firebase.database(),

name = "",
trainName = "",
destination = "",
time = "",
frequency = "",
nextTrain = "",
minutesAway = "";

$("#submit").on("click", function(event) {
  event.preventDefault();
  compute();
});

	function compute() {
	// Capture values from input

	trainName = $("#trainName").val().trim();
	destination = $("#destination").val().trim();
	time = $("#time").val().trim();
	frequency = $("#frequency").val().trim();
	
	// add preceding '0' if ':' is at 1
	if (time.match(/\D/).index === 1) { 
		time = "0" + time;
	}

	// format current time
	var currentTime = moment().format("YYYY-MM-DD HH:mm"),
	// convert time to time format
	convertedTime = moment().format("YYYY-MM-DD") + " " + time;

	// Set variable for next train time, correct for midnight
	function nextTrainTime() {
		nextTrain = moment(convertedTime).format("HH:mm A");
		if (nextTrain === "00:00 AM") {
			nextTrain = "12:00 AM";
		}
	}

	// calculate next arrival
	if (convertedTime > currentTime) {
		nextTrain = time;
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
		nextTrainTime();
	}
	else {
		while (convertedTime < currentTime) {
			// increment start time by frequency
			var incrementTime = moment(convertedTime).add(frequency, "minutes"),
			// capture matching '_d' retult and format
			newTime = moment(incrementTime._d).format("YYYY-MM-DD HH:mm");
			// change converted time to new incremented time
			convertedTime = newTime;
		}
		nextTrainTime();
		// set variable with difference of next train and current time
		minutesAway = moment(convertedTime).diff(moment(currentTime), "minutes");
	}
	
	// Convert minutesAway to hour:minute format
	if (minutesAway > 60) {
		if (minutesAway%60 === 0) { // add 'hours'
			minutesAway = Math.floor(minutesAway/60) + " hours"
		}
		else {
			minutesAway = Math.floor(minutesAway/60) + "h " + minutesAway%60 + "m";
		}
	}
	else { // add 'minutes'
		minutesAway = minutesAway + " minutes";
	}

	// Convert frequency to hour:minute format
	if (frequency > 60) {
		if (frequency%60 === 0) { // add 'hours'
			frequency = Math.floor(frequency/60) + " hours"
		}
		else {
			frequency = Math.floor(frequency/60) + "h " + frequency%60 + "m";
		}
	}
	else { // add 'minutes'
		frequency = frequency + " minutes";
	}

	// Push to database
	database.ref().push({
		trainName: trainName,
		destination: destination,
		frequency: frequency,
		nextTrain: nextTrain,
		minutesAway: minutesAway
	});
} // end of function

// Revise existing content with new data
$("#revise").on("click", function(event) {
	trainName = $("#trainName").val().trim(); // capture train name entered value
  	var ref = firebase.database().ref().orderByKey();
	ref.once("value").then(function(snapshot) {
	    snapshot.forEach(function(childSnapshot) {
	    	var childData = childSnapshot.val().trainName; // capture train name database values
			if (trainName === childData) { // entered name value matches database value
				childSnapshot.ref.remove(); // remove the entire object
				compute(); // run function to create new data
			}
	  	});
	});
});

// Clear database completely
$("#clear").on("click", function(event) {
	var rootRef = firebase.database().ref(); // capture the database root
	rootRef.remove(); // remove all database contents
});

// Display current values 
database.ref().on("child_added", function(childSnapshot) {
	//Append results
	$("#trainSchedule").append("<tr>" +
	"<td>" + childSnapshot.val().trainName + "</td>" +
	"<td>" + childSnapshot.val().destination + "</td>" +
	"<td>" + childSnapshot.val().frequency + "</td>" +
	"<td>" + childSnapshot.val().nextTrain + "</td>" +
	"<td>" + childSnapshot.val().minutesAway + "</td>" +
	"</tr>"
	);

	// clear variables
	nextTrain = "";
	minutesAway = "";
})