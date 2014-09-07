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
                    var id = response[i].id;
                    timePreferences[id] = response[i];

                    // Convert to Date for the timepicker.
                    timePreferences[id].startTime = new Date(timePreferences[id].attributes.startTime.iso);
                    timePreferences[id].endTime = new Date(timePreferences[id].attributes.endTime.iso);
                }

                group.timePreferences = timePreferences;
                group.timePreferencesLoaded = true;
                $scope.$apply();
            })
        })
    };

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
                timePreferences[id].save();
            }
        }
    }
});
