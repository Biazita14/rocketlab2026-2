from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import uuid


from app.db.session import get_db
from app.movies.models import DimMovie, MovieReview, FactMoviePerformance
from app.movies.schemas import (
    MovieResponseSchema, 
    MovieReviewSchema, 
    FactMoviePerformanceSchema,
    MovieCreateSchema
    
)

router = APIRouter()

@router.get("/")
async def list_movies(skip: int = 0, limit: int = 2000, db: AsyncSession = Depends(get_db)):
    """Lista os filmes com paginação e serializa as relações com segurança."""
    query = (
        select(DimMovie)
        .options(selectinload(DimMovie.genres), selectinload(DimMovie.companies))
        .order_by(DimMovie.titulo.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    movies = result.scalars().all()
    
    movie_list = []
    for m in movies:
        genres_list = [{"sk_genre_id": g.sk_genre_id, "nome_genero": g.nome_genero} for g in (m.genres or [])]
        companies_list = [{"sk_company_id": getattr(c, 'sk_company_id', None), "nome_company": getattr(c, 'nome_company', '')} for c in (m.companies or [])]

        movie_list.append({
            "id": m.sk_movie_id or m.id_filme,  # <-- ADICIONADO AQUI PARA O FRONTEND RECONHECER
            "sk_movie_id": m.sk_movie_id or m.id_filme,
            "id_filme": m.id_filme,
            "titulo": m.titulo,
            "ano_lancamento": m.ano_lancamento,
            "duracao_minutos": getattr(m, 'duracao_minutos', None),
            "status_filme": getattr(m, 'status_filme', None),
            "sinopse": m.sinopse,
            "url_poster": m.url_poster,
            "url_backdrop": getattr(m, 'url_backdrop', None),
            "genres": genres_list,
            "companies": companies_list
        })
        
    return movie_list

@router.get("/{sk_movie_id}", response_model=MovieResponseSchema)
async def get_movie_by_id(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    """Busca os detalhes de um filme específico pelo seu surrogate key."""
    query = (
        select(DimMovie)
        .options(selectinload(DimMovie.genres), selectinload(DimMovie.companies))
        .filter(DimMovie.sk_movie_id == sk_movie_id)
    )
    result = await db.execute(query)
    movie = result.scalars().first()
    
    if not movie:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
    
    return movie




# 1. Rota ESTÁTICA vem primeiro (para listar todas as reviews)
@router.get("/reviews", response_model=list[MovieReviewSchema])
async def get_all_reviews(limit: int = 1000, db: AsyncSession = Depends(get_db)):
    """Busca todas as avaliações cadastradas."""
    query = select(MovieReview).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


# 2. Rota DINÂMICA vem depois
@router.get("/{sk_movie_id}/reviews", response_model=list[MovieReviewSchema])
async def get_movie_reviews(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    """Busca todas as avaliações de um filme específico."""
    query = select(MovieReview).filter(MovieReview.sk_movie_id == sk_movie_id)
    result = await db.execute(query)
    return result.scalars().all()


# 3. Rota POST para criar review no filme específico
@router.post("/{sk_movie_id}/reviews", response_model=MovieReviewSchema)
async def create_review(sk_movie_id: str, review_data: MovieReviewSchema, db: AsyncSession = Depends(get_db)):
    """Cria uma nova avaliação para um filme específico."""
    new_review = MovieReview(
        sk_movie_id=sk_movie_id,
        nome=review_data.nome,
        nota=review_data.nota,
        comentario=review_data.comentario
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review


@router.post("/")
async def create_movie(movie_data: MovieCreateSchema, db: AsyncSession = Depends(get_db)):
    try:
        generated_id = str(uuid.uuid4())
        
        new_movie = DimMovie(
            id_filme=generated_id,
            sk_movie_id=generated_id,
            titulo=movie_data.titulo,
            ano_lancamento=movie_data.ano,
            sinopse=movie_data.sinopse,
            url_poster=movie_data.poster
        )

        db.add(new_movie)
        await db.commit()
        await db.refresh(new_movie)
        
        return {
            "sk_movie_id": new_movie.sk_movie_id,
            "titulo": new_movie.titulo,
            "ano_lancamento": new_movie.ano_lancamento,
            "sinopse": new_movie.sinopse,
            "url_poster": new_movie.url_poster,
            "genres": [],
            "companies": []
        }
    except Exception as e:
        print("ERRO DETALHADO AO CRIAR FILME:", str(e))  # <-- Isto vai mostrar o erro exato no terminal!
        await db.rollback()
        raise e

#rota para atualiza as informações de um filme existente
@router.put("/{sk_movie_id}")
async def update_movie(sk_movie_id: str, movie_data: MovieCreateSchema, db: AsyncSession = Depends(get_db)):
    """Atualiza as informações de um filme existente."""
    query = select(DimMovie).filter(DimMovie.sk_movie_id == sk_movie_id)
    result = await db.execute(query)
    movie = result.scalars().first()
    
    if not movie:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
        
    # Atualiza os campos necessários
    movie.titulo = movie_data.titulo
    movie.ano_lancamento = movie_data.ano
    movie.sinopse = movie_data.sinopse
    movie.url_poster = movie_data.poster
    
    await db.commit()
    await db.refresh(movie)
    
    return {"mensagem": "Filme atualizado com sucesso!", "titulo": movie.titulo}



#rota para poder deletar filmes 
@router.delete("/{sk_movie_id}")
async def delete_movie(sk_movie_id: str, db: AsyncSession = Depends(get_db)):
    """Remove um filme pelo seu identificador único."""
    query = select(DimMovie).filter(DimMovie.sk_movie_id == sk_movie_id)
    result = await db.execute(query)
    movie = result.scalars().first()
    
    if not movie:
        raise HTTPException(status_code=404, detail="Filme não encontrado.")
        
    await db.delete(movie)
    await db.commit()
    
    return {"mensagem": "Filme removido com sucesso!"}

