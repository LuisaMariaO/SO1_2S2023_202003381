import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import React, { useState, useEffect, useMemo } from "react";
import Service  from "./Services/Service";
import DataTable from 'react-data-table-component'


 
 

function App() {
  

  
  //Variables
  const [title, setTitle] = useState(""); 
  const [artist, setArtist] = useState(""); 
  const [year, setYear] = useState("");
  const [genre, setGenre] = useState("");
  //Para la tabla
  const columns = [
    {
        name: 'ID',
        selector: row => row.id,
    },
    {
        name: 'Título',
        selector: row => row.title,
    },
    {
      name: 'Año',
      selector: row => row.year,
    },
    {
      name: 'Género',
      selector: row => row.genre,
    },
];
  
       


  const [music,setMusic] = useState([])
  //Eventos para manejar el cambio de valor de las variables
  const handleChangeTitle = (event) => {
    setTitle(event.target.value)
  };
  const handleChangeArtist= (event) => {
    setArtist(event.target.value)
  };
  const handleChangeYear = (event) => {
    setYear(event.target.value)
  };
  const handleChangeGenre = (event) => {
    setGenre(event.target.value)
  };
  //Evento para enviar al servidor
  const handleSubmit = (event) => {
    event.preventDefault();
   
    Service.postMusic(title,artist,year,genre)
    .then(({data}) => {
      
      Service.getMusic()
      .then(({data}) => {
        setMusic(data)
        
      
     
      
    });
   
    
  });

    setTitle("")
    setArtist("")
    setYear("")
    setGenre("")
  
  };

  //Peticion al cargar la pagina
  useEffect(() => {
    Service.getMusic()
    .then(({data}) => {
      setMusic(data)
      
    
   
    
  });
  console.log(music)
  }, []);

  return (
    <>
    <nav class="navbar navbar-dark bg-dark"> &nbsp;
    <div class="container-fluid">
    <a class="navbar-brand" href="/">Sistemas Operativos - Tarea 3</a>
    <span class="navbar-text">
      Luisa María Ortíz Romero - 202003381
    </span>
    </div>
    </nav>
    <br></br> <br></br>
    <div class="container-fluid px-5">
      
      <div class="row">
      
        <div class="col border border-success rounded" >
        <h3>Ingreso de datos</h3>

        <form onSubmit={handleSubmit}>
        <div class="mb-3">
        <label for="title" class="form-label">Título</label>
        <input type="text" class="form-control" id="title" placeholder="Abbey Road" onChange={handleChangeTitle} value={title}/>
      </div>

      <div class="mb-3">
        <label for="artist" class="form-label">Artista</label>
        <input type="text" class="form-control" id="artist" placeholder="The Beatles" onChange={handleChangeArtist} value={artist}/>
      </div>


        <div class="mb-3">
        <label for="year" class="form-label">Año de publicación</label>
        <input type="text" class="form-control" id="year" placeholder="1969" onChange={handleChangeYear} value={year}/>
      </div>

      <div class="mb-3">
        <label for="genre" class="form-label">Género</label>
        <input type="text" class="form-control" id="genre" placeholder="Rock" onChange={handleChangeGenre} value = {genre}/>
      </div>
      <button type="submit" class="btn btn-success">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-music-note-list" viewBox="0 0 16 16">
      <path d="M12 13c0 1.105-1.12 2-2.5 2S7 14.105 7 13s1.12-2 2.5-2 2.5.895 2.5 2z"/>
      <path fill-rule="evenodd" d="M12 3v10h-1V3h1z"/>
      <path d="M11 2.82a1 1 0 0 1 .804-.98l3-.6A1 1 0 0 1 16 2.22V4l-5 1V2.82z"/>
      <path fill-rule="evenodd" d="M0 11.5a.5.5 0 0 1 .5-.5H4a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 7H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5zm0-4A.5.5 0 0 1 .5 3H8a.5.5 0 0 1 0 1H.5a.5.5 0 0 1-.5-.5z"/>
    </svg> &nbsp;
        Ingresar</button>
      <br></br>
        </form>
        <br></br>
        </div>

        <div class="col">
        <DataTable
            columns={columns}
            data={music}
        />
        </div>
      </div>
    </div>
   </>
  );
}

export default App;
