const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const redis = require("ioredis");


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const client = redis.createClient({
    host: "localhost",
    port: 6379,
    db: 1,
  });
//client.select(1);





io.on("connection", (socket) => {
    

    console.log(`User Connected: ${socket.id}`);
    
     // Obtener todas las claves de Redis
   
    
    const sendAlbumsToClients = async () => {
        console.log('Enviando álbumes a clientes desde Redis');
        try {
        const albumKeys = await client.keys('*');
        const allAlbums = [];
        for (const albumKey of albumKeys) {
            
            const albumData = await client.get(albumKey);
            if(albumData.length>1){

            allAlbums.push(JSON.parse(albumData));
            }
        }
        socket.emit('receive_music', allAlbums);
        } catch (error) {
        console.error('Error al obtener datos de álbumes desde Redis:', error.message);
        }
    };
     setInterval(sendAlbumsToClients, 5000);
        
  
       //socket.emit('receive_music', albums);

    

});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

