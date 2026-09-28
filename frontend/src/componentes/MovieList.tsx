import { ReviewSection } from './ReviewSection';
import { movieService } from '../services/movieService';

interface MovieListProps {
  movies: any[];
  reviewsMap: { [key: string]: any[] };
  selectedMovieId: string | null;
  onToggleReviews: (rawId: string) => void;
  onReviewAdded: (newReview: any, movieId: string) => void;
  onMovieChanged: () => void; // Callback para recarregar a lista após apagar/editar
  onEditMovie: (movie: any) => void; // Callback para iniciar a edição
}

export function MovieList({ 
  movies, 
  reviewsMap, 
  selectedMovieId, 
  onToggleReviews, 
  onReviewAdded,
  onMovieChanged,
  onEditMovie
}: MovieListProps) {

  const handleDelete = async (rawMovieId: string, titulo: string) => {
    if (window.confirm(`Tem a certeza que deseja apagar o filme "${titulo}"?`)) {
      try {
        await movieService.deleteMovie(rawMovieId);
        alert('Filme removido com sucesso!');
        onMovieChanged();
      } catch (error) {
        console.error('Erro ao apagar filme:', error);
        alert('Erro ao apagar o filme.');
      }
    }
  };

  if (movies.length === 0) {
    return <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Nenhum filme encontrado com os filtros aplicados.</p>;
  }

  return (
    <ul style={{ listStyleType: 'none', padding: 0 }}>
      {movies.map((movie: any) => {
        const generosStr = movie.genres && movie.genres.length > 0 
          ? movie.genres.map((g: any) => g.nome_genero).join(', ') 
          : 'N/A';

        const rawMovieId = String(movie.sk_movie_id || movie.id || '').trim();
        const isExpanded = selectedMovieId === rawMovieId;
        const movieReviews = reviewsMap[rawMovieId] || [];
        const hasReviews = movieReviews.length > 0;

        const averageRating = hasReviews 
          ? (movieReviews.reduce((acc: number, rev: any) => acc + (rev.nota || 0), 0) / movieReviews.length).toFixed(1) 
          : null;

        return (
          <li 
            key={rawMovieId} 
            style={{ background: '#f9f9f9', margin: '15px 0', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {movie.url_poster ? (
                <img src={movie.url_poster} alt={movie.titulo} style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
              ) : (
                <div style={{ width: '70px', height: '100px', background: '#ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#666' }}>Sem Imagem</div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: '0 0 5px 0' }}>{movie.titulo}</h3>
                  {averageRating && (
                    <span style={{ background: '#ffc107', color: '#333', padding: '3px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                      ⭐ Média: {averageRating} / 10
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                  <b>Género:</b> {generosStr} | <b>Ano:</b> {movie.ano_lancamento || 'N/A'}
                </p>
                <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#444' }}>{movie.sinopse}</p>
                
                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => onToggleReviews(rawMovieId)}
                    style={{ background: hasReviews ? '#28a745' : '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    {isExpanded ? 'Ocultar Avaliações' : `Ver Avaliações (${movieReviews.length})`}
                  </button>

                  <button 
                    onClick={() => onEditMovie(movie)}
                    style={{ background: '#ffc107', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    Editar
                  </button>

                  <button 
                    onClick={() => handleDelete(rawMovieId, movie.titulo)}
                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && (
              <ReviewSection 
                movieId={rawMovieId}
                reviews={movieReviews}
                onReviewAdded={onReviewAdded}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}