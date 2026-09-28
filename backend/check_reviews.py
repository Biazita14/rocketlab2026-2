import sqlite3

# Liga ao banco de dados físico
conn = sqlite3.connect('rocketlab.db')
cursor = conn.cursor()

# Consulta todas as avaliações gravadas
cursor.execute("SELECT sk_movie_id, nome, nota, comentario FROM movie_reviews")
reviews = cursor.fetchall()

print(f"\n--- TOTAL DE AVALIAÇÕES NO BANCO: {len(reviews)} ---")
for r in reviews:
    print(f"Filme ID: {r[0]} | Nome: {r[1]} | Nota: {r[2]} | Comentário: {r[3]}")

conn.close()