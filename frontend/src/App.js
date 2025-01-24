import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import VerifyCode from './components/verifyCode';
import VerifyLogin from './components/VerifyLogin';
import Profile from './components/Profile';
import UpdateProfile from './components/UpdateProfile';
import Myposts from './components/Myposts';
import Activity from './components/Activity';
import News from './components/News';
import useTokenExpirationCheck from "./components/useTokenExpirationCheck";
import Mycircle from './components/Mycircle';
import Notification from './components/Notification';
import Friends from './components/Friends';
import StoryFeed from './components/StoryFeed';
import About from './components/About';
import Favourites from './components/Favourites';
import ResponsiveChat from './components/ResponsiveChat';
import Forgetpassword from './components/Forgetpassword';
import VerifyPassword from './components/VerifyPassword';
import Changepassword from './components/Changepassword';
import Settings from './components/Settings';

import StarPostFetch from './StarPostFetch';
function App() {

  useTokenExpirationCheck();
  
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyCode />} />
          <Route path="/verify-login" element={<VerifyLogin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/updateprofile" element={<UpdateProfile />} />
          <Route path="/myposts" element={<Myposts />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/news" element={<News />} />         
          <Route path="/search" element={<Friends />} />
          <Route path="/circle" element={<Mycircle />} />
          <Route path="/chatroom" element={<ResponsiveChat />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/storyfeed" element={<StoryFeed />} />
          <Route path="/aboutus" element={<About />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/forgetpassword" element={<Forgetpassword />} />
          <Route path="/verify-password" element={<VerifyPassword />} />
          <Route path="/change-password" element={<Changepassword />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/starpost" element={<StarPostFetch />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;
