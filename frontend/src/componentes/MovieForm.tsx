import React, { useState, useEffect } from 'react';
import { movieService } from '../services/movieService';

interface MovieFormProps {
  movieToEdit?: any | null; // Novo: se vier preenchido, estamos a editar
  onMovieSaved: () => void;
  onCancel: () => void;
}

export function MovieForm({ movieToEdit, onMovieSaved, onCancel }: MovieFormProps) {
  const [newTitulo, setNewTitulo] = useState('');
  const [newDiretor, setNewDiretor] = useState('');
  const [newAno, setNewAno] = useState('');
  const [newSinopse, setNewSinopse] = useState('');
  const [newPoster, setNewPoster] = useState('');

  // Se houver um filme para editar, preenche os campos automaticamente ao abrir
  useEffect(() => {
    if (movieToEdit) {
      setNewTitulo(movieToEdit.titulo || '');
      setNewDiretor(movieToEdit.diretor || '');
      setNewAno(movieToEdit.ano_lancamento ? String(movieToEdit.ano_lancamento) : '');
      setNewSinopse(movieToEdit.sinopse || '');
      setNewPoster(movieToEdit.url_poster || '');
    }
  }, [movieToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitulo) {
      alert('O título do filme é obrigatório.');
      return;
    }

    const payload = {
      titulo: newTitulo,
      diretor: newDiretor,
      ano: newAno ? parseInt(newAno) : null, // Ajustado para corresponder ao schema de criação/edição
      sinopse: newSinopse,
      poster: newPoster
    };

    try {
      if (movieToEdit) {
        // Modo Edição (PUT)
        const movieId = movieToEdit.sk_movie_id || movieToEdit.id_filme;
        await movieService.updateMovie(movieId, payload);
        alert('Filme atualizado com sucesso!');
      } else {
        // Modo Criação (POST)
        await movieService.createMovie(payload);
        alert('Filme cadastrado com sucesso!');
      }
      onMovieSaved();
    } catch (err) {
      console.error('Erro ao salvar filme:', err);
      alert('Erro ao salvar o filme. Verifique o console.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ccc', marginBottom: '25px' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>{movieToEdit ? 'Editar Filme' : 'Cadastrar Novo Filme'}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Título do Filme *" 
          value={newTitulo} 
          onChange={(e) => setNewTitulo(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
          required 
        />
        <input 
          type="text" 
          placeholder="Diretor" 
          value={newDiretor} 
          onChange={(e) => setNewDiretor(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <input 
          type="number" 
          placeholder="Ano de Lançamento" 
          value={newAno} 
          onChange={(e) => setNewAno(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
        <input 
          type="text" 
          placeholder="URL do Poster (opcional)" 
          value={newPoster} 
          onChange={(e) => setNewPoster(e.target.value)} 
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} 
        />
      </div>
      <textarea 
        placeholder="Sinopse do filme..." 
        value={newSinopse} 
        onChange={(e) => setNewSinopse(e.target.value)} 
        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '10px', boxSizing: 'border-box' }}
        rows={3}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          {movieToEdit ? 'Atualizar Filme' : 'Guardar Filme'}
        </button>
        <button type="button" onClick={onCancel} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}