package main

import (
	pb "Proyecto2/Server/grpcServer"
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"

	_ "github.com/go-sql-driver/mysql"
	"github.com/joho/godotenv"
	"google.golang.org/grpc"
)

var conexion = mysqlConnect()

type server struct {
	pb.UnimplementedGetInfoServer
}

const (
	port = ":3001"
)

type Data struct {
	Carnet   string
	Nombre   string
	Curso    string
	Nota     string
	Semestre string
	Year     string
}

func mysqlConnect() *sql.DB {

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")

	connString := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", dbUser, dbPassword, dbHost, dbPort, dbName)

	//connString := "root:secret@tcp(localhost:3306)/tarea3_db?parseTime=true" -> Estructura final del string
	conexion, err := sql.Open("mysql", connString)
	if err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("Conexion con MySQL Correcta")
	}
	return conexion
}

func (s *server) ReturnInfo(ctx context.Context, in *pb.RequestId) (*pb.ReplyInfo, error) {
	fmt.Println("Recibí de cliente: ", in.GetCarnet())
	data := Data{
		Carnet:   in.GetCarnet(),
		Nombre:   in.GetNombre(),
		Curso:    in.GetCurso(),
		Nota:     in.GetNota(),
		Semestre: in.GetSemestre(),
		Year:     in.GetYear(),
	}
	insertMysql(data)
	return &pb.ReplyInfo{Info: "Hola cliente, recibí el comentario"}, nil
}

func insertMysql(rank Data) {
	query := `INSERT INTO notas (carnet,nombre,curso,nota,semestre,year) VALUES (?,?,?,?,?,?);`
	_, err := conexion.Exec(query, rank.Carnet, rank.Nombre, rank.Curso, rank.Nota, rank.Semestre, rank.Year)
	if err != nil {
		fmt.Println(err)
	}
	//fmt.Println(result)

}

//func getData(c *fiber.Ctx) error {
//	key := c.Params("key")
//
//	dataRet, _ := rdb.HGetAll(ctx, key).Result()
//	return c.JSON(fiber.Map{
//		"res": dataRet,
//	})
//}

func main() {
	listen, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalln(err)
	}
	s := grpc.NewServer()
	pb.RegisterGetInfoServer(s, &server{})

	mysqlConnect()

	if err := s.Serve(listen); err != nil {
		log.Fatalln(err)
	}
}
