(function () {
    'use strict';

    angular
        .module('app')
        .service('ToastService', ToastService);

    /* @ngInject */
    function ToastService($mdToast) {
        this.showToast = showToast;

        function showToast(message) {
            $mdToast.show({
                template: '<md-toast style="background-color: #f44336;">' + message + '</md-toast>',
                position: 'bottom right',
                hideDelay: 5000
            });
        }
    }
})();