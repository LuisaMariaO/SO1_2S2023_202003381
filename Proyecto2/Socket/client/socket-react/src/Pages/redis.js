import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import icon from './icon.png'
import io from "socket.io-client";
import {Chart, ArcElement} from 'chart.js'
import {Pie,Bar} from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);
Chart.register(ArcElement)


const socket = io.connect("http://34.171.248.252:3021");
function Redis() {
  const [registros, setRegistros] = useState(0);
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);

  const [cursog1, setCursog1] = useState("");
  const [semestreg1, setSemestreg1] = useState("");

  const [aprobados, setAprobados] = useState([]);


  const [promedios, setPromedios] = useState([]);

  const [alumnos, setAlumnos] = useState({});

  const navigate = useNavigate()

    //Columas Para la tabla
    const columns = [
      {
          name: 'Carnet',
          selector: row => row.carnet,
      },
      {
          name: 'Nombre',
          selector: row => row.nombre,
      },
      {
        name: 'Curso',
        selector: row => row.curso,
      },
      {
        name: 'Nota',
        selector: row => row.nota,
      },
      {
        name: 'Semestre',
        selector: row => row.semestre,
      },
      {
        name: 'Año',
        selector: row => row.year,
      },
  ];
   
  const dataG1 = {
    labels: ["Aprobados", "Reprobados"],
    datasets: [{
      label: ["Alumnos"],
      data: [aprobados[0],aprobados[1]],
      backgroundColor: [
        '#0CBE07',
        '#F84F31',
        
      ],
      
    }]
  }
  
  const optionsG1 = {
    responsive:true,
    animation:false,
    plugins: {
      legend: {
        position: 'top',
      },
     
  }
  }

  const dataG2 = {
    labels: Object.keys(alumnos),
    datasets: [{
      label: "Promedio",
      data: Object.values(alumnos),
      backgroundColor: [
        '#581845',
        '#900C3F',
        '#C70039 ',
        '#CD5C5C',
        '#F08080'
        
      ],
      
    }]
  }
  
  const optionsG2 = {
    responsive:true,
    animation:false,
    plugins: {
      legend: {
        display:false,
      },
     
  }
    
  }

const dataG3 = {
    labels: [],
    datasets: [{
      label: "Promedio",
      data: [],
      backgroundColor: [
        '#154360',
        '#1F618D',
        '#2980B9',
        
      ],
      
    }]
  }
  
  const optionsG3 = {
    responsive:true,
    animation:false,
    plugins: {
      legend: {
        display:false,
      },
     
  }
}
  const handleG1 = (event) =>{
    event.preventDefault();
    setCursog1(event.target.value)

    socket.emit("enviarCursoG1", [event.target.value,semestreg1]);

    socket.on("respuestaCursoG1", (respuesta) => {
      setAprobados(respuesta)
    });
  };
  
  const handleG11 = (event) =>{
    event.preventDefault();
    setSemestreg1(event.target.value)

    socket.emit("enviarSemestreG1", [cursog1,event.target.value]);

    socket.on("respuestaSemestreG1", (respuesta) => {
      setAprobados(respuesta)
    });
  };

  const handleG2 = (event) =>{
    event.preventDefault();
   

    socket.emit("enviarGraficaRedis", event.target.value);

    socket.on("respuestaGraficaRedis", (respuesta) => {
        console.log(respuesta)
      setAlumnos(respuesta)
    });
  };

  const handleG3 = (event) =>{
    event.preventDefault();
   

    socket.emit("enviarSemestreG3", event.target.value);

    socket.on("respuestaSemestreG3", (respuesta) => {
      setAlumnos(respuesta)
    });
  };

  useEffect(() => {
    socket.on('redis-update', (newData) => {
        console.log(newData)
      setRegistros(newData);
    });
    socket.on('cursos-update', (newData) => {
      setCursos(newData);
    });
    socket.on('semestres-update', (newData) => {
      setSemestres(newData);
    });
    /*
    return () => {
      socket.disconnect();
    };
    */
  }, []);
    return (
      <>
    
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
  <div class="container-fluid">
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo01" aria-controls="navbarTogglerDemo01" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarTogglerDemo01">
        <img src={icon} style={{width:"6%"}}></img> &nbsp; &nbsp;
      <a class="navbar-brand" href="" onClick={()=>navigate("/")}><h2>SO1 - Proyecto 2</h2></a>
      
      
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ">
        
        <li class="nav-item">
          <a class="nav-link" aria-current="page" href=""onClick={()=>navigate("/")}><h5>Tiempo real</h5></a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" href="" onClick={()=>navigate("/redis")}><h5>Redis</h5></a>
        </li>
      </ul>
      </div>
      
    
  </div>
</nav>
<h2>Redis</h2>
    <div class="container">
        <div class="row">
            <div class="col">
            
            </div>
            <div class="col">
                
            </div>
            <div class="col">
            <h3>Cantidad de datos: {registros}</h3>
            </div>
        </div>
    </div>
      
      
      <div class="container">
        <div class="row">
          <div class ="col">
          
          </div>
        </div>
        <br></br>
        <div class="row">
          <div class="col">
          
          </div>
          
          <div class="col">
          <h5>Cantidad de alumnos en cada curso</h5>
          <select class="form-select" aria-label="Default select example" onChange={handleG2}>
              <option value={"*"} selected={true}>Semestre</option>
            {semestres.map((item) => (
            <option value={item.semestre}>{item.semestre}</option>
          ))}
          </select>
        
          <Bar options={optionsG2} data={dataG2} style={{height:'80%'}}></Bar>
        
          </div>

          <div class="col">
          
          </div>

        </div>

      </div>
      </>
    );
  }
  
  export default Redis;