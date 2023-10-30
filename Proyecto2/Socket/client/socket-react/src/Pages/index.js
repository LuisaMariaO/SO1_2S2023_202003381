import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
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


const socket = io.connect("http://localhost:3021");
function Index() {
  const [registros, setRegistros] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [semestres, setSemestres] = useState([]);

  const [cursog1, setCursog1] = useState("");
  const [semestreg1, setSemestreg1] = useState("");

  const [aprobados, setAprobados] = useState([]);


  const [promedios, setPromedios] = useState([]);

  const [alumnos, setAlumnos] = useState([]);

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
    labels: promedios.map((obj) => obj.nombre),
    datasets: [{
      label: "Promedio",
      data: promedios.map((obj) => obj.promedio),
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
    labels: alumnos.map((obj) => obj.curso),
    datasets: [{
      label: "Promedio",
      data: alumnos.map((obj) => obj.cantidad),
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
   

    socket.emit("enviarSemestreG2", event.target.value);

    socket.on("respuestaSemestreG2", (respuesta) => {
      setPromedios(respuesta)
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
    socket.on('database-update', (newData) => {
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
      <a class="navbar-brand" href=""><h2>SO1 - Proyecto 2</h2></a>
      
      
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0 ">
        
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href=""><h5>Tiempo real</h5></a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="" ><h5>Redis</h5></a>
        </li>
      </ul>
      </div>
      
    
  </div>
</nav>

      <h2>MYSQL</h2>
      <div class="container">
        <div class="row">
          <div class ="col">
          <div style={{ height: "350px", overflowY:"auto" }}>
          <DataTable
            title={"Datos Almacenados"}
            columns={columns}
            data={registros}
            responsive={true}
            fixedHeaderScrollHeight={"100%"}
            fixedHeader
           
        />
        </div>
          </div>
        </div>
        <br></br>
        <div class="row">
          <div class="col">
            <h5>Porcentaje de aprobación de curso</h5>
            <div style={{display:"flex"}}>
            <select class="form-select" aria-label="Default select example" style={{width:"48%"}} onChange={handleG1}>
              <option value={"*"} selected={true} disabled={true}>Curso</option>
            {cursos.map((item) => (
            <option value={item.curso}>{item.curso}</option>
          ))}
          </select>
          <select class="form-select" aria-label="Default select example"style={{width:"48%"}} onChange={handleG11}>
          <option value={"*"} selected={true} disabled={true}>Semestre</option>
            {semestres.map((item) => (
            <option value={item.semestre}>{item.semestre}</option>
          ))}
          </select>
          </div>
          <Pie options={optionsG1} data = {dataG1}/>
          </div>
          
          <div class="col">
          <h5>Alumnos con mejor promedio</h5>
          <select class="form-select" aria-label="Default select example" onChange={handleG2}>
              <option value={"*"} selected={true}>Semestre</option>
            {semestres.map((item) => (
            <option value={item.semestre}>{item.semestre}</option>
          ))}
          </select>
        
          <Bar options={optionsG2} data={dataG2} style={{height:'80%'}}></Bar>
        
          </div>

          <div class="col">
          <h5>Cursos con mayor número de alumnos</h5>
          <select class="form-select" aria-label="Default select example" onChange={handleG3}>
              <option value={"*"} selected={true}>Semestre</option>
            {semestres.map((item) => (
            <option value={item.semestre}>{item.semestre}</option>
          ))}
          </select>
          <Bar options={optionsG3} data={dataG3} style={{height:'80%'}}></Bar>
          </div>

        </div>

      </div>
      </>
    );
  }
  
  export default Index;