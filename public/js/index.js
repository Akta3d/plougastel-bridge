var home = angular.module('home', [
    'ngRoute',
    'intia.services.index',  
    //@@templates
])

    .config(['$routeProvider',
        function ($routeProvider)
        {
            'use strict';
            $routeProvider.              
                when('/', {
                    templateUrl: 'js/view/index.html',
                    controller: 'IndexCtrl'
                }).
                otherwise({
                    redirectTo: '/'
                });
        }
    ]);
