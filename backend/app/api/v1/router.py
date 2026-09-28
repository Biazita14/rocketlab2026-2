

from fastapi import APIRouter, Depends # o depends nao tinha antes 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.movies.router import router as movies_router
from app.movies.models import MovieReview, FactMoviePerformance
from app.movies.schemas import MovieReviewSchema, FactMoviePerformanceSchema

api_router = APIRouter()

# Regista o router de filmes com o prefixo /movies
api_router.include_router(movies_router, prefix="/movies", tags=["movies"])

# 2. Rota de Reviews (fica diretamente em /api/v1/reviews)
@api_router.get("/reviews", response_model=list[MovieReviewSchema], tags=["reviews"])
async def list_reviews(skip: int = 0, limit: int = 1000, db: AsyncSession = Depends(get_db)):
    """Lista as avaliações dos utilizadores com paginação."""
    result = await db.execute(
        select(MovieReview)
        .order_by(MovieReview.created_at.desc()) # Garante que as mais novas aparecem primeiro
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


############################
@api_router.post("/reviews", response_model=MovieReviewSchema, tags=["reviews"])
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



# 3. Rota de Performances (fica diretamente em /api/v1/performances)
@api_router.get("/performances", response_model=list[FactMoviePerformanceSchema], tags=["performances"])
async def list_performances(skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    """Lista as performances financeiras dos filmes com paginação."""
    result = await db.execute(select(FactMoviePerformance).offset(skip).limit(limit))
    return result.scalars().all()
