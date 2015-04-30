var notesApp = angular.module('NotesApp', ['ToastApp']);

    notesApp.controller('GetNoteCtrl', ['$scope','$http', 'ToastAPI', function($scope, $http, ToastAPI) {
        var note = [];
        var initValue;
        var currentValue;

        $http.get('note/get', { cache: false }).then(
            function(response){
                note = response.data;
                $scope.color = note.color;
                $scope.title = note.title;

                if(note.items) {
                    $scope.items = note.items;
                }
                else {
                    $scope.items = note.items;
                };
                ToastAPI.success("Items of note was loaded");
            }, 
            function(errResponse) {
                ToastAPI.error("Items of note was NOT loaded");
            }
        );

        $scope.getValueOnFocus = function(value) {
            initValue = value;
        }

        $scope.getValueOnBlur = function(value) {
            currentValue = value;

            if ( initValue !== currentValue ) {
                $http({
                    url: "/note/updateTitle?nocache=" + new Date().toISOString(),
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: "value=" + currentValue
                    })
                    .then(function(response) {
                        // success
                        ToastAPI.success("Title was changed")
                        }, 
                        function(response) { 
                            // failed
                            ToastAPI.error("Title was NOT changed")
                        }
                    );
            };
        };

        $scope.changeState = function(id, isDone) {
            console.log(id);
            $http({
                url: 'note/' + id + '/updateItemIsDone?nocache=' + new Date().toISOString(),
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
                }, 
                function(response) { // optional
                    // failed
                    ToastAPI.error("Item wasn't updated");
                }
                );
        };

        $scope.addItem = function() {
                $http({
                    url: "/note/newItem?nocache=" + new Date().toISOString(),
                    method: "GET",
                })
                .then(function(response) {
                    ToastAPI.success("Item was added");
                    $scope.items.push(response.data);
                },
                function(response){
                    ToastAPI.error("Item was not added");
                });
        };

        $scope.changeColorNote = function(event) {
            var defaultColor = "yellow";
            var currentColor = $scope.color;

            var clickedElem = event.target || event.srcElement;

            var color = clickedElem.getAttribute("color");
            //stop 
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble=true);
            
            if (currentColor !== color  && color != null) {
                currentColor = color;
            }
            else {
                currentValue = defaultColor;
            }

            if (currentColor !== $scope.color) {
                $http({
                    url: "/note/updateColor?nocache=" + new Date().toISOString(),
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                    data: "color=" + currentColor
                })
                .then(function(response) {
                        ToastAPI.success("Color of Note was changed");
                        $scope.color = currentColor;
                    },
                    function(response){
                        ToastAPI.error("Color of Note was NOT added");
                        $scope.color = defaultColor;
                    }
                );
            }
        };
        $scope.removeItem = function(item) {
            var index = $scope.items.indexOf(item);
            var id = item.id;
            $http({
                    url: "/note/" + id + "/delete?nocache=" + new Date().toISOString(),
                    method: "POST",
            })
            .then(function(response) {
                    ToastAPI.success("Item was deleted");
                    $scope.items.splice(index, 1); 
                },
                function(response){
                    ToastAPI.error("Item was NOT deleted");
                }
            );
        }

    }]); 

    notesApp.directive("itemTitle", ["$http", "ToastAPI", function($http, ToastAPI) {
        return {
            restrict: "A",
            scope: {
                id: "=",
            },
            link: function (scope, elm, attrs, ctrl) {
                    var initValue;
                    var currentValue;

                    elm.bind('focus', function() {
                        initValue = elm.val();
                        console.log("oldValue " + initValue);
                    });
                    elm.bind('blur', function() {
                        console.log(scope.id);
                        currentValue = elm.val();

                        if (initValue !== currentValue) {
                            $http({
                                url: "/note/" + scope.id + "/updateItem?nocache=" + new Date().toISOString(),
                                method: "POST",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                data: "value=" + currentValue

                                })
                                .then(function(response) {
                                    // success
                                    ToastAPI.success("Item was changed");
                                }, 
                                function(response) {
                                // failed
                                ToastAPI.error("Item was NOT changed");
                                }
                            );
                        };        
                        
                    });
                }   
            }
    }]);

 