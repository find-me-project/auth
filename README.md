<!-- PROJECT LOGO -->
<br />
<p align="center">
  <img src="https://github.com/othneildrew/Best-README-Template/raw/master/images/logo.png" alt="Logo" width="80" height="80">

  <h3 align="center">Find Me - Auth back-end</h3>

  <p align="center">
    Aplicação Node.js
  </p>
</p>

## 💻 Pré-requisitos

1. Node 16+
1. Yarn

## 🚀 Configuração

1. Crie um arquivo `.env` (na raiz do projeto) seguindo o exemplo em `.env.example`
2. Edite os valores das variáveis contidas em seu `.env` de acordo com o que for necessário
3. Instale as dependências do projeto

```sh
# Instalar dependências
yarn install
```

```sh
# Executar aplicação em modo de desenvolvimento
yarn serve
```

```sh
# Build produção
yarn build
```

```sh
# Testes unitários
yarn test
```

⭐ Executando a aplicação via docker:
```sh
docker-compose up --build
```

Obs: Desenvolvi a aplicação utilizando Yarn 3 (PnP), saiba mais sobre clicando [aqui](https://yarnpkg.com/features/pnp)

### ☕ Tecnologias utilizadas

Lista de algumas das tecnologias/pacotes que foram utilizados na aplicação

* [Javascript](https://www.javascript.com/)
* [Typescript](https://www.typescriptlang.org/)
* [express](https://www.npmjs.com/package/express)
* [express-validator](https://www.npmjs.com/package/express-validator)
* [mongoose](https://mongoosejs.com/)
* [lodash](https://www.npmjs.com/package/lodash)
* [date-fns](https://www.npmjs.com/package/date-fns)
* [morgan](https://www.npmjs.com/package/morgan)
* [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
* [jest](https://www.npmjs.com/package/jest)
* [faker-js](https://www.npmjs.com/package/@faker-js/faker)
* [Eslint](https://eslint.org/)
* [husky](https://www.npmjs.com/package/husky)

## 🤝 Contribuições

Siga os passos a baixo para contribuir com alterações e novas funcionalidades para o projeto. Lembrando sempre de seguir as boas práticas de desenvolvimento e os padrões de código definidos pela equipe do projeto. **Nenhum código fora dos padrões ou com erros de lint serão aceitos**.

1. Crie um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas alterações (`git commit -m 'Add some AmazingFeature'`)
4. Faça um Push da sua Branch  (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### ⭐ Padrões de código

Utilizamos o eslint para forçar que os padrões definidos pela equipe de desenvolvimento sejam seguidos e respeitados. Recomenda-se que instale o plugin do eslint em seu IDE de preferência e fique atento aos bons padrões de código.

Saiba mais sobre o eslint [clicando aqui](https://github.com/eslint/eslint)

Outros links que podem ser úteis:

* [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
