import React, { useState } from 'react';
import { movieService } from '../services/movieService';

interface ReviewSectionProps {
  movieId: string;
  reviews: any[];
  onReviewAdded: (newReview: any, movieId: string) => void;
}

export function ReviewSection({ movieId, reviews, onReviewAdded }: ReviewSectionProps) {
  const [newNome, setNewNome] = useState('');
  const [newNota, setNewNota] = useState('10');
  const [newComentario, setNewComentario] = useState('');

  const hasReviews = reviews.length > 0;

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNome || !newNota) {
      alert('Por favor, preencha o seu nome e a nota.');
      return;
    }

    const payload = {
      sk_movie_id: movieId,
      nome: newNome,
      nota: parseFloat(newNota),
      comentario: newComentario
    };

    try {
      const response = await movieService.addReview(payload);
      const novaReviewCriada = (response as any)?.data || response || payload;
      
      onReviewAdded(novaReviewCriada, movieId);
      
      setNewNome('');
      setNewNota('10');
      setNewComentario('');
      alert('Avaliação adicionada com sucesso!');
    } catch (err: any) {
      console.error('Erro ao adicionar avaliação:', err);
      alert('Erro ao submeter a avaliação. Veja o console para detalhes.');
    }
  };

  return (
    <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Avaliações de Utilizadores:</h4>
      
      {!hasReviews && (
        <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic' }}>
          Este filme ainda não tem avaliações registadas na base de dados.
        </p>
      )}

      {hasReviews && (
        <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 15px 0' }}>
          {reviews.map((rev: any, index: number) => (
            <li 
              key={index} 
              style={{ background: '#fff', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #e5e5e5', fontSize: '13px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <b>{rev.nome || 'Anónimo'}</b>
                <span style={{ color: '#d9534f', fontWeight: 'bold' }}>⭐ {rev.nota} / 10</span>
              </div>
              <p style={{ margin: 0, color: '#555' }}>{rev.comentario || 'Sem comentário.'}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAddReview} style={{ background: '#eef2f5', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
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
  );
}