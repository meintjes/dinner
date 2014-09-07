app.controller("HomeCtrl", function($scope, fb, parseQuery, $timeout) {
    $scope.logout = function() {
        Parse.User.logOut();
        window.location = "/";
    }

    $scope.currentUser = Parse.User.current();
    $scope.group = null;
    $scope.resetGroup = function() {
        $scope.group = {
            name: "",
            members: []
        }
    }
    $scope.resetGroup();
    $scope.getFriends = function(friendName) {
        console.log(friendName);
        var q = new Parse.Query(Parse.User);
        q.startsWith("lowercaseName", friendName.toLowerCase());
        parseQuery.find(q).then(function(response) {
            console.log(response);
        });
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
    $scope.addMember(Parse.User.current());
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
        group.save();

        $scope.toggleAddGroupDialog();
        $scope.resetGroup();
    }

    $scope.userGroups = [];
    $scope.loadGroups = function() {
        var q = new Parse.Query("Group");
        q.equalTo("members", $scope.currentUser);
        parseQuery.find(q).then(function(response) {
            $timeout(function() {
                $scope.userGroups = response;
                console.log(response);
                $scope.$apply()
            });
        });
    };
    $scope.loadGroups();
});
