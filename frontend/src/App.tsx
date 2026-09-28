import { useEffect, useState, useMemo } from 'react';
import { movieService } from './services/movieService';
import type { Movie, Review, Genre } from './types/movie';
import api from './services/api';
import { MovieForm } from './componentes/MovieForm';
import { MovieList } from './componentes/MovieList';



export function App() {
  
  const [showAddMovieModal, setShowAddMovieModal] = useState(false);
  const [movieToEdit, setMovieToEdit] = useState<any | null>(null); // Novo estado para edição
  const [movies, setMovies] = useState<Movie[]>([]);
  const [reviewsMap, setReviewsMap] = useState<{ [key: string]: Review[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [sortBy, setSortBy] = useState('title-asc');
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  console.log("Filmes recebidos no frontend:", movies);

  const fetchData = async () => {
    try {
      const [moviesData, reviewsRes] = await Promise.all([
        movieService.getMovies(),
        api.get('/api/v1/reviews?limit=1000')
      ]);

      setMovies(moviesData);

      const reviewsList = Array.isArray(reviewsRes.data) ? reviewsRes.data : (reviewsRes.data.items || []);
      const map: { [key: string]: Review[] } = {};

      reviewsList.forEach((rev: any) => {
        const revMovieId = rev.sk_movie_id || rev.movie_id;
        if (revMovieId) {
          const cleanKey = String(revMovieId).trim();
          if (!map[cleanKey]) map[cleanKey] = [];
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
  };

  const handleNewReviewAdded = (newRev: Review, movieId: string) => {
    setReviewsMap((prevMap) => {
      const currentList = prevMap[movieId] || [];
      return {
        ...prevMap,
        [movieId]: [newRev, ...currentList]
      };
    });
  };

  const handleEditMovie = (movie: any) => {
    setMovieToEdit(movie);
    setShowAddMovieModal(true);
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '40px', maxWidth: '850px', margin: '0 auto' }}>
      <h1>Rocket Lab - Dashboard de Filmes</h1>
      
      {loading && <p>A carregar painel...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button 
              onClick={() => {
                setMovieToEdit(null); // Limpa para modo criação
                setShowAddMovieModal(!showAddMovieModal);
              }}
              style={{ background: '#007bff', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {showAddMovieModal ? 'Cancelar' : '+ Adicionar Novo Filme'}
            </button>
          </div>

          {showAddMovieModal && (
            <MovieForm 
              movieToEdit={movieToEdit}
              onMovieSaved={() => { 
                fetchData(); 
                setShowAddMovieModal(false); 
                setMovieToEdit(null);
              }} 
              onCancel={() => { 
                setShowAddMovieModal(false); 
                setMovieToEdit(null);
              }} 
            />
          )}

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

          <MovieList 
            movies={filteredAndSortedMovies}
            reviewsMap={reviewsMap}
            selectedMovieId={selectedMovieId}
            onToggleReviews={handleToggleReviews}
            onReviewAdded={handleNewReviewAdded}
            onMovieChanged={fetchData}
            onEditMovie={handleEditMovie}
          />
        </>
      )}
    </div>
  );
}

export default App;