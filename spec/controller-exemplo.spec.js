describe("teste", function() {

    'use strict';

    var ctrl;

    // importar o módulo que tem o controller a ser testado
    beforeEach(module("controller-exemplos"));

    // mockar o backend inteiro usando o SuperMock
    beforeEach(module(function($provide) {
        // mock do BackendService
        $provide.factory("BackendService", SuperMock.mockarBackend());
        // mock do $scope
        $provide.factory("$scope", SuperMock.mockar$Scope(function() { return ctrl; }));
    }));

    // criar controller
    beforeEach(inject(function(_$controller_) {
        ctrl = _$controller_("controllerExemplo");
    }));

    afterEach(function() {
        SuperMock.verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao();
    });

    it("teste de execução com todas as chamadas dando sucesso", inject(function() {

        // todas execuções retornam o mesmo response de sucesso
        // primeiro parametro é o nome do backend mockado
        // segundo parâmetro resposta de sucesso
        // terceiro parâmetro erro de execução
        // Obs 1: chamando o método várias vezes para uma mesma transação 
        // fará com que as respostas consecutivas sejam acumuladas para serem chamadas 
        // na sequência de execução
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_1_2);
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_3_4);
        SuperMock.mockarRespostaBackend("acessos", Api.acessos_SUCESSO_5_6);

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                Api.contas_SUCESSO_1_2,
                Api.contas_SUCESSO_1_2,
                Api.login_SUCESSO_3_4,
                Api.login_SUCESSO_3_4,
                Api.contas_SUCESSO_1_2,
                Api.contas_SUCESSO_1_2,
                Api.contas_SUCESSO_1_2,
                Api.contas_SUCESSO_1_2,
                Api.login_SUCESSO_3_4,
                Api.login_SUCESSO_3_4,
                Api.acessos_SUCESSO_5_6
            ]
        );

    }));

    it("teste de execução com todas as chamadas dando erro", inject(function() {

        // todas execuções com erro
        // primeiro parametro é o nome do backend mockado
        // segundo parâmetro resposta de sucesso
        // terceiro parâmetro erro de execução
        // Obs 1: chamando o método várias vezes para uma mesma transação 
        // fará com que as respostas consecutivas sejam acumuladas para serem chamadas 
        // na sequência de execução
        SuperMock.mockarRespostaBackend("contas", undefined, Api.contas_TESTE_ERRO_1);
        SuperMock.mockarRespostaBackend("login", undefined, Api.login_TESTE_ERRO_2);
        SuperMock.mockarRespostaBackend("acessos", undefined, Api.acessos_TESTE_ERRO_3);

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                Api.contas_TESTE_ERRO_1,
                undefined,
                Api.contas_TESTE_ERRO_1,
                Api.login_TESTE_ERRO_2,
                Api.login_TESTE_ERRO_2,
                Api.acessos_TESTE_ERRO_3
            ]
        );

    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // primeira, segunda e terceira com responses de sucessos diferentes, quarta em diante dará erro
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_1_2);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_2_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_3_4);
        SuperMock.mockarRespostaBackend("contas", undefined, Api.contas_TESTE_ERRO_1);

        // primeira com um response de sucesso, segunda em diante com erro
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_3_4);
        SuperMock.mockarRespostaBackend("login", undefined, Api.login_TESTE_ERRO_2);

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, Api.acessos_TESTE_ERRO_3);

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                Api.contas_SUCESSO_1_2,
                Api.contas_SUCESSO_2_1,
                Api.login_SUCESSO_3_4,
                Api.login_TESTE_ERRO_2,
                undefined,
                Api.contas_SUCESSO_3_4,
                Api.contas_TESTE_ERRO_1,
                Api.login_TESTE_ERRO_2,
                Api.login_TESTE_ERRO_2,
                Api.acessos_TESTE_ERRO_3
            ]
        );

    }));

    it("teste de execução com request padrão e request específico", inject(function() {

        // ao informar 4 parâmetros: 
        // o primeiro é o nome do serviço
        // o segundo é o request solicitado
        // o terceiro é o response de sucesso
        // o quarto é o response de erro
        // chamada com um request específico dá uma resposta e com qualquer outro, outra resposta
        SuperMock.mockarRespostaBackend("contas", { "teste": 1 }, Api.contas_SUCESSO_1_1, undefined);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_1_2, undefined);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_2_1, undefined);

        // primeira com um response de sucesso, segunda com erro, terceira e quarta com response de sucessos diferentes
        // da quarta em diante, com o mesmo response de sucesso da quarta chamada
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_9_1);

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, Api.acessos_TESTE_ERRO_3);

        ctrl.testarExecucaoBackend();
        console.log(JSON.stringify(ctrl.retornosBackend));

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                Api.contas_SUCESSO_1_1,
                Api.contas_SUCESSO_1_2,
                Api.login_SUCESSO_9_1,
                Api.login_SUCESSO_9_1,
                Api.contas_SUCESSO_2_1,
                Api.contas_SUCESSO_2_1,
                Api.contas_SUCESSO_2_1,
                Api.contas_SUCESSO_2_1,
                Api.login_SUCESSO_9_1,
                Api.login_SUCESSO_9_1,
                Api.acessos_TESTE_ERRO_3
            ]
        );

    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // todas as respostas até a sexta chamada serão com sucessos diferentes, após a sexta chamadas, todos response e sucesso iguais
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_1_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_2_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_3_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_4_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_5_1);
        SuperMock.mockarRespostaBackend("contas", Api.contas_SUCESSO_6_1);

        // primeira com um response de sucesso, segunda com erro, terceira e quarta com response de sucessos diferentes
        // da quarta em diante, com o mesmo response de sucesso da quarta chamada
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_9_1);
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_10_1, Api.login_TESTE_ERRO_2);
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_11_1);
        SuperMock.mockarRespostaBackend("login", Api.login_SUCESSO_12_1);

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, Api.acessos_TESTE_ERRO_3);

        ctrl.testarExecucaoBackend();
        console.log(JSON.stringify(ctrl.retornosBackend));

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                Api.contas_SUCESSO_1_1,
                Api.contas_SUCESSO_2_1,
                Api.login_SUCESSO_9_1,
                Api.login_TESTE_ERRO_2,
                undefined,
                Api.contas_SUCESSO_3_1,
                Api.login_SUCESSO_11_1,
                Api.login_SUCESSO_12_1,
                Api.acessos_TESTE_ERRO_3
            ]
        );

    }));

    it("teste evento $broadcast", inject(function(_$scope_) {

        ctrl.onInit();
        _$scope_.$parent.$broadcast("eventoGenerico", "dadoEventoGenerico");

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();
        expect(ctrl.eventoGenerico).toEqual("dadoEventoGenerico");
    }));

});