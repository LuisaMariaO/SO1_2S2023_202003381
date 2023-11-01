from flask import Flask, request, jsonify
import simplejson as json
import redis
import mysql.connector


app = Flask(__name__)
redis_client = redis.StrictRedis(host='my-redis', port=6379, db=0)
mysql_connection = mysql.connector.connect(
    host = '35.199.191.62',
    user = 'root',
    password = '030419',
    port = '3306',
    database = 'proyecto2',
)

cursor = mysql_connection.cursor()
insert_nota = ("INSERT INTO notas "
                "(carnet, nombre, curso, nota, semestre, year)"
                "VALUES (%(carnet)s,%(nombre)s,%(curso)s,%(nota)s,%(semestre)s,%(year)s)")

class Nota:
    def __init__(self, carnet, nombre, curso, nota, semestre, year):
        self.carnet = carnet
        self.nombre = nombre
        self.curso = curso
        self.nota = nota
        self.semestre = semestre
        self.year = year

@app.route('/insert', methods=['POST'])
def agregar_nota():
    try:
        # Decodificar el JSON del cuerpo de la solicitud
        data = request.json
        
        nota = Nota(
            data['carnet'],
            data['nombre'],
            data['curso'],
            data['nota'],
            data['semestre'],
            data['year']
        )
     

        # Insertar la nota voto en Redis
        json_nota = {
            "carnet": nota.carnet,
            "nombre": nota.nombre,
            "curso": nota.curso,
            "nota": nota.nota,
            "semestre": nota.semestre,
            "year": nota.year
        }

        counter = redis_client.incr("contador_notas")
        key = f"nota{counter}"
        json_nota_str = json.dumps(json_nota)
        redis_client.set(key, json_nota_str)

        print("Nota registrada en Redis:", json_nota)
        #Ahora lo agrego a MySQL
        cursor.execute(insert_nota, json_nota)
        mysql_connection.commit()
        return f"¡Nota regostrada! ({counter} notas registradas en Redis)", 200
    except Exception as e:
        return str(e), 500

@app.route('/get', methods=['GET'])
def get():
    return jsonify({"message": "API lista :3"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)