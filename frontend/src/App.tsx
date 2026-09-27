import { useEffect, useState, useMemo } from 'react';
import { movieService } from './services/movieService';
import type { Movie, Review, Genre } from './types/movie';
import api from './services/api';

function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviewsMap, setReviewsMap] = useState<{ [key: string]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('title-asc');

  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const [newNome, setNewNome] = useState('');
  const [newNota, setNewNota] = useState('10');
  const [newComentario, setNewComentario] = useState('');

  const fetchData = async () => {
    try {
      const [moviesData, reviewsRes] = await Promise.all([
        movieService.getMovies(),
        api.get('/api/v1/reviews?limit=1000').catch(() => ({ data: [] }))
      ]);

      setMovies(moviesData);

      const reviewsList = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.items || []);

      const map: { [key: string]: Review[] } = {};

      reviewsList.forEach((rev: any) => {
        const revMovieId = rev.sk_movie_id || rev.movie_id;
        if (revMovieId) {
          const cleanKey = String(revMovieId).trim();
          if (!map[cleanKey]) {
            map[cleanKey] = [];
          }
          map[cleanKey].push(rev);
        }
      });
      
      setReviewsMap(map);
      setLoading(false);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar os dados do backend.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const allGenres = useMemo(() => {
    const genreMap = new Map<string, Genre>();
    movies.forEach((movie: any) => {
      movie.genres?.forEach((g: any) => {
        const genreId = g.sk_genre_id || g.id;
        if (genreId && !genreMap.has(genreId)) {
          genreMap.set(genreId, g);
        }
      });
    });
    return Array.from(genreMap.values());
  }, [movies]);

  const filteredAndSortedMovies = useMemo(() => {
    let result = movies.filter((movie: any) => {
      const matchesSearch = movie.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = selectedGenre === 'all' || 
        movie.genres?.some((g: any) => (g.sk_genre_id || g.id) === selectedGenre);
      return matchesSearch && matchesGenre;
    });

    result.sort((a: any, b: any) => {
      if (sortBy === 'title-asc') return a.titulo.localeCompare(b.titulo);
      if (sortBy === 'title-desc') return b.titulo.localeCompare(a.titulo);
      if (sortBy === 'year-desc') return (b.ano_lancamento || 0) - (a.ano_lancamento || 0);
      if (sortBy === 'year-asc') return (a.ano_lancamento || 0) - (b.ano_lancamento || 0);
      return 0;
    });

    return result;
  }, [movies, searchTerm, selectedGenre, sortBy]);

  const handleToggleReviews = (rawId: string) => {
    setSelectedMovieId(selectedMovieId === rawId ? null : rawId);
    setNewNome('');
    setNewNota('10');
    setNewComentario('');
  };

  const handleAddReview = async (e: React.FormEvent, rawId: string) => {
    e.preventDefault();
    if (!newNome || !newNota) {
      alert('Por favor, preencha o seu nome e a nota.');
      return;
    }

    const payload = {
      sk_movie_id: rawId,
      nome: newNome,
      nota: parseFloat(newNota),
      comentario: newComentario
    };

    console.log('--- A ENVIAR AVALIAÇÃO ---', payload);

    try {
      const response = await movieService.addReview(payload);
      console.log('--- RESPOSTA DA CRIAÇÃO DA REVIEW ---', response);

      // Correção aplicada: trata o retorno de forma segura para o TypeScript
      const novaReviewCriada = (response as any)?.data || response || payload;
      
      setReviewsMap((prevMap) => {
        const currentList = prevMap[rawId] || [];
        return {
          ...prevMap,
          [rawId]: [novaReviewCriada, ...currentList]
        };
      });
      
      setNewNome('');
      setNewNota('10');
      setNewComentario('');
      alert('Avaliação adicionada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao adicionar avaliação:', err);
      console.log('Detalhes do erro da API:', err.response?.data);
      alert('Erro ao submeter a avaliação. Veja a consola para detalhes.');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', maxWidth: '850px', margin: '0 auto' }}>
      <h1>Rocket Lab - Dashboard de Filmes</h1>
      
      {loading && <p>A carregar painel...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap', background: '#f1f1f1', padding: '15px', borderRadius: '8px' }}>
            <input 
              type="text" 
              placeholder="Pesquisar filme por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: '1 1 200px', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            />

            <select 
              value={selectedGenre} 
              onChange={(e) => setSelectedGenre(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">Todos os Géneros</option>
              {allGenres.map((genre: any) => (
                <option key={genre.sk_genre_id || genre.id} value={genre.sk_genre_id || genre.id}>
                  {genre.nome_genero}
                </option>
              ))}
            </select>

            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="title-asc">Título (A-Z)</option>
              <option value="title-desc">Título (Z-A)</option>
              <option value="year-desc">Ano (Mais recente)</option>
              <option value="year-asc">Ano (Mais antigo)</option>
            </select>
          </div>

          {filteredAndSortedMovies.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>Nenhum filme encontrado com os filtros aplicados.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {filteredAndSortedMovies.map((movie: any) => {
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
                        
                        <button 
                          onClick={() => handleToggleReviews(rawMovieId)}
                          style={{ background: hasReviews ? '#28a745' : '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}
                        >
                          {isExpanded ? 'Ocultar Avaliações' : `Ver Avaliações (${movieReviews.length})`}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Avaliações de Utilizadores:</h4>
                        
                        {!hasReviews && <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>Este filme ainda não tem avaliações registadas na base de dados.</p>}

                        {hasReviews && (
                          <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 15px 0' }}>
                            {movieReviews.map((rev: any, index: number) => (
                              <li key={index} style={{ background: '#fff', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #e5e5e5', fontSize: '13px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <b>{rev.nome || 'Anónimo'}</b>
                                  <span style={{ color: '#d9534f', fontWeight: 'bold' }}>⭐ {rev.nota} / 10</span>
                                </div>
                                <p style={{ margin: 0, color: '#555' }}>{rev.comentario || 'Sem comentário.'}</p>
                              </li>
                            ))}
                          </ul>
                        )}

                        <form onSubmit={(e) => handleAddReview(e, rawMovieId)} style={{ background: '#eef2f5', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
                          <h5 style={{ margin: '0 0 8px 0', color: '#333' }}>Adicionar Nova Avaliação:</h5>
                          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                            <input 
                              type="text" 
                              placeholder="O seu nome" 
                              value={newNome} 
                              onChange={(e) => setNewNome(e.target.value)}
                              style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                              required
                            />
                            <input 
                              type="number" 
                              min="0" 
                              max="10" 
                              step="0.5" 
                              placeholder="Nota (0-10)" 
                              value={newNota} 
                              onChange={(e) => setNewNota(e.target.value)}
                              style={{ width: '90px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px' }}
                              required
                            />
                          </div>
                          <textarea 
                            placeholder="Escreva a resenha..." 
                            value={newComentario} 
                            onChange={(e) => setNewComentario(e.target.value)}
                            style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
                            rows={2}
                          />
                          <button type="submit" style={{ background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                            Submeter Avaliação
                          </button>
                        </form>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

export default App;