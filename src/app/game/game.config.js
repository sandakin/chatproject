(function() {
    'use strict';

    angular
        .module('game-module')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        $translatePartialLoaderProvider.addPart('app/game-module');

        $stateProvider
        .state('triangular.admin-default-no-scroll.game-splash', {
            url: '/game/splash',
            templateUrl: 'app/game/splash.tmpl.html',
            // set the controller to load for this page
            controller: 'GameSplashController',
            controllerAs: 'vm'
        })
        .state('triangular.admin-default-no-scroll.game-loading', {
            url: '/game/loading',
            templateUrl: 'app/game/loading.tmpl.html',
            // set the controller to load for this page
            controller: 'GameLoadingController',
            controllerAs: 'vm'
        })
        .state('triangular.admin-default-no-scroll.game-chat', {
            url: '/game/chat',
            templateUrl: 'app/game/chat.tmpl.html',
            // set the controller to load for this page
            controller: 'ChatPageController',
            controllerAs: 'vm'
        });

        triMenuProvider.addMenu({
            name: 'MENU.SEED.SEED-MODULE',
            icon: 'zmdi zmdi-grade',
            type: 'dropdown',
            priority: 1.1,
            children: [{
                name: 'MENU.SEED.SEED-PAGE',
                state: 'triangular.admin-default-no-scroll.splash',
                type: 'link'
            }]
        });
    }
})();