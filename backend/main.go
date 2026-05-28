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
		port = "74.220.48.0/24"
		port = "74.220.56.0/24"
		port = "216.151.17.91"
		port = "216.151.17.92"
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
