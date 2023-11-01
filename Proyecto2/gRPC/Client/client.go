package main

import (
	pb "Proyecto2/Client/grpcClient"
	"context"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
)

var ctx = context.Background()

type Data struct {
	Carnet   int32
	Nombre   string
	Curso    string
	Nota     int32
	Semestre string
	Year     int32
}

func insertData(c *fiber.Ctx) error {
	var data = Data{}
	e := c.BodyParser(&data)
	if e != nil {
		return e
	}
	/*
		nota := Data{
			Carnet:   data["carnet"],
			Nombre:   data["nombre"],
			Curso:    data["curso"],
			Nota:     data["nota"],
			Semestre: data["semestre"],
			Year:     data["year"],
		}
	*/

	go sendMysqlServer(data)

	return nil
}

func sendMysqlServer(nota Data) {
	conn, err := grpc.Dial("grpc-server:3001", grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock())
	if err != nil {
		log.Fatalln(err)
	}

	cl := pb.NewGetInfoClient(conn)
	defer func(conn *grpc.ClientConn) {
		err := conn.Close()
		if err != nil {
			log.Fatalln(err)
		}
	}(conn)

	ret, err := cl.ReturnInfo(ctx, &pb.RequestId{
		Carnet:   nota.Carnet,
		Nombre:   nota.Nombre,
		Curso:    nota.Curso,
		Nota:     nota.Nota,
		Semestre: nota.Semestre,
		Year:     nota.Year,
	})
	if err != nil {
		log.Fatalln(err)
	}

	fmt.Println("Respuesta del server " + ret.GetInfo())
}

func main() {
	app := fiber.New()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"res": "todo bien",
		})
	})
	app.Post("/insert", insertData)

	err := app.Listen(":3000")
	if err != nil {
		return
	}
}
