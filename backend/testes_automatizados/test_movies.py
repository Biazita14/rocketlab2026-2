def test_list_movies_empty(client):
    response = client.get("/api/v1/movies")
    assert response.status_code == 200
    assert response.json() == []


def test_create_movie(client):
    movie_data = {
        "titulo": "Filme de Teste",
        "ano": 2026,
        "sinopse": "Uma sinopse de teste automatizado.",
        "nota_media": 9.5
    }
    response = client.post("/api/v1/movies/", json=movie_data)
    assert response.status_code == 200 # Ou 201 dependendo do meu endpoint de criação
    
    data = response.json()
    assert data["titulo"] == "Filme de Teste"
    assert data["ano_lancamento"] == 2026



def test_list_movies_with_data(client):
    # 1. Cria um filme primeiro para garantir que a base não está vazia
    movie_data = {
        "titulo": "Filme de Aventura",
        "ano": 2026,
        "sinopse": "Um filme emocionante para testar a listagem.",
        "nota_media": 8.5
    }
    create_response = client.post("/api/v1/movies/", json=movie_data)
    assert create_response.status_code == 200

    # 2. Faz o GET para listar os filmes
    response = client.get("/api/v1/movies")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) >  0  # Garante que veio pelo menos um filme
    assert data[0]["titulo"] == "Filme de Aventura"