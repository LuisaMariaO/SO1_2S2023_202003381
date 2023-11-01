const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const redis = require("ioredis");
const mysql = require("mysql2");
require('dotenv').config();


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const client = redis.createClient({
    host: "my-redis",
    port: 6379,
    db: 0,
  });

  const db_mysql = mysql.createConnection({
    host: "35.199.191.62",
    port: 3306,
    database: "proyecto2",
    user: "root",
    password: "030419",
  });
  
  db_mysql.connect((err) => {
    if (err) { 
      console.error(err);
      return;
    }
  
    console.log("Conección MySQL exitosa!");
  });

  const dataToEmit = {
    database: [],
    cursos: [],
    semestres: [],
    redis: 0
  };

  io.on('connection', (socket) => {
    console.log('Cliente conectado');
    //Se emiten los datos por primera vez,antes de entrar el intervalo
    socket.emit('database-update', dataToEmit.database);
    socket.emit('cursos-update', dataToEmit.cursos);
    socket.emit('semestres-update', dataToEmit.semestres);
    socket.emit('redis-update',dataToEmit.redis)
      
    //Consulta redis
    const obtenerRegistros = async () => {
      try {
        const registros = await client.get("contador_notas");
        //console.log(registros);
        socket.emit("redis-update",registros)
      } catch (error) {
        console.error("Error al obtener registros:", error);
      }
    };

    
      //Datos para las gráficas
    socket.on("enviarCursoG1", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
        
        db_mysql.query('SELECT (SELECT COUNT(*) FROM notas WHERE curso = "'+data[0]+'" AND semestre = "'+data[1]+'" AND nota >= 61) AS aprobados, (SELECT COUNT(*) FROM notas WHERE curso = "'+data[0]+'" AND semestre = "'+data[1]+'" AND nota < 61) AS reprobados;', (err, results) => {
            if (err) throw err;
            
          socket.emit('respuestaCursoG1', results);
      });
    });

      socket.on("enviarSemestreG1", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
        
        db_mysql.query('SELECT (SELECT COUNT(*) FROM notas WHERE curso = "'+data[0]+'" AND semestre = "'+data[1]+'" AND nota >= 61) AS aprobados, (SELECT COUNT(*) FROM notas WHERE curso = "'+data[0]+'" AND semestre = "'+data[1]+'" AND nota < 61) AS reprobados;', (err, results) => {
            if (err) throw err;
          console.log(results)  
          socket.emit('respuestaSemestreG1', results);
      });
      }); 

      socket.on("enviarSemestreG2", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
    
        db_mysql.query('SELECT nombre, AVG(nota) AS promedio FROM notas WHERE semestre = "'+data+'" GROUP BY nombre ORDER BY promedio DESC LIMIT 5;', (err, results) => {
            if (err) throw err;
            
            socket.emit('respuestaSemestreG2', results);
            
          });
      }); 

      socket.on("enviarSemestreG3", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
    
        db_mysql.query('SELECT curso, semestre, COUNT(nombre) AS cantidad FROM notas WHERE semestre = "'+data+'" GROUP BY curso, semestre ORDER BY cantidad DESC LIMIT 3;', (err, results) => {
            if (err) throw err;
            
            socket.emit('respuestaSemestreG3', results);
            
          });
      }); 

      socket.on("enviarGraficaRedis", async(semestre) => {
        
        console.log("Parámetros recibidos del cliente:", semestre);
    
        try {
          // Realiza una consulta en Redis para recuperar los datos relevantes
          const keys = await client.keys("nota*");
         
          const estudiantes = await client.mget(keys);
          
          // Procesa los datos y cuenta la cantidad de alumnos en cada curso del semestre
          const cursos = {};
    
          estudiantes.forEach((estudiante) => {
            const Jestudiante = JSON.parse(estudiante) 
            if (estudiante && Jestudiante.semestre === semestre) {
              
              const curso = Jestudiante.curso;
              cursos[curso] = (cursos[curso] || 0) + 1;
            }
          });
    
          // Emite esta información a través de socket.io
          console.log(cursos)
          socket.emit("respuestaGraficaRedis", cursos);
        } catch (error) {
          console.error("Error al consultar y emitir datos:", error);
        }
    }); 


    // Emitir datos de la base de datos en tiempo real
    const emitDataPeriodically = () => {
      db_mysql.query('SELECT * FROM notas', (err, results) => {
        if (!err) {
          dataToEmit.database = results;
          io.emit("database-update",results)
        }
      });
    
      db_mysql.query('SELECT DISTINCT curso FROM notas;', (err, results) => {
        if (!err) {
          dataToEmit.cursos = results;
          io.emit("cursos-update",results)
        }
      });
    
      db_mysql.query('SELECT DISTINCT semestre FROM notas;', (err, results) => {
        if (!err) {
          dataToEmit.semestres = results;
          io.emit("semestres-update",results)
        }
      });

      obtenerRegistros();
      };
    const interval = setInterval(emitDataPeriodically, 3000); //La data se emite cada 32 segundos para que se mantenga actualizada 
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
      //clearInterval(interval);
    });
  });


/*
io.on("connection", (socket) => {
    

    console.log(`User Connected: ${socket.id}`);
});
*/
server.listen(3021, () => {
  console.log("SERVER IS RUNNING");
});
