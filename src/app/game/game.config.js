(function () {
    'use strict';

    angular
        .module('app.game')
        .config(moduleConfig);

    /* @ngInject */
    function moduleConfig($translatePartialLoaderProvider, $stateProvider, triMenuProvider) {
        // $translatePartialLoaderProvider.addPart('app/game');

        $stateProvider
            .state('triangular.admin-default-no-scroll.registration', {
                url: '/registration',
                templateUrl: 'app/game/registration/registration.tmpl.html',
                controller: 'RegistrationController',
                controllerAs: 'vm',
                data: {
                    layout: {
                        contentClass: 'full-image-background mb-bg-fb-01 background-overlay-static',
                        innerContentClass: 'overlay-gradient-20'
                    }
                }
            })
            .state('triangular.admin-default-no-scroll.game-splash', {
                url: '/game/splash',
                templateUrl: 'app/game/splash/splash.tmpl.html',
                // set the controller to load for this page
                controller: 'GameSplashController',
                controllerAs: 'vm'
            })
            .state('triangular.admin-default-no-scroll.game-loading', {
                url: '/game/loading',
                templateUrl: 'app/game/loading/loading.tmpl.html',
                // set the controller to load for this page
                controller: 'GameLoadingController',
                controllerAs: 'vm'
            })
            .state('triangular.admin-default-no-scroll.game-chat', {
                url: '/game/chat',
                templateUrl: 'app/game/chat/chat.tmpl.html',
                // set the controller to load for this page
                controller: 'ChatPageController',
                controllerAs: 'vm'
            });

        // triMenuProvider.addMenu({
        //     name: 'MENU.SEED.SEED-MODULE',
        //     icon: 'zmdi zmdi-grade',
        //     type: 'dropdown',
        //     priority: 1.1,
        //     children: [{
        //         name: 'MENU.SEED.SEED-PAGE',
        //         state: 'triangular.admin-default-no-scroll.splash',
        //         type: 'link'
        //     }]
        // });
    }
})();