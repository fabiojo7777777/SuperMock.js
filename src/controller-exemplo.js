(function() {

    'use strict';

    var aplicacao = angular.module("controller-exemplos", []);

    aplicacao.controller("controllerExemplo", controllerExemplo);

    controllerExemplo.$inject = ["$timeout", "$rootScope", "BackendService", "$scope"];

    function controllerExemplo($timeout, $rootScope, BackendService, $scope) {
        var vm = this;
        vm.testarExecucaoBackend = testarExecucaoBackend;
        vm.retornosBackend = [];
        vm.onInit = onInit;

        function onInit() {
            $scope.$on("eventoGenerico", function(evt, arg) {
                vm.eventoGenerico = arg;
            });
        }

        function testarExecucaoBackend() {
            $rootScope.messages = [];
            BackendService.contas({ "teste": 1 })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 1: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 2: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.login({});
                })
                .then(function(response) {
                    console.log("SUCESSO LOGIN 1: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.login({});
                })
                .then(function(response) {
                    console.log("SUCESSO LOGIN 2: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 3: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 4: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                // TESTANDO O THEN APÓS UM CATCH
                .catch(function(error) {
                    console.log("ERRO 1: " + JSON.stringify(error));
                    vm.retornosBackend.push(error);
                    $timeout(function() {
                        $rootScope.messages.push(error.erro);
                    }, 1000);
                })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 6: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                .then(function(response) {
                    console.log("SUCESSO CONTAS 7: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                    return BackendService.contas({});
                })
                .catch(function(error) {
                    console.log("ERRO 2: " + JSON.stringify(error));
                    vm.retornosBackend.push(error);
                    $timeout(function() {
                        $rootScope.messages.push(error.erro);
                    }, 1000);
                })
                .then(function(response) {
                    return BackendService.login({});
                })
                .then(function(response) {
                    console.log("SUCESSO LOGIN 3: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                })
                .catch(function(error) {
                    console.log("ERRO LOGIN 3: " + JSON.stringify(error));
                    vm.retornosBackend.push(error);
                    $timeout(function() {
                        $rootScope.messages.push(error.erro);
                    }, 1000);
                })
                .then(function(response) {
                    return BackendService.login({});
                })
                .then(function(response) {
                    console.log("SUCESSO LOGIN 4: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                })
                .catch(function(error) {
                    console.log("ERRO LOGIN 4: " + JSON.stringify(error));
                    vm.retornosBackend.push(error);
                    $timeout(function() {
                        $rootScope.messages.push(error.erro);
                    }, 1000);
                })
                .then(function(response) {
                    return BackendService.acessos({});
                })
                .then(function(response) {
                    console.log("SUCESSO ACESSOS 1: " + JSON.stringify(response));
                    vm.retornosBackend.push(response);
                })
                .catch(function(error) {
                    console.log("ERRO ACESSOS 1: " + JSON.stringify(error));
                    vm.retornosBackend.push(error);
                    $timeout(function() {
                        $rootScope.messages.push(error.erro);
                    }, 1000);
                });
        }

    }

})();