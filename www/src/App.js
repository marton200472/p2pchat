import './App.css';
import { Call } from "./Call";
import {
  BrowserRouter,
  Route,
  Routes
} from "react-router-dom";

function App() {

  return (
    <BrowserRouter basename="">
      <Routes>
        <Route path="/" element={<Call></Call>}/>
        <Route path="/:roomName" element={<Call/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
