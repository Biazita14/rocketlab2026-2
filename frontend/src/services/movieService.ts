import api from './api';
import type { Movie, Review } from '../types/movie';

export const movieService = {
  // Função para listar todos os filmes
  async getMovies(): Promise<Movie[]> {
    const response = await api.get('/api/v1/movies');
    return response.data;
  },

  // Função para buscar reviews diretamente da rota específica do filme
  async getMovieReviews(skMovieId: string): Promise<Review[]> {
    try {
      const response = await api.get(`/api/v1/movies/${skMovieId}/reviews`);
      return response.data;
    } catch (err) {
      console.error('Erro ao buscar reviews:', err);
      return [];
    }
  },

  // Função para enviar o POST para a rota específica do filme
  async addReview(reviewData: { sk_movie_id: string; nome: string; nota: number; comentario: string }): Promise<Review> {
    const response = await api.post(`/api/v1/movies/${reviewData.sk_movie_id}/reviews`, reviewData);
    return response.data;
  },

  // Adicionar novo filme (POST)
  async createMovie(movieData: any) {
    const response = await api.post('/api/v1/movies', movieData);
    return response.data;
  },

  // Atualizar filme existente (PUT)
  async updateMovie(id: string, movieData: any) {
    const response = await api.put(`/api/v1/movies/${id}`, movieData);
    return response.data;
  },

  // Apagar filme (DELETE)
  async deleteMovie(id: string) {
    const response = await api.delete(`/api/v1/movies/${id}`);
    return response.data;
  }
};

export default movieService;

