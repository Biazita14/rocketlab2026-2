import api from './api';
import type { Movie, Review } from '../types/movie';

export const movieService = {
  // Função para listar todos os filmes
  async getMovies(): Promise<Movie[]> {
    const response = await api.get('/api/v1/movies');
    return response.data;
  },

  // Função para buscar todas as reviews e filtrar pelo ID do filme
  async getMovieReviews(skMovieId: string): Promise<Review[]> {
    try {
      // Como a rota geral devolve uma paginação (ex: 20 itens), 
      // pedimos um limite maior para garantir que apanhamos mais registos
      const response = await api.get('/api/v1/reviews?limit=100');
      const allReviews: Review[] = response.data;
      return allReviews.filter(rev => rev.sk_movie_id === skMovieId);
    } catch (err) {
      console.error('Erro ao buscar reviews:', err);
      return [];
    }
  },

  //função para enviar o pedido POST para o backend para novas avaliacoes 
  async addReview(reviewData: { sk_movie_id: string; nome: string; nota: number; comentario: string }): Promise<Review> {
  const response = await api.post('/api/v1/reviews', reviewData);
  return response.data;
}
};

