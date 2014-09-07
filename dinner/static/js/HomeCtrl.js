app.controller("HomeCtrl", function($scope, fb, parseQuery, $timeout) {
    $scope.logout = function() {
        Parse.User.logOut();
        window.location = "/";
    }

    $scope.currentUser = Parse.User.current();
    $scope.group = null;
    $scope.getFriends = function(friendName) {
        var q = new Parse.Query(Parse.User);
        q.startsWith("lowercaseName", friendName.toLowerCase());
        return parseQuery.find(q);
    };
    $scope.addMember = function(selectedFriend) {
        var isMember = false;
        for (var i = 0; i < $scope.group.members.length; i++) {
            if (selectedFriend.id === $scope.group.members[i].id) {
                isMember = true;
                break;
            }
        }

        if (!isMember) {
            $scope.group.members.push(selectedFriend);
        }
        $scope.selectedFriend = "";
    }
    $scope.resetGroup = function() {
        $scope.group = {
            name: "",
            members: []
        }
        $scope.addMember(Parse.User.current());
    }
    $scope.resetGroup();
    $scope.removeMember = function(member) {
        for (var i = $scope.group.members.length - 1; i >= 0; i--) {
            if ($scope.group.members[i] == member) {
                $scope.group.members.splice(i, 1);
            }
        }
    }

    $scope.addGroupButtonText = "";
    $scope.addGroupDialogVisible = true;
    $scope.toggleAddGroupDialog = function() {
        $scope.addGroupDialogVisible = !$scope.addGroupDialogVisible;
        if ($scope.addGroupDialogVisible) {
            $scope.addGroupButtonText = "Hide";
        } else {
            $scope.addGroupButtonText = "Add group";
        }
    }
    $scope.toggleAddGroupDialog();

    $scope.addGroup = function() {
        var Group = Parse.Object.extend("Group");
        var group = new Group();
        group.set("name", $scope.group.name);
        group.set("members", $scope.group.members);
        group.set("createdBy", $scope.currentUser);

        var timePreferences = {};
        for (var i = 0; i < $scope.group.members.length; i++) {
            timePreferences[$scope.group.members[i].id] = [];
        }
        group.set("timePreferences", timePreferences)
        group.save();

        $scope.toggleAddGroupDialog();
        $scope.resetGroup();
        $scope.loadGroups();
    }

    $scope.loadTimePreferences = function(group) {
        group.timePreferencesLoaded = false;

        var timePreferenceIds = [];
        var timePreferences = group.attributes.timePreferences;
        for (var userId in timePreferences) {
            if (timePreferences.hasOwnProperty(userId)) {
                var userTimePreferences = timePreferences[userId];
                for (var i = 0; i < userTimePreferences.length; i++) {
                    timePreferenceIds.push(userTimePreferences[i].id);
                }
            }
        }

        var q = new Parse.Query("TimePreference");
        q.containedIn("objectId", timePreferenceIds);
        parseQuery.find(q).then(function(response) {
            $timeout(function() {
                // Construct the timePreferences dictionary from the array.
                var timePreferences = {};
                for (var i = 0; i < response.length; i++) {
                    // Convert to Date for the timepicker.
                    response[i].startTime = new Date(response[i].attributes.startTime.iso);
                    response[i].endTime = new Date(response[i].attributes.endTime.iso);

                    var id = response[i].get("createdBy").id;
                    timePreferences[id] = timePreferences[id] || [];
                    timePreferences[id].push(response[i]);
                }

                group.timePreferences = timePreferences;
                group.timePreferencesLoaded = true;
                $scope.getDinnerTimes(group);
                $scope.$apply();
            })
        })
    };

    $scope.getDinnerTimes = function(group) {
        function getMinutes(hours, minutes) {
            return (hours * 60) + minutes;
        }
        function makeAvailabilityForPreference(timePreference) {
            var ret = function(dinnerTime) {
                var startTime = timePreference.get("startTime");
                var startTimeMinutes = getMinutes(
                    startTime.getHours(),
                    startTime.getMinutes()
                );
                var endTime = timePreference.get("endTime");
                var endTimeMinutes = getMinutes(
                    endTime.getHours(),
                    endTime.getMinutes()
                );
                var dinnerTimeMinutes = getMinutes(dinnerTime.hours, dinnerTime.minutes);
                return (
                    startTimeMinutes <= dinnerTimeMinutes &&
                    dinnerTimeMinutes <= endTimeMinutes
                );
            };
            return ret;
        }
        function makeAvailability(timePreferences) {
            var funcs = [];
            for (var i = 0; i < timePreferences.length; i++) {
                funcs.push(makeAvailabilityForPreference(timePreferences[i]));
            }
            return function(startTime) {
                for (var i = 0; i < funcs.length; i++) {
                    if (!funcs[i](startTime)) {
                        return false;
                    }
                }
                return true;
            };
        }

        var groups = [];
        var timePreferences = group.timePreferences;
        for (var id in timePreferences) {
            if (timePreferences.hasOwnProperty(id)) {
                groups.push({
                    isAvailableForTime: makeAvailability(timePreferences[id]),
                    getPreferredPlace: function() {
                        return "North Quad";
                    }
                });
            }
        }
        group.dinnerTimes = getNBestTimes(groups, 17, 20, 3);
        for (var i = 0; i < group.dinnerTimes.length; i++) {
            group.dinnerTimes[i].place = getPlaceForTime(groups, group.dinnerTimes[i]);
        }
        $scope.getDinners(group);
    }

    $scope.userGroups = [];
    $scope.loadGroups = function() {
        var q = new Parse.Query("Group");
        q.equalTo("members", $scope.currentUser);
        parseQuery.find(q).then(function(response) {
            $timeout(function() {
                $scope.userGroups = response;
                for (var i = 0; i < $scope.userGroups.length; i++) {
                    $scope.loadTimePreferences($scope.userGroups[i]);
                }
                $scope.$apply()
            });
        });
    };
    $scope.loadGroups();

    $scope.addTimePreference = function(group) {
        var TimePreference = Parse.Object.extend("TimePreference");
        var timePreference = new TimePreference();
        timePreference.set("group", group);
        timePreference.set("createdBy", $scope.currentUser);

        var startTime = new Date();
        startTime.setMinutes(0);
        var endTime = new Date();
        endTime.setMinutes(0);
        endTime.setHours((startTime.getHours() + 1) % 24);

        timePreference.set("startTime", startTime);
        timePreference.set("endTime", endTime);
        timePreference.save();

        group.get("timePreferences")[$scope.currentUser.id].push(timePreference);
        group.save();

        $scope.loadGroups();
    }

    $scope.saveTimePreferences = function(group) {
        var timePreferences = group.timePreferences;
        for (var id in timePreferences) {
            if (timePreferences.hasOwnProperty(id)) {
                for (var i = 0; i < timePreferences[id].length; i++) {
                    timePreferences[id][i].save();
                }
            }
        }
    }

    $scope.removeTimePreference = function(timePreference, group) {
        // Remove from the group's time preference list.
        var newTimePreferences = [];
        var oldTimePreferences = group.get("timePreferences")[$scope.currentUser.id]
        for (var i = 0; i < oldTimePreferences.length; i++) {
            if (oldTimePreferences[i].id !== timePreference.id) {
                newTimePreferences.push(oldTimePreferences[i]);
            }
        }
        
        var allTimePreferences = group.get("timePreferences");
        allTimePreferences[$scope.currentUser.id] = newTimePreferences;

        group.set("timePreferences", allTimePreferences)
        group.save();
        timePreference.destroy();

        $scope.loadGroups();
    }

    function getDay() {
        var date = new Date();
        return date.getYear() + "-" + date.getMonth() + "-" + date.getDay();
    }

    $scope.getEvent = function(dinner) {
        return dinner.place + " at " + (dinner.hours % 12) + ":" + dinner.minutes;
    }

    $scope.getDinners = function(group) {
        var q = new Parse.Query("DinnerAttendance");
        q.equalTo("group", group);
        q.equalTo("day", getDay());

        var dinnerTimes = [];
        for (var i = 0; i < group.dinnerTimes.length; i++) {
            dinnerTimes.push($scope.getEvent(group.dinnerTimes[i]));
        }
        q.containedIn("event", dinnerTimes);

        parseQuery.find(q).then(function(response) {
            var dinners = {};
            for (var i = 0; i < response.length; i++) {
                var event = response[i].get("event");
                dinners[event] = dinners[event] || [];

                dinners[event].push(response[i]);
            }
            group.dinners = dinners;
            $timeout(function() {
                console.log(dinners);
                $scope.$apply();
            });
        });
    }

    $scope.rsvpToDinner = function(group, dinner) {
        var q = new Parse.Query("DinnerAttendance");
        q.equalTo("attendee", $scope.currentUser);
        q.equalTo("group", group);
        parseQuery.find(q).then(function(response) {
            for (var i = 0; i < response.length; i++) {
                response[i].destroy();
            }

            var DinnerAttendance = Parse.Object.extend("DinnerAttendance");
            var dinnerAttendance = new DinnerAttendance();
            dinnerAttendance.set("attendee", $scope.currentUser);
            dinnerAttendance.set("day", getDay());
            dinnerAttendance.set("group", group);
            dinnerAttendance.set("event", $scope.getEvent(dinner));
            dinnerAttendance.save();

            $scope.loadGroups();
        });
    };
});
