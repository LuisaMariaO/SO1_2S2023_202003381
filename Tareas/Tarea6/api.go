package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/go-redis/redis/v8"
	"github.com/rs/cors"
)

var rdb *redis.Client // Creamos el Redis CLient

// Estructura del JSON
type Album struct {
	Album  string `json:"album"`
	Artist string `json:"artist"`
	Year   int    `json:"year"`
}

func main() {
	// Configurar la Conexion de Redis
	rdb = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // Host de la base de Redis
		Password: "",               // contraseña Redis (Si tiene)
		DB:       1,                // Numero de la DB
	})

	// Integramos CORS
	c := cors.Default()
	corsHandler := c.Handler

	// Contador
	counter := 0

	// Ruta
	http.HandleFunc("/music/Add", func(w http.ResponseWriter, r *http.Request) {
		// Decodificar JSON
		decoder := json.NewDecoder(r.Body)
		var album Album
		err := decoder.Decode(&album)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Creamos una variable contador, si existe se toma el valor
		counter = int(rdb.Incr(context.Background(), "contador_almums").Val())

		// Insertamos a Redis
		key := fmt.Sprintf("album%d", counter)
		albumJSON, err := json.Marshal(album)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		err = rdb.Set(context.Background(), key, albumJSON, 0).Err()
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		fmt.Println("Album Registrado en Redis: ", album)
		fmt.Fprintf(w, "Se ha Registrado el Album en Redis! (%d albumes registrados)", counter)
	})

	http.HandleFunc("/music/Get", func(w http.ResponseWriter, r *http.Request) {
		var albumes []Album

		// Se obtienen los datos de Redis
		iter := rdb.Scan(context.Background(), 0, "", 0).Iterator()
		for iter.Next(context.Background()) {
			value := rdb.Get(context.Background(), iter.Val())
			//fmt.Println(value.Val())
			var album Album
			albumb, _ := value.Bytes()
			err := json.Unmarshal(albumb, &album)
			if err != nil {
				break
			}
			albumes = append(albumes, album)
		}
		if err := iter.Err(); err != nil {
			panic(err)
		}

		json.NewEncoder(w).Encode(albumes)
	})

	// Start the HTTP server with CORS
	fmt.Println("Iniciando en el puerto 3300")
	err := http.ListenAndServe(":3300", corsHandler(http.DefaultServeMux))
	if err != nil {
		log.Fatal("Error starting the HTTP server:", err)
	}
}
