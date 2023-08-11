package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type ResponseInfo struct {
	Carnet int    `json:"carnet"`
	Nombre string `json:"nombre"`
}

func handler1(w http.ResponseWriter, _ *http.Request) {
	fmt.Fprintf(w, "Hello from Golang!!!")
}

func handleData(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusCreated)
	w.Header().Set("Content-Type", "application/json")
	resp := ResponseInfo{202003381, "Luisa María Ortiz Romero"}
	jsonResp, err := json.Marshal(resp)
	if err != nil {
		fmt.Printf("Error happened in JSON marshal. Err: %s", err)
	}
	w.Write(jsonResp)

}

func main() {
	http.HandleFunc("/", handler1)
	http.HandleFunc("/data", handleData)
	http.ListenAndServe(":8000", nil)
}
