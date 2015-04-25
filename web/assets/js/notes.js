var notesApp = angular.module('NotesApp', ['ToastApp']);


    notesApp.controller('GetNoteCtrl', ['$scope','$http', 'ToastAPI', function($scope, $http, ToastAPI) {
        var note = [];
        var initValue;
        var currentValue;

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
            }
        );

        $scope.getValueOnFocus = function(value) {
            initValue = value;
            console.log("init:" + initValue);
        }

        $scope.getValueOnBlur = function(value) {
            currentValue = value;
            console.log("Cur" + currentValue);

            if ( initValue !== currentValue ) {
                $http({
                    url: "/note/updateTitle",
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: "value=" + currentValue
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
            };
        }

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
        };

        $scope.addItem = function() {
                console.log("Add");
                $http({
                    url: "/note/newItem",
                    method: "GET",
                })
                .then(function(response) {
                    ToastAPI.success("Item was added");
                    console.log("id: " + response.data.id);
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
                    url: "/note/updateColor",
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'}, 
                    data: "color=" + currentColor
                })
                .then(function(response) {
                        console.log(response);
                        ToastAPI.success("Color of Note was changed");
                        $scope.color = currentColor;
                    },
                    function(response){
                        ToastAPI.error("Color of Note was NOT added");
                        $scope.color = defaultColor;
                    }
                );
            }
        }
    }]); 

/*
    notesApp.directive("noteTitle", ["$http","ToastAPI", function($http, ToastAPI ) {
        return {
            restrict: "A",
            link: function (scope, elm, attrs, ctrl) {
                    var value;
                    var oldValue;
                    elm.bind('focus', function() {
                        oldValue = elm.val();
                        console.log("oldValue=" + oldValue);
                    });
                    elm.bind('blur', function() {
                        value = elm.val();
                        console.log("Value=" + value);
                    });
                    console.log(oldValue === value);

                    if (oldValue !== value) {
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
                            });
                    }
                }
            }   
    }]);
*/

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
                        console.log("currentValue " + currentValue);

                        console.log(initValue + " === " + currentValue );

                        if (initValue !== currentValue) {
                            $http({
                                url: "/note/" + scope.id + "/updateItem",
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

 