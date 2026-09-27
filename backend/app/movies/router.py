from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.movies.models import DimMovie, MovieReview, FactMoviePerformance
from app.movies.schemas import (
    MovieResponseSchema, 
    MovieReviewSchema, 
    FactMoviePerformanceSchema
)

router = APIRouter()

@router.get("/", response_model=list[MovieResponseSchema])
async def list_movies(skip: int = 0, limit: int = 500, db: AsyncSession = Depends(get_db)):
    """Lista os filmes com paginação e carregamento das relações (géneros e produtoras)."""
    query = (
        select(DimMovie)
        .options(selectinload(DimMovie.genres), selectinload(DimMovie.companies))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    movies = result.scalars().all()
    return movies

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

# Rota para criar uma nova avaliação para filmes
@router.post("/reviews", response_model=MovieReviewSchema)
async def create_review(review_data: MovieReviewSchema, db: AsyncSession = Depends(get_db)):
    """Cria uma nova avaliação para um filme específico."""
    new_review = MovieReview(
        sk_movie_id=review_data.sk_movie_id,
        nome=review_data.nome,
        nota=review_data.nota,
        comentario=review_data.comentario
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review

