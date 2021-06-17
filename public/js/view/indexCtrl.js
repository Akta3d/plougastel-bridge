home.controller('IndexCtrl', ['$scope', 'IndexSrv', 
        function ($scope, IndexSrv)
        {
            'use strict';

            angular.extend($scope,
                {
                    currentHour: 0,
                    countdown: '',                
                }
            );

            $scope.$watch('currentHour', function (now, old)
            {
                /*istanbul ignore if*/
                if (now !== old)
                {
                    IndexSrv.setCurrentHour($scope.currentHour);
                    IndexSrv.__drawBackground();
                }
            });

            var today = new Date();
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);

            var now = new Date();
            var diff = Math.abs(now - today);
            $scope.currentHour = Math.floor((diff / 1000) / 60);
            IndexSrv.setCurrentHour($scope.currentHour);

            IndexSrv.initBackground();
        }
    ]
);