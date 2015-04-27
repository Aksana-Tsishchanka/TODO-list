var toastApp = angular.module('ToastApp',[]);

toastApp.factory('ToastAPI', function() {
	return {
		status: null,
		message: null,
		success: function(msg) {
			this.status = "success";
			this.message = msg;
		},
		error: function(msg) {
			this.status = "error";
			this.message = msg;
		},
		clear: function(msg) {
			this.status = null;
			this.message = null;
		}	
	}
});

toastApp.directive('toast', [ function() {
	return {
		restrict: 'E',
		scope: {},
		replace: true,
		controller: function($scope, ToastAPI, $interval) {
			$scope.show = false;
			$scope.api = ToastAPI;

			$scope.$watch('api.status', showToast);
			$scope.$watch('api.message', showToast);

			function showToast() {
				$scope.show = !!($scope.api.status && $scope.api.message);
				$scope.class = "show";
			}
			
			$interval(function () {
				$scope.show = false;
				$scope.api.clear();
			}, 2500); 

		},
		template: '<div class="toastComponent toast-{{api.status}}" ng-show="show">' +' {{api.message}}' + '</div>' 
		}
	
}]);


