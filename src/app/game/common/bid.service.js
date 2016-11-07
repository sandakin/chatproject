(function () {
    'use strict';

    angular
        .module('triangular')
        .service('BiddingService', ['$rootScope', '$timeout', '$window', '$location', 'ToastService', '$cookies', '$state', 'api', 'CommonService', 'BIDDING_ROUNDS', 'AUCTION_USER_DATA', 'USER_BIDDING_ABILITY', function ($rootScope, $timeout, $window, $location, ToastService, $cookies, $state, api, CommonService, BIDDING_ROUNDS, AUCTION_USER_DATA, USER_BIDDING_ABILITY) {

            //store all functions that returns from this service
            var all_functions = {};

            //store current bidding round for future usage
            var currentBiddingRound = null;

            //store and return all bidding round details
            var allBiddingRounds = [
                // {
                //     bidding_round_no: 1,
                //     card: {},
                //     closed_round: {
                //         is_current: true,
                //         highest_bidder: {}
                //     },
                //     open_round: {
                //         is_current: false,
                //         winner: {}
                //     },
                //     is_current: true
                // }
            ];

            function isRoundExists(round, user) {

                return angular.forEach(user.user_bid_values, function (bid_value) {
                    if (bid_value.round === round.bidding_round_no)
                        return true;
                })

            }

            all_functions = {
                Bidding: {
                    StartBidding: function (round, round_type, current_card, all_users) {

                        console.log('$$$$$$$$$$$$$$$$$$$$$ card ', round, round_type, current_card, all_users, isRoundExists(round, all_users[0]));

                        var bidding_range = parseFloat(current_card.default_bid);

                        var count = 0;
                        angular.forEach(all_users, function (user) {

                            if (user.user_type === 'SysUser' && user.userBiddingAbility === USER_BIDDING_ABILITY.NOT_TERMINATED) {

                                // var x = (3 * count);
                                var random = (Math.floor(Math.random() * 20) + (bidding_range - 10));

                                if (user.user_bid_values != null && Array.isArray(user.user_bid_values) && user.user_bid_values.length > 0 && round_type === BIDDING_ROUNDS.BIDDING_ROUND_OPEN && isRoundExists(round, user) && isRoundExists(round, user) != null) {
                                    var __round = isRoundExists(round, user);
                                    __round.closed_round_value = ((round_type === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED) ? random : 0.00);
                                    __round.closed_round_value = ((round_type === BIDDING_ROUNDS.BIDDING_ROUND_OPEN) ? random : 0.00);
                                } else {

                                    //set system users random bid value
                                    user.user_bid_values.push({
                                        round: round,
                                        card: current_card,
                                        closed_round_value: ((round_type === BIDDING_ROUNDS.BIDDING_ROUND_CLOSED) ? random : 0.00),
                                        open_round_value: ((round_type === BIDDING_ROUNDS.BIDDING_ROUND_OPEN) ? random : 0.00),
                                        win: 0
                                    });
                                }
                            }

                            count++;

                        });

                    }
                },
                bidRounds: {
                    openRound: function (card, remaining_users) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds))
                            return null;

                        if (currentBiddingRound === null || !angular.isDefined(currentBiddingRound) && allBiddingRounds.length > 0)
                            currentBiddingRound = allBiddingRounds[0];

                        //reset iscurrent flag for all other rounds
                        angular.forEach(allBiddingRounds, function (round__) {
                            round__.is_current = false;
                        })

                        var round = {
                            bidding_round_no: allBiddingRounds.length + 1,
                            card: card,
                            closed_round: {
                                highest_bidder: {}
                            },
                            open_round: {
                                winner: {}
                            },
                            is_current: true,
                            remaining_users: remaining_users
                        };

                        currentBiddingRound = round;

                        //add new bidding round to the all rounds array
                        allBiddingRounds.push(currentBiddingRound);

                        return currentBiddingRound;

                    },
                    getAllRounds: function () {
                        return allBiddingRounds;
                    },
                    setClosedRoundHighestBidder: function (user, round_id) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length === 0)
                            return;

                        angular.forEach(allBiddingRounds, function (round__) {
                            if (round__.bidding_round_no === round_id)
                                round__.closed_round.highest_bidder = user;
                        })
                    },
                    setOpenRoundWinner: function (user, round_id) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length === 0)
                            return;

                        angular.forEach(allBiddingRounds, function (round__) {
                            if (round__.bidding_round_no === round_id)
                                round__.open_round.winner = user;
                        })
                    },
                    setClosedRoundTerminations: function (user_id) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length === 0)
                            return;

                        angular.forEach(CommonService.allUsers.getAllUsers(), function (user__) {
                            if (user__.user_id === user_id)
                                user__.userBiddingAbility = USER_BIDDING_ABILITY.TERMINATE_FOR_OPEN_ROUND;
                        })
                    },
                    setPermenantTerminations: function (user_id) {

                        if (allBiddingRounds === null || !angular.isDefined(allBiddingRounds) || !Array.isArray(allBiddingRounds) || allBiddingRounds.length === 0)
                            return;

                        angular.forEach(CommonService.allUsers.getAllUsers(), function (user__) {
                            if (user__.user_id === user_id)
                                user__.userBiddingAbility = USER_BIDDING_ABILITY.TERMINATE_FROM_TOURNAMENT;
                        })
                    }
                }
            };

            return all_functions;

        }]);

})();