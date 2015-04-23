var notesApp = angular.module('NotesApp', ['ToastApp']);


    notesApp.controller('GetNoteCtrl', ['$scope','$http', 'ToastAPI', function($scope, $http, ToastAPI) {
        var note = [];
        $http.get('note/get').then(
            function(response){
                note = response.data;

                $scope.color = note.color;
                $scope.title = note.title;

                if(note.items) {
                    $scope.items = note.items;
                }
                else {
                    $scope.items = note.items;
                }
            }, 
            function(errResponse) {
            console.error('Error while fetching notes');
            });

            $scope.changeState = function(id, isDone) {
                console.log(id);
                $http({
                    url: 'note/' + id + '/updateItemIsDone',
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: "isDone=" + !isDone
                })
                .then(function(response) {
                    // success
                    if (isDone) {
                        ToastAPI.success("Item was UNchecked");
                    }
                    else {
                        ToastAPI.success("Item was checked");
                    }
                       //console.log(response);
                    }, 
                    function(response) { // optional
                    // failed
                        ToastAPI.error("Item wasn't updated");
                    }
                );
            }
    }]); 

    function checkUpdatedValue(watchExpr, scope) {
        scope.$watch(watchExpr, function(newValue, oldValue) {
            console.log('oldValue=' + oldValue);
            console.log('newValue=' + newValue);
            if (newValue === oldValue) {
                console.log(newValue === oldValue);
                return true;
            }
            else {
                console.log(newValue === oldValue);
                return false;
            }
        });
    };

    notesApp.directive("noteTitle", ["$http","ToastAPI", function($http, ToastAPI ) {
        return {
            restrict: "A",
            link: function (scope, elm, attrs, ctrl) {
                    
                    console.log("status:"+ checkUpdatedValue("title", scope));
                    elm.bind('blur', function() {
                        //var value = elm.val();
                        //{
                            $http({
                                url: "/note/updateTitle",
                                method: "POST",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                data: "value=" + value

                                })
                                .then(function(response) {
                                    // success
                                    ToastAPI.success("Title was changed")
                                    console.log(response);
                                }, 
                                function(response) { // optional
                                // failed
                                    ToastAPI.error("Title was NOT changed")
                                }
                            );
                        //}                  
                    });
                }   
            }
            
    }]);
    notesApp.directive("itemTitle", ["$http", function($http) {
        return {
            restrict: "A",
            //scope: {
              //item: "="
            //},
            link: function (scope, elm, attrs, ctrl) {
                    elm.bind('blur', function() {
                    console.log(scope.$id);
                        var value = elm.val();
                        $http({
                            url: "/note/" + scope.item.id + "/updateItem",
                            method: "POST",
                            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                            data: "value=" + value

                            })
                            .then(function(response) {
                                // success
                                console.log(response);
                            }, 
                            function(response) { // optional
                            // failed
                            }

                        );
                        
                    });
                }   
            }
    }]);

 