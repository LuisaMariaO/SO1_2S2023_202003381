import "./App.css";
import io from "socket.io-client";
import { useEffect, useState } from "react";

const socket = io.connect("http://localhost:3001");

function App() {
  

  // Messages States
  const [music, setMusic] = useState([]);



  useEffect(() => {
    socket.on("receive_music", (data) => {
      console.log(data)
      setMusic(data)
    });
  }, [socket]);
  return(
  <pre>{JSON.stringify({music}, null, 2)}</pre>
  )
}

export default App;