package main

import (
	"net/https:aserraderodonsantiago.com.ar"
	"os"
)

func main() {

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	fs := http.FileServer(http.Dir("./"))

	http.Handle("/", fs)

	http.ListenAndServe(":"+port, nil)
}