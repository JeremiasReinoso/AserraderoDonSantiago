package main

import (
	"log"
	"net/http"
	"os"
)

func main() {

	// Puerto que usa Render
	port := os.Getenv("PORT")

	// Si no existe, usa 8080 localmente
	if port == "" {
		port = "8080"
	}

	// Carpeta pública del sitio
	fs := http.FileServer(http.Dir("./"))

	// Mostrar archivos estáticos
	http.Handle("/", fs)

	log.Println("Servidor iniciado en puerto:", port)

	// Iniciar servidor
	err := http.ListenAndServe(":"+port, nil)

	if err != nil {
		log.Fatal(err)
	}
}