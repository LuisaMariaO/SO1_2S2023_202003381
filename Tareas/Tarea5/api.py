from flask import Flask
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return 'Hola Mundo 202003381'
<<<<<<< HEAD
app.run(host='0.0.0.0',port=5001)
=======
app.run(host='0.0.0.0',port=8080)
>>>>>>> 8c377c73e7fa7d915def6de94f857edf06d6e15d
