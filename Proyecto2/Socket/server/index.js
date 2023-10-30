const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const redis = require("ioredis");
const mysql = require("mysql");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3020",
    methods: ["GET", "POST"],
  },
});

const client = redis.createClient({
    host: "localhost",
    port: 6379,
    db: 1,
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

  io.on('connection', (socket) => {
    console.log('Cliente conectado');
    //Se emiten los datos por primera vez,antes de entrar el intervalo
    db_mysql.query('SELECT * FROM notas', (err, results) => {
        if (err) throw err;
        socket.emit('database-update', results);
      });
      //Emision de cursos disponibles al iniciar la conexion
    db_mysql.query('SELECT DISTINCT curso FROM notas;', (err, results) => {
        if (err) throw err;
        socket.emit('cursos-update', results);
      }); 
      
    db_mysql.query('SELECT DISTINCT semestre FROM notas;', (err, results) => {
        if (err) throw err;
        socket.emit('semestres-update', results);
      });
      
      //Datos para las gráficas
    socket.on("enviarCursoG1", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
        
        db_mysql.query('SELECT carnet FROM notas where curso=\"'+data[0]+'\" AND semestre=\"'+data[1]+ '\" AND nota>=61;', (err, results) => {
            if (err) throw err;
            var aprobados = results.length
            console.log(aprobados)
            db_mysql.query('SELECT carnet FROM notas where curso=\"'+data[0]+'\" AND semestre=\"'+data[1]+ '\" AND nota<61;', (err, results) => {
                if (err) throw err;
                var reprobados = results.length
                console.log(aprobados,reprobados)
                socket.emit('respuestaCursoG1', [aprobados,reprobados]);
              });
          });
      });

      socket.on("enviarSemestreG1", (data) => {
        
        console.log("Parámetros recibidos del cliente:", data);
    
        db_mysql.query('SELECT carnet FROM notas where curso=\"'+data[0]+'\" AND semestre=\"'+data[1]+ '\" AND nota>=61;', (err, results) => {
            if (err) throw err;
            var aprobados = results.length
            db_mysql.query('SELECT carnet FROM notas where curso=\"'+data[0]+'\" AND semestre=\"'+data[1]+ '\" AND nota<61;', (err, results) => {
                if (err) throw err;
                var reprobados = results.length
                console.log(aprobados,reprobados)
                socket.emit('respuestaSemestreG1', [aprobados,reprobados]);
              });
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


    // Emitir datos de la base de datos en tiempo real
    const emitDataPeriodically = () => {
        db_mysql.query('SELECT * FROM notas', (err, results) => {
          if (err) throw err;
          socket.emit('database-update', results);
        });

        db_mysql.query('SELECT DISTINCT curso FROM notas;', (err, results) => {
            if (err) throw err;
            socket.emit('cursos-update', results);
          }); 

        db_mysql.query('SELECT DISTINCT semestre FROM notas;', (err, results) => {
            if (err) throw err;
            socket.emit('semestres-update', results);
            
          });  
      };
    const interval = setInterval(emitDataPeriodically, 3000); //La data se emite cada 32 segundos para que se mantenga actualizada 
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
      clearInterval(interval);
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
