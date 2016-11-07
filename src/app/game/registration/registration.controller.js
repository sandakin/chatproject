(function () {
    'use strict';

    angular
        .module('app.game')
        .config(function ($mdThemingProvider) {
            $mdThemingProvider.theme('registration-dark-grey').backgroundPalette('grey').dark();
        })
        .controller('RegistrationController', RegistrationController);

    /* @ngInject */
    function RegistrationController($scope, $state, $location, $timeout, $cookies, api, ToastService, CommonService) {
        var vm = this;

        vm.moveToNext = moveToNext;

        vm.sex = 'Male';
        vm.hypertension = 'No';
        vm.insulin = 'No';
        vm.noninsulin = 'No';
        vm.asthma = 'No';
        vm.epilepsy = 'No';
        vm.anaemia = 'No';
        vm.renal = 'No';
        vm.cardiac = 'No';
        vm.accident = 'No';
        vm.mentalhealth = 'No';
        vm.gastro = 'No';
        vm.skin = 'No';
        vm.cancer = 'No';
        vm.other = 'No';

        vm.mobility = 'I have no problems in walking around';
        vm.personal = 'I have no problems with personal care';
        vm.activities = 'I have no problems with performing my usual activities';
        vm.pain = 'I have no pain or discomfort';
        vm.anxiety = 'I am not anxious or depressed';

        vm.zipocde = '';
        vm.dob = '';

        $scope.slider = {
            value: 0,
            options: {
                floor: 0,
                ceil: 100,
                step: 5,
                vertical: true,
                precision: 1,
                showSelectionBar: true,
                showTicksValues: true,
                readOnly: false,
            }
        };

        $timeout(function () {
            $scope.$broadcast('rzSliderForceRender');
        });

        function moveToNext() {
            // $state.go('triangular.admin-default-no-scroll.game-splash');
            $state.go('triangular.admin-default-no-scroll.game-cards');
        }

        $scope.Restart = function () {
            // $location.path('/help');
        };

        vm.step1 = false;
        vm.step2 = true;
        vm.step3 = true;
        vm.step4 = true;
        vm.step5 = true;

        $scope.manageTabs = function (current_step) {
            if (current_step == 1) {
                vm.step1 = false;
                vm.step2 = false;
                vm.step3 = true;
                vm.step4 = true;
                vm.step5 = true;
            }

            else if (current_step == 2) {
                vm.step1 = false;
                vm.step2 = false;
                vm.step3 = false;
                vm.step4 = true;
                vm.step5 = true;
            }

            else if (current_step == 3) {
                vm.step1 = false;
                vm.step2 = false;
                vm.step3 = false;
                vm.step4 = false;
                vm.step5 = true;
            }

            else if (current_step == 4) {
                vm.step1 = true;
                vm.step2 = true;
                vm.step3 = true;
                vm.step4 = true;
                vm.step5 = false;
            }
        };

        $scope.saveDetails = function () {
            ToastService.showToast('Registered user successfully');
            // var ng = new (api.participant())();

            // ng.health = $scope.slider.value;
            // ng.sex = vm.sex;
            // ng.hypertension = vm.hypertension;
            // ng.insulin = vm.insulin;
            // ng.noninsulin = vm.noninsulin;
            // ng.asthma = vm.asthma;
            // ng.epilepsy = vm.epilepsy;
            // ng.anaemia = vm.anaemia;
            // ng.renal = vm.renal;
            // ng.cardiac = vm.cardiac;
            // ng.accident = vm.accident;
            // ng.mentalhealth = vm.mentalhealth;
            // ng.gastro = vm.gastro;
            // ng.skin = vm.skin;
            // ng.cancer = vm.cancer;
            // ng.other = vm.other;

            // ng.mobility = vm.mobility;
            // ng.personal = vm.personal;
            // ng.activities = vm.activities;
            // ng.pain = vm.pain;
            // ng.anxiety = vm.anxiety;

            // ng.zipocde = vm.zipocde;
            // ng.dob = (vm.dob).getFullYear() + "-" + ((vm.dob).getMonth() + 1) + "-" + (vm.dob).getDate();

            // ng.$save().then(function (data) {
            //     console.log('##########################', data);
            $cookies.put('user', 12);
            vm.message = 'Thank You for Joining With Us';
            vm.canProceed = true;
            //     ToastService.showToast('Registered user successfully');
            //     // $state.go('triangular.admin-default-no-scroll.game-loading');
            // }, function () {
            //     vm.message = 'Sorry We Can Not Register You';
            //     vm.canProceed = false;
            //     ToastService.showToast('Failed to register user');
            // })
        };
    }
})();