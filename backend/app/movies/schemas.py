from datetime import date
from decimal import Decimal
from pydantic import BaseModel, ConfigDict
from datetime import datetime, date  # Certifique-se de que datetime está importado
from pydantic import BaseModel

class GenreSchema(BaseModel):
    sk_genre_id: str
    nome_genero: str

    model_config = ConfigDict(from_attributes=True)

class CompanySchema(BaseModel):
    sk_company_id: str
    nome_produtora: str

    model_config = ConfigDict(from_attributes=True)

class MovieResponseSchema(BaseModel):
    sk_movie_id: str
    id_filme: str
    titulo: str
    data_lancamento: date | None = None
    ano_lancamento: int | None = None
    duracao_minutos: int | None = None
    status_filme: str | None = None
    sinopse: str | None = None
    url_poster: str | None = None
    url_backdrop: str | None = None

    genres: list[GenreSchema] = []
    companies: list[CompanySchema] = []

    model_config = ConfigDict(from_attributes=True)

#################### adicao de schemas 


class MovieReviewSchema(BaseModel):
    sk_movie_review_id: str | None = None
    sk_movie_id: str
    nome: str | None = None
    nota: float | None = None
    comentario: str | None = None
    created_at: datetime | None = None  # Corrigido de str para datetime

    model_config = ConfigDict(from_attributes=True)

class FactMoviePerformanceSchema(BaseModel):
    sk_movie_id: str
    orcamento_usd: float | None = None
    receita_usd: float | None = None
    lucro_usd: float | None = None
    orcamento_brl: float | None = None
    receita_brl: float | None = None
    lucro_brl: float | None = None
    popularidade: float | None = None
    nota_tmdb: float | None = None
    qtd_tmdb: int | None = None   # Alterado de str para int (erro antes)
    nota_imdb: float | None = None
    qtd_imdb: int | None = None   # Alterado de str para int (erro antes)

    model_config = ConfigDict(from_attributes=True)



class MovieCreateSchema(BaseModel):
    titulo: str
    diretor: str | None = None
    ano: int | None = None
    poster: str | None = None
    sinopse: str | None = None