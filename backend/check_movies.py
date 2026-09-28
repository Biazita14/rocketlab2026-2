import sqlite3

# Liga ao banco de dados físico
conn = sqlite3.connect('rocketlab.db')
cursor = conn.cursor()

try:
    # Consultando a tabela correta 'dim_movies'
    cursor.execute("SELECT sk_movie_id, titulo FROM dim_movies")
    movies = cursor.fetchall()
    
    print(f"\n--- TOTAL DE FILMES NO BANCO: {len(movies)} ---")
    for m in movies:
        print(f"ID: {m[0]} | Título: {m[1]}")
        
except Exception as e:
    print("Erro ao consultar a tabela de filmes:", e)

conn.close()