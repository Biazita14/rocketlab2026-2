# RocketLab 2026.2 — repositório base

# 🎬 Rocket Lab - Dashboard de Filmes

Repositório completo para a atividade do RocketLab, contendo a API backend em FastAPI e a interface frontend em React (TypeScript).

---

## 📂 Estrutura do Projeto

```text
.
├── backend/
│   ├── app/
│   │   ├── api/v1/         # Rotas e endpoints da API
│   │   ├── core/           # Configurações e logging
│   │   ├── db/             # Base ORM, engine e sessões
│   │   └── movies/         # Modelos SQLAlchemy do domínio de filmes
│   ├── migrations/         # Ambiente e revisões Alembic
│   └── tests/              # Testes automatizados (pytest)
├── frontend/
│   ├── src/
│   │   ├── componentes/    # Componentes React (MovieList, MovieForm, etc.)
│   │   ├── services/       # Comunicação com a API (movieService.ts)
│   │   └── types/          # Tipagens TypeScript
└── README.md

## Execução

Requer Python 3.11 ou superior.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload
```

A API mínima ficará disponível em `http://localhost:8000`; use
`http://localhost:8000/docs` para a documentação automática. O endpoint
`GET /health` permite conferir se a aplicação iniciou corretamente.

## Banco de dados e migrações

O modelo usa um esquema estrela para o catálogo de filmes:

- dimensões de filmes, gêneros, pessoas, produtoras e resumo de avaliações;
- fato de desempenho financeiro e de engajamento;
- tabelas de associação N:N entre filmes, gêneros, produtoras e pessoas;

O schema corresponde aos nove arquivos CSV atuais da camada Diamond, com a
adição de `movie_reviews`: uma avaliação individual por linha, na escala 0–10.
A tabela aceita diretamente as colunas `sk_movie_review_id`, `sk_movie_id`,
`nome`, `nota` e `comentario` do CSV enviado separadamente. `created_at` é
gerado pelo banco. O contexto generativo não faz parte desta base.

O repositório não inclui CSVs nem rotinas de carga. Para usar avaliações,
importe primeiro os filmes em `dim_movies` e depois o CSV de `movie_reviews`.

As tabelas são criadas exclusivamente pelo Alembic. Para evoluir os modelos,
crie uma revisão e aplique-a:

```bash
cd backend
.venv/bin/alembic revision --autogenerate -m "descreva a alteração"
.venv/bin/alembic upgrade head
```

O banco padrão é SQLite local em `backend/rocketlab.db`. Ajuste
`DATABASE_URL` no arquivo `.env` para usar outro banco compatível.
