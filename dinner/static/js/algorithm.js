// Assumes "group" is an array of people objects which implement these methods:
//   isAvailableForTime(startTime) -- returns true or false
//   getPreferredPlace() -- returns a string representing the name of a place

var MINUTES_BETWEEN_DINNERS = 15;

// Get the number of group members that can attend dinner at a certain time.
function getNumberAvailableForTime(group, startTime) {
    var numberAvailable = 0;
    for (var i = 0; i < group.length; ++i) {
        if (group[i].isAvailableForTime(startTime)) {
            ++numberAvailable;
        }
    }
    return numberAvailable;
}

// Returns exactly the top numTimes times within the provided range. Assumes
// the range actually has enough times in it.
function getNBestTimes(group, firstPossibleHours, lastPossibleHours, numTimes) {
    var bestTimes = getAllBestTimes(group, firstPossibleHours, lastPossibleHours,
                    -1);

    // The number of times in bestTimes that aren't among the worst ones.
    // (If they're all equally great, they're all the worst.)
    var numberOptimalTimes = 0;

    // If there aren't enough optimal times, append the next best.
    // Pass in the number of people attending the best times so that
    // getAllBestTimes can skip those times.
    // This is done iteratively until there are at least enough.
    while (bestTimes.length < numTimes) {
        numberOptimalTimes = bestTimes.length;
        excludedNumberAvailable = getNumberAvailableForTime(group,
                                                            bestTimes[bestTimes.length - 1]);
        bestTimes = bestTimes.concat(getAllBestTimes(group,
                                                     firstPossibleHours,
                                                     lastPossibleHours,
                                                     excludedNumberAvailable))
    }

    // If there are too many optimal times after the above step, keep the very
    // best ones and choose from among the rest to maximize diversity.
    if (bestTimes.length > numTimes) {
        var veryBestTimes = bestTimes.splice(0, numberOptimalTimes);
        var numTimesToAdd = numTimes - veryBestTimes.length;
        return sortTimeArray(getDiverseTimes(veryBestTimes, bestTimes, numTimesToAdd));
    }

    return sortTimeArray(bestTimes);
}

// Sorts an array of times and returns that array.
function sortTimeArray(times) {
    times.sort(function(a, b) {
        return a.hours > b.hours || (a.hours === b.hours && a.minutes > b.minutes);
    }
    );
    return times;
}

// Returns an array of times consisting of all of knownTimes and numTimesToAdd
// of possibleTimes, selected for maximum diversity.
function getDiverseTimes(knownTimes, possibleTimes, numTimesToAdd) {
    // Base case. If there's nothing to add, we're done.
    if (numTimesToAdd === 0) {
        return knownTimes;
    }

    function score(arr) {
        var thisScore = -1;
        for (var i = 0; i < arr.length - 1; ++i) {
            iTime = 60*arr[i].hours + arr[i].minutes;
            newTime = 60*arr[arr.length - 1].hours + arr[arr.length - 1].minutes;
            if (newTime - iTime >= 0 && (thisScore === -1 || newTime - iTime < thisScore)) {
                thisScore = newTime - iTime;
            }
            else if (thisScore === -1 || iTime - newTime < thisScore) {
                thisScore = iTime - newTime;
            }
        }
        return thisScore;
    }

    var highScore = 0;
    var highScoreIndex = 0;

    // Recursive call. We try each possible addition in order to find the
    // highest-scoring one (according to our score function, above).
    for (var i = 0; i < possibleTimes.length; ++i) {
        var currentScore = score(knownTimes.concat(possibleTimes[i]));
        if (currentScore > highScore) {
            highScore = currentScore;
            highScoreIndex = i;
        }
    }

    // Move the best-scoring possibleTime to knownTimes and remember to add
    // one fewer time to the array.
    knownTimes = knownTimes.concat(possibleTimes.splice(highScoreIndex, 1));
    --numTimesToAdd;

    return getDiverseTimes(knownTimes, possibleTimes, numTimesToAdd);
}


// Returns all times with the greatest number of available people if
// excludedNumberAvailable is -1. Otherwise, returns all times with
// the greatest number of available people less than
// excludedNumberAvailable.
function getAllBestTimes(group, firstPossibleHours, lastPossibleHours,
                         excludedNumberAvailable) {

    var bestTimes = [];               // The times with the most availability.
    var highestNumberAvailable = 0;   // The most available people of any time
                                      // checked so far.

    for (var hours = firstPossibleHours;
         hours < lastPossibleHours;
         ++hours) {
        for (var minutes = 0;
             minutes < 60;
             minutes += MINUTES_BETWEEN_DINNERS) {

            var time = {hours:hours, minutes:minutes};
            time.hours = hours;
            time.minutes = minutes;

            var numberAvailable = getNumberAvailableForTime(group, time);

            // If we're supposed to be excluding certain times, do that.
            if (excludedNumberAvailable != -1 &&
                numberAvailable >= excludedNumberAvailable) {
                continue;
            }

            if (numberAvailable === highestNumberAvailable) {
                bestTimes.push(time);
            }
            else if (numberAvailable > highestNumberAvailable) {
                bestTimes = [];
                bestTimes[0] = time;
                highestNumberAvailable = numberAvailable;
            }
        }
    }

    return bestTimes;
}

function getPlaceForTime(group, time) {
    var votes = {};
    for (var i = 0; i < group.length; ++i) {
        if (group[i].isAvailableForTime(time)) {
            if (typeof votes[group[i].getPreferredPlace()] === "undefined") {
                votes[group[i].getPreferredPlace()] = 0;
            }
            ++votes[group[i].getPreferredPlace()];
        }
    }

    var winner = "";
    for (key in votes) {
        if (winner === "" ||
            (votes[key] > votes[winner]) ||
            (votes[key] === votes[winner] && key > winner)) {
            winner = key;
        }
    }

    return winner;
}
