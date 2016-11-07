(function () {
    'use strict';

    angular
        .module('triangular')
        .service('CommonService', ['$rootScope', '$timeout', '$window', '$location', 'ToastService', '$cookies', '$state', 'api', 'API_BROADCAST_CONSTANTS', 'AUCTION_USER_DATA', 'USER_BIDDING_ABILITY', function ($rootScope, $timeout, $window, $location, ToastService, $cookies, $state, api, API_BROADCAST_CONSTANTS, AUCTION_USER_DATA, USER_BIDDING_ABILITY) {

            //store all functions that returns from this service
            var all_functions = {};
            //store all health cards open for bidding
            var allHealthCards = [];
            //currently selected health card
            var currentlySelectedHealthCard = null;
            //initial health card, that all users recieved for free
            var initialHealthCard = null;

            //user purchased health cards list
            var userPurchasedHealthCards = [];

            //default card template
            var defaultCardTemplate = {
                id: 0,
                name: "default",
                states: [],
                status: "0",
                video: null
            }

            //added to detect state changing
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, ToastService) {
            });

            //check login cookies are available when user enters to a page, except registration and if not redirect to the registration
            $rootScope.$on('$viewContentLoading',
                function (event, viewConfig) {

                    $cookies.remove('nickName');

                    if ($location.url() && $location.url()) {
                        switch ($location.url()) {
                            case '/registration':
                                // if (!all_functions.isAuthCookiesMissing())
                                //     $state.go('triangular.admin-default-no-scroll.game-chat');
                                break;
                            case '/game/cards':
                                if (all_functions.isAuthCookiesMissing()) {
                                    openRegistrationPage();
                                }
                                break;
                            // case '/game/loading':
                            //     if (all_functions.isAuthCookiesMissing()) {
                            //         openRegistrationPage();
                            //     }
                            //     break;
                            case '/game/chat':
                                if (all_functions.isAuthCookiesMissing()) {
                                    openRegistrationPage();
                                }
                                break;
                            default:
                                openRegistrationPage();
                                break;
                        }
                    }
                });

            //show toast and redirect to the registration page
            function openRegistrationPage() {
                $state.go('triangular.admin-default-no-scroll.registration');
                ToastService.showToast('Please create a account before play');
            }

            //get minimum valued item from the item list
            Array.prototype.hasMin = function (attrib) {
                return this.reduce(function (prev, curr) {
                    return parseFloat(prev[attrib]) < parseFloat(curr[attrib]) ? prev : curr;
                });
            }

            //filter and get only first 10 cards
            //if allLowestCard is enabled, return the card with lowest bidding value
            function getFilteredCards(allCards) {
                if (!allCards || allCards === null)
                    return [];

                var topTenCards = [];
                var count = 0;
                var min = allHealthCards.hasMin('default_bid');
                for (count = 0; count < allCards.length; count++) {

                    //return top 10 helth cards
                    if (min.id != allCards[count].id)
                        topTenCards.push(allCards[count]);
                }

                return topTenCards;
            }


            all_functions = {
                isAuthCookiesMissing: function () {
                    var all_cookies = $cookies.getAll();
                    return (!all_cookies || all_cookies === null || !angular.isDefined(all_cookies['user']) || all_cookies['user'] === null);
                },
                //manage all health cards related fucntions
                healthCards: {
                    //retreive all health cards form the server
                    getAllCards: function () {

                        if (allHealthCards && allHealthCards != null && Array.isArray(allHealthCards) && allHealthCards.length > 0) {
                            $rootScope.$broadcast(API_BROADCAST_CONSTANTS.API_GET_ALL_CARDS, getFilteredCards(allHealthCards));
                            return;
                        }

                        api.healthCards().get().$promise.then(function (result) {

                            allHealthCards = result;
                            $rootScope.$broadcast(API_BROADCAST_CONSTANTS.API_GET_ALL_CARDS, getFilteredCards(result));
                        }, function (error) {
                            allHealthCards = [];
                            $rootScope.$broadcast(API_BROADCAST_CONSTANTS.API_GET_ALL_CARDS, allHealthCards);
                        })
                    },
                    //get all user's entitled free health card
                    getInitialHealthCard: function () {

                        if (allHealthCards && allHealthCards != null && Array.isArray(allHealthCards) && allHealthCards.length > 0)
                            return allHealthCards.hasMin('default_bid');
                        else
                            return null;

                    },
                    //user purchased all health card details
                    userPurchasedHealthCards: {
                        addCard: function (card) {
                            if (angular.isDefined(userPurchasedHealthCards) && userPurchasedHealthCards != null && Array.isArray(userPurchasedHealthCards))
                                userPurchasedHealthCards.push(card);
                        },
                        getCards: function () {

                            // userPurchasedHealthCards.push(defaultCardTemplate);
                            return userPurchasedHealthCards;
                        }
                    }
                },
                //create all users array
                allUsers: {
                    setAllUsers: function () {
                        var name = $cookies.get('nickName');
                        AUCTION_USER_DATA[0].user_name = name;
                    },
                    getAllUsers: function () {
                        return AUCTION_USER_DATA;
                    },
                    getAllRemainingUsers: function (exclude) {

                        var all_remaining_users = [];
                        angular.forEach(AUCTION_USER_DATA, function (user) {
                            if (user.userBiddingAbility != exclude && user.userBiddingAbility != USER_BIDDING_ABILITY.TERMINATE_FROM_TOURNAMENT) {
                                all_remaining_users.push(user);
                            }
                        })

                        return all_remaining_users;

                    },
                    resetAllUserList: function () {
                        angular.forEach(AUCTION_USER_DATA, function (user) {
                            if (user.userBiddingAbility === USER_BIDDING_ABILITY.TERMINATE_FOR_OPEN_ROUND) {
                                user.userBiddingAbility = USER_BIDDING_ABILITY.NOT_TERMINATED;
                            }
                        })
                    }
                }
            };

            return all_functions;

        }]);

})();