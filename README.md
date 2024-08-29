# GEMINI TEST

Este projeto é uma API construída em Node.js que utiliza a API Gemini para ler imagens em base64 de medidores de água e gás (individualmente), extrair o valor consumido e fornecer uma interface para armazenamento e consulta dessas informações. A aplicação é containerizada usando Docker.


## Estrutura do Projeto
```bash
│── src
│  ├── configs
│  │   ├── database.ts            # Configuração do banco de dados (Mongoose)
│  │   └── google.ts              # Configuração da API do Google (Gemini)
│  ├── controllers
│  │   └── measure-controller.ts  # Controladores para chamadas das rotas
│  ├── formatters
│  │   └── measure-formatter.ts   # Formatadores para respostas de requisições
│  ├── middlewares
│  │   └── measure-middleware.ts  # Middlewares para validação e processamento
│  ├── models
│  │   └── measure-model.ts       # Modelos de dados (Mongoose)
│  ├── routes
│  │   └── measure-route.ts       # Definição de rotas para a API
│  ├── services
│  │   └── measure-service.ts     # Lógica de negócio e integração com Gemini
│  ├── uploads               # Diretório para armazenamento das imagens para geração das urls
│  ├── utils
│  │   ├── gemini.ts              # Utilitário para interagir com a API Gemini
│  │   ├── logger.ts              # Configuração do logger (Winston)
│  │   └── url-image.ts           # Geração de URLs temporárias para imagens
│  └── index.ts                   # Ponto de entrada principal da aplicação
│── Dockerfile             # Configuração do Docker refente ao Nodejs
│── docker-compose.yml     # Configuração do Docker Compose
│── README.md              # Documentação do projeto
```

## Pré-requisitos
- Node.js v18 ou superior
- Docker e Docker Compose
- Yarn (opcional, para gerenciamento de pacotes)
- Chave de API para o serviço Google Gemini


## Instalação
```bash
# Clone o repositório
git clone git@github.com:Otooo/gemini.git

# Navegue até o diretório do projeto
cd gemini

# Configure as variáveis de ambiente
cp .env-example .env
# Edite o arquivo .env com suas configurações específicas

# Execute a aplicação usando Docker Compose
docker compose up -d
```

## Configuração e uso do DOCKER
- Para construir e rodar os contêineres
```docker compose up --build```

- Para reiniciar os containers
```docker compose restart```

- Para acessar os logs
```docker logs -f <container_name>```


## Uso  
  * O endereço padrão para o uso da API: `http://localhost:80/`  
  * Você pode acessar, pelo navegador, o seguinte endereço para verificar se o servidor está ativo `http://localhost:80/check`  
  * Seguem os endpoints principais da API:  
    - POST /upload -> Responsável por receber uma imagem em base 64, consultar o Gemini e retornar a medida lida pela API.  
        ````
        Request Body
          {
            "image": "base64",
            "customer_code": "string",
            "measure_datetime": "datetime",
            "measure_type": "WATER" ou "GAS"
          }
            
    -	PATCH /confirm -> Responsável por confirmar ou corrigir o valor lido pelo LLM.
        ````
        Request Body
          {
            "measure_uuid": "string",
            "confirmed_value": integer
          }

    - GET /\<customer code\>/list (com opção da query parameter "measure_type") -> Responsável por listar as medidas realizadas por um determinado cliente  
      ````
      Ex1.: http://localhost:80/1234/list
      Ex2.: http://localhost:80/1234/list?measure_type=WATER
      Ex3.: http://localhost:80/1234/list?measure_type=GAS

  * As respostas de todas as requisições seguem o formado JSON com os seguintes "status code":
    - 200: Operação realizada com sucesso
    - 400: Parâmetro(s) da requisição inválido(s)
    - 404: Leitura não encontrada (PATCH, GET)
    - 409: Leitura já existente (POST) ou Leitura já confirmada (PATCH)
    - 500: Erro no servidor  