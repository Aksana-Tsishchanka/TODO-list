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


            
            /*
            $scope.$watch("title", function(newTitle, oldTitle) {
            	if (newTitle) {
            		console.log("newTitle=" + newTitle);
            	}
            	
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
            });
            */
    }]); 

	notesApp.directive("noteTitle", ["$http", function($http) {
		return {
			restrict: "A",
			link: function (scope, elm, attrs, ctrl) {
					//elm.unbind('input').unbind('keydown').unbind('change');
					elm.bind('blur', function() {
                		console.log(elm.val());
                		
                		var newValue = elm.val();
                		console.log("NewValue " + newValue);

                		var attrName = attrs.name;
                		console.log(attrName);

                		var notePost = {};

                		if (attrName === "title") {
							notePost.url = "/note/updateTitle";
							notePost.method = "POST";
							notePost.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
							notePost.data =  "value=" + newValue;              			
                		}
                		else if (attrName === "label") {
                			notePost.url = "/note/:id/updateItem";
                			notePost.data = "value=" + newValue;
                		};

               			$http(notePost)
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

 