var notesApp = angular.module('NotesApp',[]);

    notesApp.controller('GetNoteCtrl', ['$scope','$http', function($scope, $http) {
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
                    console.log(response);
                	}, 
                	function(response) { // optional
                	// failed
                    }
                );
            }

            $scope.changeTitle = function(title) {
            	$http({
                    url: 'note/updateTitle',
                    method: "POST",
                    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                    data: "title=" + title 
                })
                .then(function(response) {
                    // success
                    console.log(response);
                	}, 
                	function(response) { // optional
                	// failed
                    }
                );	
            }
    }]); 

