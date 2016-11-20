(function() {
    'use strict';

    angular
        .module('app.game')
        .config(function($mdThemingProvider) {
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

        $timeout(function() {
            $scope.$broadcast('rzSliderForceRender');
        });

        function moveToNext() {
            // $state.go('triangular.admin-default-no-scroll.game-splash');
            $state.go('triangular.admin-default-no-scroll.game-cards');
        }

        $scope.Restart = function() {
            // $location.path('/help');
        };

        vm.step1 = false;
        vm.step2 = true;
        vm.step3 = true;
        vm.step4 = true;
        vm.step5 = true;

        $scope.manageTabs = function(current_step) {
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

        $scope.saveDetails = function() {
            ToastService.showToast('Registered user successfully');
            var ng = new (api.participant())();

            ng.health = $scope.slider.value;
            ng.sex = vm.sex;
            ng.hypertension = vm.hypertension;
            ng.insulin = vm.insulin;
            ng.noninsulin = vm.noninsulin;
            ng.asthma = vm.asthma;
            ng.epilepsy = vm.epilepsy;
            ng.anaemia = vm.anaemia;
            ng.renal = vm.renal;
            ng.cardiac = vm.cardiac;
            ng.accident = vm.accident;
            ng.mentalhealth = vm.mentalhealth;
            ng.gastro = vm.gastro;
            ng.skin = vm.skin;
            ng.cancer = vm.cancer;
            ng.other = vm.other;

            ng.mobility = vm.mobility;
            ng.personal = vm.personal;
            ng.activities = vm.activities;
            ng.pain = vm.pain;
            ng.anxiety = vm.anxiety;

            ng.zipocde = vm.zipocde;
            ng.dob = (vm.dob).getFullYear() + "-" + ((vm.dob).getMonth() + 1) + "-" + (vm.dob).getDate();

            ng.$save().then(function(data) {
                console.log('##########################', data);
                $cookies.put('user', data.id);
                vm.message = 'Thank You for Joining With Us';
                vm.canProceed = true;
                ToastService.showToast('Registered user successfully');

                //set real user data object in common service
                CommonService.allUsers.setRealUserData(data);

                // $state.go('triangular.admin-default-no-scroll.game-loading');
            }, function() {
                vm.message = 'Sorry We Can Not Register You';
                vm.canProceed = false;
                ToastService.showToast('Failed to register user');
            })
        };






        //congradgulations message data----------------------------------------------
        var ctx = canvas.getContext("2d");
        var w = document.body.clientWidth;
        var h = document.body.clientHeight;
        canvas.width = w;
        canvas.height = h;

        var nodes = [];


        function draw() {
            requestAnimationFrame(draw);

            ctx.globalCompositeOperation = "destination-out";
            ctx.fillStyle = "rgba(0, 0, 0, .08)";
            ctx.fillRect(0, 0, w, h);

            ctx.globalCompositeOperation = "lighter";

            var l = nodes.length, node;
            while (l--) {
                node = nodes[l];
                drawNode(node);
                if (node.dead) {
                    nodes.splice(l, 1);
                }
            }

            if (nodes.length < 10) {
                l = rand(4, 1) | 0;
                while (l--) {
                    nodes.push(makeNode(
                        Math.random() * w | 0,
                        Math.random() * h | 0,
                        40,
                        "hsl(" + (rand(300, 0) | 0) + ", 100%, 50%)",
                        100
                    ));
                }
            }
        }

        function drawNode(node) {

            var l = node.children.length, point;
            while (l--) {
                point = node.children[l];
                ctx.beginPath();
                ctx.fillStyle = point.color;
                ctx.arc(point.x, point.y, 1, 0, PI2);
                ctx.fill();
                ctx.closePath();
                updatePoint(point);
                if (point.dead) {
                    node.children.splice(l, 1);
                    if (node.count > 20) {
                        nodes.push(makeNode(
                            point.x,
                            point.y,
                            node.radius * 10,
                            node.color,
                            (node.count / 10) | 0
                        ))
                    }
                }
            }
            if (!node.children.length) {
                node.dead = true;
            }
        }

        function updatePoint(point) {
            var dx = point.x - point.dx;
            var dy = point.y - point.dy;
            var c = Math.sqrt(dx * dx + dy * dy);
            point.dead = c < 1;
            point.x -= dx * point.velocity;
            point.y -= dy * point.velocity;
        }

        const rad = Math.PI / 180;
        const PI2 = Math.PI * 2;
        var ttt = 0;

        function rand(max, min) {
            min = min || 0;
            return Math.random() * (max - min) + min;
        }

        function makeNode(x, y, radius, color, partCount) {

            radius = radius || 0;
            partCount = partCount || 0;
            var count = partCount;

            var children = [], kof, r;


            while (partCount--) {
                kof = 100 * Math.random() | 0;
                r = radius * Math.random() | 0;
                children.push({
                    x: x,
                    y: y,
                    dx: x + r * Math.cos(ttt * kof * rad),
                    dy: y + r * Math.sin(ttt * kof * rad),
                    color: color,
                    velocity: rand(1, 0.05)
                });
                ttt++
            }

            return {
                radius: radius,
                count: count,
                color: color,
                x: x,
                y: y,
                children: children
            }
        }
        //start fire works
        draw();
        //congradgulations message data----------------------------------------------
    }
})();