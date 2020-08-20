# SuperMock.js
Biblioteca com funções para melhorar o acesso e a legibilidade às funções do karma/jasmine para teste de aplicações utilizando angularJS em testes unitários de forma mais intuitiva.

# Executando o projeto
Clone o projeto e execute os seguintes comandos no terminal, na pasta do projeto baixado:

        npm install
        
        npx karma start

# Instalação

importe o script SuperMock.js antes dos specs no arquivo de configuração karma.conf.js e utilize as funcionalidades.
        
# Funcionalidades providas

**SuperMock**

Variável global que provê as funcionalidades desta biblioteca

**1. SuperMock.mockarBackend()**

Provê um factory angular que emula um backend.

*Exemplo de uso:*
        
        // mockar o backend inteiro usando o SuperMock
        beforeEach(module(function($provide) {
                $provide.factory("BackendService", SuperMock.mockarBackend());
        }));

**2. SuperMock.mockarRespostaBackend()**

Inclui uma resposta de erro ou sucesso para execução posterior durante a execução do teste unitário
        
primeiro parâmetro: nome do serviço backend a ser mockado
segundo parâmetro: response de sucesso ao executar o serviço do backend mockado ou texto com o caminho do arquivo json que contem a resposta de sucesso
terceiro parâmetro: response de erro ao executar o serviço do backend mockado ou texto com o caminho do arquivo json que contem a resposta de erro

*Exemplo de uso:*

        // primeira com um response de sucesso, segunda em diante com erro
        SuperMock.mockarRespostaBackend("login", { execucao: 3, data: { data: [3, 4] } });
        SuperMock.mockarRespostaBackend("login", undefined, { execucao: 3, data: { messages: ["Teste erro 2"] } });

        // primeira com um response de sucesso, segunda em diante com erro
        // Obs: os arquivos são lidos do diretório padrão spec/mocks-api
        SuperMock.mockarRespostaBackend("login", "contas/sucesso.json");
        SuperMock.mockarRespostaBackend("login", undefined, "contas/erro.json");

        // primeira chamada com um response de sucesso, caso o request seja {"teste": 1} . Atenção: informar os 4 parâmetros para obter este comportamento
        // caso request não encontrado, usa a chamada com erro
        SuperMock.mockarRespostaBackend("login", {"teste": 1}, { execucao: 3, data: { data: [3, 4] } }, undefined);
        SuperMock.mockarRespostaBackend("login", undefined, { execucao: 3, data: { messages: ["Teste erro 2"] } });

**Obs1:** Chamadas consecutivas a este método farão com que durante as execuções de testes a este mesmo backend, tenham respostas diferentes, na sequencia em que foi mockado o backend. 

**Obs2:** Caso especifique um response de erro e sucesso ao mesmo tempo, a execução do backend dará erro. Entretanto, se houver um then após o catch de tratamento deste erro, o response de sucesso será executado na recuperação do erro de execução.


**3. SuperMock.verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao()**

Verifica se não há nenhuma promise a ser executada após os testes unitários
        
*Exemplo de uso:*

        afterEach(function() {
                SuperMock.verificarNenhumProcessoAssincronoDoAngularPendenteDeExecucao();
        });
        

**4. SuperMock.executarTodosProcessosAssincronosDoAngular()**
        
Executa todos os processos assíncronos do digest do angular (ex: $timeout, $q, promises)
        
*Exemplo de uso:*

        it("teste promise ou $timeout", inject(function() {
                var promise = new Promise(function(resolve, reject){
                        resolve("sucesso");
                });
                SuperMock.executarTodosProcessosAssincronosDoAngular();
                //
                expect(promise).toBeResolved();
        }));

**5. SuperMock.lerJson(caminhoJson)**
        
Lê o conteúdo de um arquivo json e retorna o objeto. O diretório padrão para busca de arquivos json é spec/mocks-api. Para alterar este diretório, execute a função SuperMock.diretorioJson().

*Exemplo de uso:*

        SuperMock.lerJson("cliente/responseSucesso.json")

**6. SuperMock.diretorioJson(diretorioJson)**
        
Altera o diretório padrão de leitura de arquivos json. O diretório padrão é spec/mocks-api.

*Exemplo de uso:*

        SuperMock.diretorioJson("spec/mocks-api")
