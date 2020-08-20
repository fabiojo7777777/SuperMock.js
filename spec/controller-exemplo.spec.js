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
        // diretório para buscar arquivos .json. O diretório padrão é "spec/mocks-api"
        // SuperMock.diretorioJson("spec/mocks-api");
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
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_1_2.json");
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_3_4.json");
        SuperMock.mockarRespostaBackend("acessos", "acessos/SUCESSO_5_6.json");

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("login/SUCESSO_3_4.json"),
                SuperMock.lerJson("login/SUCESSO_3_4.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("login/SUCESSO_3_4.json"),
                SuperMock.lerJson("login/SUCESSO_3_4.json"),
                SuperMock.lerJson("acessos/SUCESSO_5_6.json")
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
        SuperMock.mockarRespostaBackend("contas", undefined, "contas/TESTE_ERRO_1.json");
        SuperMock.mockarRespostaBackend("login", undefined, "login/TESTE_ERRO_2.json");
        SuperMock.mockarRespostaBackend("acessos", undefined, "acessos/TESTE_ERRO_3.json");

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                SuperMock.lerJson("contas/TESTE_ERRO_1.json"),
                undefined,
                SuperMock.lerJson("contas/TESTE_ERRO_1.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                SuperMock.lerJson("acessos/TESTE_ERRO_3.json")
            ]
        );

    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // primeira, segunda e terceira com responses de sucessos diferentes, quarta em diante dará erro
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_1_2.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_2_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_3_4.json");
        SuperMock.mockarRespostaBackend("contas", undefined, "contas/TESTE_ERRO_1.json");

        // primeira com um response de sucesso, segunda em diante com erro
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_3_4.json");
        SuperMock.mockarRespostaBackend("login", undefined, "login/TESTE_ERRO_2.json");

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, "acessos/TESTE_ERRO_3.json");

        ctrl.testarExecucaoBackend();

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("login/SUCESSO_3_4.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                undefined,
                SuperMock.lerJson("contas/SUCESSO_3_4.json"),
                SuperMock.lerJson("contas/TESTE_ERRO_1.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                SuperMock.lerJson("acessos/TESTE_ERRO_3.json")
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
        SuperMock.mockarRespostaBackend("contas", { "teste": 1 }, "contas/SUCESSO_1_1.json", undefined);
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_1_2.json", undefined);
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_2_1.json", undefined);

        // primeira com um response de sucesso, segunda com erro, terceira e quarta com response de sucessos diferentes
        // da quarta em diante, com o mesmo response de sucesso da quarta chamada
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_9_1.json");

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, "acessos/TESTE_ERRO_3.json");

        ctrl.testarExecucaoBackend();
        console.log(JSON.stringify(ctrl.retornosBackend));

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                SuperMock.lerJson("contas/SUCESSO_1_1.json"),
                SuperMock.lerJson("contas/SUCESSO_1_2.json"),
                SuperMock.lerJson("login/SUCESSO_9_1.json"),
                SuperMock.lerJson("login/SUCESSO_9_1.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("login/SUCESSO_9_1.json"),
                SuperMock.lerJson("login/SUCESSO_9_1.json"),
                SuperMock.lerJson("acessos/TESTE_ERRO_3.json")
            ]
        );

    }));

    it("teste de execução com sucessos consecutivos diferentes e erro após um certo número de chamadas", inject(function() {

        // todas as respostas até a sexta chamada serão com sucessos diferentes, após a sexta chamadas, todos response e sucesso iguais
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_1_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_2_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_3_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_4_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_5_1.json");
        SuperMock.mockarRespostaBackend("contas", "contas/SUCESSO_6_1.json");

        // primeira com um response de sucesso, segunda com erro, terceira e quarta com response de sucessos diferentes
        // da quarta em diante, com o mesmo response de sucesso da quarta chamada
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_9_1.json");
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_10_1.json", "login/TESTE_ERRO_2.json");
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_11_1.json");
        SuperMock.mockarRespostaBackend("login", "login/SUCESSO_12_1.json");

        // sempre dará erro
        SuperMock.mockarRespostaBackend("acessos", undefined, "acessos/TESTE_ERRO_3.json");

        ctrl.testarExecucaoBackend();
        console.log(JSON.stringify(ctrl.retornosBackend));

        // para garantir que todas as promises e timeouts foram executados:
        SuperMock.executarTodosProcessosAssincronosDoAngular();

        expect(ctrl.retornosBackend).toEqual(
            [
                SuperMock.lerJson("contas/SUCESSO_1_1.json"),
                SuperMock.lerJson("contas/SUCESSO_2_1.json"),
                SuperMock.lerJson("login/SUCESSO_9_1.json"),
                SuperMock.lerJson("login/TESTE_ERRO_2.json"),
                undefined,
                SuperMock.lerJson("contas/SUCESSO_3_1.json"),
                SuperMock.lerJson("login/SUCESSO_11_1.json"),
                SuperMock.lerJson("login/SUCESSO_12_1.json"),
                SuperMock.lerJson("acessos/TESTE_ERRO_3.json")
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