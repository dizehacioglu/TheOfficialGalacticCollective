var masterApp = angular.module('masterApp', ['ngResource', 'ngRoute']);

masterApp.config(function($routeProvider){
	// Home-Search Page
	$routeProvider
	.when('/', {
		templateUrl : '/views/search', 
		controller : 'searchController'
	});
	// Login-Signup Page
	$routeProvider
	.when('/login', {
		templateUrl : '/views/login',
		controller : 'loginController'
	});
	// Dynamic route for Profiles
	$routeProvider
	.when('/profile/:username', {
		templateUrl : '/views/profile-template',
		controller : 'profileController'
	});
	//Community Page
	$routeProvider
	.when('/community', {
		templateUrl : '/views/community',
		controller : 'communityController'
	})
});

// Factory to query who is currently logged in
masterApp.factory('authenticateUser', function($http){

	var userContainer = { user: null }

	$http.get('/api/me').then(function(response) {
		userContainer.user = response.data;
	})

	return userContainer;

});

// Factory to search for Users
masterApp.factory('userFactory', function($resource){

	var model = $resource('/api/profiles/:username', {username : '@username'})

	return {
		model : model
	}

});

// Community Controller
masterApp.controller('communityController', function($scope, $http, $resource, $location, $routeParams, authenticateUser){
	
	$scope.userContainer = authenticateUser;

	$http.get('/api/allPosts').
		then(function(returnData){
			$scope.posts = returnData.data.reverse();
			$scope.posts.forEach(function(post){
		    	post.dateCreated = (new Date(post.dateCreated)).toDateString();
		    })
		})

	// $scope.theDate = post.dateCreated.toISOString();

	// Delete a Post
	$scope.deletePost = function(post, index){
		console.log('This is the post: ', post, index)

		$http.delete('/api/posts/' + post._id).
		then(function(response){

				$scope.posts.splice(index, 1)
				
		}, function(response){
				$scope.posts.splice(index, 1)

				
		});
	};
	// Like a Post and Update Respective User
	$scope.iLikeThisPostCommunity = function(post){
		post.likes += 1;
		console.log(post._id)
		$http.post('/api/ilikethispostcommunity', post).
		then(function(response) {
		    		console.log(response.err)

		  		}, function(response) {
				    // post.likes = response.body
				    console.log('Hi')

		  	});
	}

	// Show Post forms on respective button click
	 $scope.showJobForm = function(){
	 	$scope.contentForm = false;
	 	$scope.eventForm = false;
	 	$scope.jobForm = true;
	 };

	  $scope.showContentForm = function(){
	 	$scope.eventForm = false;
	 	$scope.jobForm = false;
	 	$scope.contentForm = true;
	 };

	 $scope.showEventForm = function(){
	 	$scope.jobForm = false;
	 	$scope.contentForm = false;
	 	$scope.eventForm = true;
	 };

	// Submit Posts to database
	$scope.submitJob = function(jobFormData) {
		console.log(jobFormData)
		jobFormData.type = 'job';
		$http.post('/api/posts', jobFormData).

		  		then(function(response) {
		    		$scope.posts.unshift(response.data)
		    		$scope.posts.forEach(function(post){
		    			post.dateCreated = (new Date(post.dateCreated)).toDateString();
		    		})

		  		}, function(response) {

				    console.log('2nd Response Submit Job')

		  	});
	};

	$scope.submitContent = function(contentFormData) {
		contentFormData.type = 'content';
		$http.post('/api/posts', contentFormData).

		  		then(function(response) {
		    		$scope.posts.unshift(response.data)
		    		$scope.posts.forEach(function(post){
		    			post.dateCreated = (new Date(post.dateCreated)).toDateString();
		    		})

		  		}, function(response) {
				    console.log('2nd Response Submit Content')

		  	});
	};

	$scope.submitEvent = function(eventFormData) {
		eventFormData.type = 'event';
		$http.post('/api/posts', eventFormData).

		  		then(function(response) {
		    		if(response.err){
		    			console.log('There was an error creating the post.')
		    		}

		    		else{
		    			$scope.posts.unshift(response.data)
		    			$scope.posts.forEach(function(post){
		    			post.dateCreated = (new Date(post.dateCreated)).toDateString();
		    			post.time = (new Date(post.time)).toDateString();
		    			})
		    			
		    		}

		    		

		  		}, function(response) {
				    console.log('2nd Response Submit Event')

		  	});
	};


});

// Search Controller
masterApp.controller('searchController', function($scope, $http, $resource, $location, $routeParams, authenticateUser){
	
	$scope.userContainer = authenticateUser;

	
	$http.get('/api/allUsers').
	 	then(function(returnData){
	 		$scope.profiles = returnData.data;
	 	})


});

// Profile controller
masterApp.controller('profileController', function($scope, $http, $resource, $location, $routeParams, authenticateUser, userFactory){

	$scope.userContainer = authenticateUser;

	$scope.profileUser = userFactory.model.get({username : $routeParams.username})

	$scope.editing = false;

	// Get request to get all the user's posts
	$http.get('/api/allUserPosts?username=' + $routeParams.username).
		then(function(returnData){
			$scope.posts = returnData.data.reverse();
			$scope.posts.forEach(function(post){
		    	post.dateCreated = (new Date(post.dateCreated)).toDateString();
		    	post.time = (new Date(post.time)).toDateString();
		    })


		});

	// Delete a Post
	$scope.deletePost = function(post, index){
		console.log('This is the post: ', post, index)

		$http.delete('/api/posts/' + post._id).
		then(function(response){

				$scope.posts.splice(index, 1)
				
		}, function(response){
				$scope.posts.splice(index, 1)

				
		})
	};


	// Turn on/off editing
	$scope.onEditting = function(){	
		$scope.editing = true;
	};

	$scope.submitToServer = function(){
		// userFactory.model.save($scope.profileUser);
		$scope.profileUser.$save();
		$scope.editing = false;
	};

	// Like a Post and Update Respective User
	$scope.iLikeThisPostProfile = function(post){
		post.likes += 1;
		$scope.profileUser.likes += 1;
		$http.post('/api/ilikethispostprofile', post).
		then(function(response) {
		    		console.log(response.err)

		  		}, function(response) {
				    post.likes = response.body
				    console.log('Hi')

		  	});
	}

});

// Controls all login/signup/logout functionality (see server.js and authenticate.js for backend routes and functionality)
masterApp.controller('loginController', function($scope, $http, $resource, $location, authenticateUser){

	$scope.userContainer = authenticateUser;

	// Login a user
	$scope.login = function(){
		$http.post('/login', $scope.loginFormData).

	  		then(function(response) {

	  			$scope.loginError = false;

	  			// If the HTTP request is successful, but passport has errors:
		    	if(response.err){
		    		console.log('Login request complete, but errors:', response.err)
		    	}
		    	// Everything successful, so we receive user data
		    	else{
		    		authenticateUser.user = response.data;
	    			$location.url('/profile/' + response.data.username)
		    	}
		    	// HTTP error
	  		}, function(response) {
			    console.log('Angular login error: ', response.data)
			    $scope.loginError = true;

	  	});
		
	};

	// Signup a user and log them in
	$scope.signup = function(){

		$http.post('/signup', $scope.signUpFormData).

	  		then(function(response) {

	  			if(response.data.err){
	  				$scope.signUpError = true;

	  			}

	  			else{

		  			$scope.signUpError = false;	

		    		$scope.userContainer.user = response.data;

		    		$location.url('/profile/' + response.data.username, {user: response.data.data})
	    		}
	  		}, function(response) {

			    $scope.signUpError = true;

	  	});
		
	};

	// Logout 
	$scope.logout = function(){
		$http.post('/logout', {msg:'hello word!'}).

	  		then(function(response) {
	  			$location.path('/login')
	  			authenticateUser.user = null;

	  		}, function(response) {
			    console.log('Error logging out: ', response)
	  	});
		
	};
});