(function () {
    'use strict';

    angular
        .module('app')
        .factory('ServiceFactory', ServiceFactory);

    /* @ngInject */
    function ServiceFactory() {
        var base_url = 'http://139.59.30.168:8090/api/';
        //var base_url = 'http://127.0.0.1:8000/api/';

        return {
            getBaseUrl: function () {
                return base_url;
            },
            getData: function () {
                return this.store;
            },
            setData: function (data) {
                this.store = data;
            }
        };
    }
})();
