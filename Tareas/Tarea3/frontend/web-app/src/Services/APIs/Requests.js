import axios from 'axios'

const instance = axios.create(
    {
        baseURL: 'http://localhost:8000', //Cambiar ip si es necesario
        timeout: 100000,
        headers:{
            'Content-Type':'application/json'
        }
    }
)


export const postMusic = async(titulo,artista,ano,genero) =>{
    const { data } = await instance.post("/reg", { title:titulo, artist:artista, year:ano, genre:genero })
    return data
}


export const getMusic = async() =>{
    const { data } = await instance.get("/music")
    return {data:data}
}