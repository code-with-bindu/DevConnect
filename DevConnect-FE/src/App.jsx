import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import { Provider } from "react-redux";
import appStore from "./utils/appStore";
import Feed from "./components/Feed";
import Body from "./components/Body";
import Connections from "./components/Connections";
import Requests from "./components/Requests";
import Chat from "./components/Chat";
import Notifications from "./components/Notifications";
import Projects from "./components/Projects";

function App() {
  return (
    <Provider store={appStore}>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Body />}>
            <Route index element={<Feed />} />
            <Route path="feed" element={<Feed />} />
            <Route path="login" element={<Login />} />
            <Route path="profile/view" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="user/connections" element={<Connections />} />
            <Route path="user/requests/received" element={<Requests />} />
            <Route path="chat/:userId" element={<Chat />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="projects" element={<Projects />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
