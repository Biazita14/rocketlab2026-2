export interface Genre {
  sk_genre_id: string;
  nome_genero: string;
}

export interface Review {
  sk_movie_id: string;
  nome: string;
  nota: number;
  comentario: string;
}

export interface Movie {
  sk_movie_id: string;
  id_filme: string;
  titulo: string;
  data_lancamento?: string;
  ano_lancamento?: number;
  duracao_minutos?: number;
  status_filme?: string;
  sinopse?: string;
  url_poster?: string;
  url_backdrop?: string;
  genres?: Genre[];
}