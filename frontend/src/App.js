import "./App.css";
import { Route } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import VideoPage from "./Pages/VideoPage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chats" component={ChatPage} />
      {/* The :id is crucial here */}
      <Route path="/video/:id" component={VideoPage} />
    </div>
  );
}

export default App;