import csv
import os
import asyncio
from datetime import datetime
from app.db.session import AsyncSessionLocal
from app.movies.models import (
    DimMovie,
    DimGenre,
    DimCompany,
    DimPerson,
    FactMoviePerformance,
    MovieReview,
    DimReview,
    bridge_movie_genre,
    bridge_movie_company,
    bridge_movie_person,
)

async def run_seed():
    async with AsyncSessionLocal() as db:
        data_dir = os.path.join(os.path.dirname(__file__), "data")
        print("Iniciando a carga assíncrona otimizada (bulk insert)...")

        try:
            async def bulk_insert(table, data_list):
                if data_list:
                    await db.execute(table.insert().prefix_with("OR IGNORE"), data_list)
                    await db.commit()

            # ==========================================
            # BLOCO 1: TABELAS DE DIMENSÃO (DIM_*)
            # ==========================================

            # --- 1. GÉNEROS ---
            path = os.path.join(data_dir, "dim_genres.csv")
            if os.path.exists(path):
                print("Importando dim_genres...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = list(csv.DictReader(f))
                await bulk_insert(DimGenre.__table__, data)

            # --- 2. PESSOAS ---
            path = os.path.join(data_dir, "dim_people.csv")
            if os.path.exists(path):
                print("Importando dim_people...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = list(csv.DictReader(f))
                await bulk_insert(DimPerson.__table__, data)

            # --- 3. PRODUTORAS ---
            path = os.path.join(data_dir, "dim_companies.csv")
            if os.path.exists(path):
                print("Importando dim_companies...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = list(csv.DictReader(f))
                await bulk_insert(DimCompany.__table__, data)

            # --- 4. FILMES ---
            path = os.path.join(data_dir, "dim_movies.csv")
            if os.path.exists(path):
                print("Importando dim_movies...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = []
                    for row in csv.DictReader(f):
                        if row.get('data_lancamento'):
                            try:
                                row['data_lancamento'] = datetime.strptime(row['data_lancamento'], '%Y-%m-%d').date()
                            except ValueError:
                                row['data_lancamento'] = None
                        data.append(row)
                await bulk_insert(DimMovie.__table__, data)

            # --- 5. DIM REVIEWS (Resumo de Avaliações) ---
            path = os.path.join(data_dir, "dim_reviews.csv")
            if os.path.exists(path):
                print("Importando dim_reviews...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = []
                    for row in csv.DictReader(f):
                        cleaned_row = {}
                        for key, value in row.items():
                            if value == '' or value is None:
                                cleaned_row[key] = None
                            elif key in ['nota_media_usuarios', 'qtd_avaliacoes_usuarios']:
                                try:
                                    cleaned_row[key] = float(value) if '.' in value else int(value)
                                except ValueError:
                                    cleaned_row[key] = None
                            else:
                                cleaned_row[key] = value
                        data.append(cleaned_row)
                await bulk_insert(DimReview.__table__, data)

            # ==========================================
            # BLOCO 2: TABELAS DE ASSOCIAÇÃO (BRIDGES)
            # ==========================================
            for bridge_file, bridge_table in [
                ("bridge_movie_genre.csv", bridge_movie_genre),
                ("bridge_movie_company.csv", bridge_movie_company),
                ("bridge_movie_person.csv", bridge_movie_person)
            ]:
                path = os.path.join(data_dir, bridge_file)
                if os.path.exists(path):
                    print(f"Importando {bridge_file}...")
                    with open(path, mode="r", encoding="utf-8") as f:
                        data = list(csv.DictReader(f))
                    await bulk_insert(bridge_table, data)

            # ==========================================
            # BLOCO 3: TABELAS DE FACTOS E TRANSAÇÕES
            # ==========================================

            # --- 7. PERFORMANCE ---
            path = os.path.join(data_dir, "fact_movies_performance.csv")
            if os.path.exists(path):
                print("Importando fact_movies_performance...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = []
                    for row in csv.DictReader(f):
                        cleaned_row = {}
                        for key, value in row.items():
                            if value == '' or value is None:
                                cleaned_row[key] = None
                            elif key in ['orcamento_usd', 'receita_usd', 'lucro_usd', 'orcamento_brl', 'receita_brl', 'lucro_brl', 'popularidade', 'nota_tmdb', 'qtd_tmdb', 'nota_imdb', 'qtd_imdb']:
                                try:
                                    cleaned_row[key] = float(value)
                                except ValueError:
                                    cleaned_row[key] = None
                            else:
                                cleaned_row[key] = value
                        data.append(cleaned_row)
                await bulk_insert(FactMoviePerformance.__table__, data)

            # --- 8. MOVIE REVIEWS (Avaliações Individuais) ---
            path = os.path.join(data_dir, "movies_reviews.csv")
            if os.path.exists(path):
                print("Importando movies_reviews...")
                with open(path, mode="r", encoding="utf-8") as f:
                    data = []
                    for row in csv.DictReader(f):
                        data.append({
                            "sk_movie_id": row.get('sk_movie_id'),
                            "nome": row.get('nome'),
                            "nota": float(row.get('nota')) if row.get('nota') else 0.0,
                            "comentario": row.get('comentario')
                        })
                await bulk_insert(MovieReview.__table__, data)

            print("Seed assíncrono otimizado concluído com sucesso!")

        except Exception as e:
            await db.rollback()
            print(f"Erro durante a importação: {e}")

if __name__ == "__main__":
    asyncio.run(run_seed())