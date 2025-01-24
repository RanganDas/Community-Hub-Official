import { useState } from "react";
import "./App.js"
import "./StarPostFetch.css"


const StarPostFetch = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = "https://jsonplaceholder.typicode.com/posts";
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const responce = fetch(API_URL);
        if (!responce.ok) {
          console.log("Error fetching posts");
        } else {
          const data = await responce.json();
          setPosts(data);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message);
    
      }
    };
  });


 return(
    <div className="container">
        <h1>The List</h1>
        {posts.map((post)=>{
            <div key={post.id} className="post-card">
                <h1 style={{ color:"black"}}>post.userId</h1>
                <h1 style={{ color:"black"}}>post.id</h1>
                <h1 style={{ color:"black"}}>post.title</h1>
                <h1 style={{ color:"black"}}>post.body</h1>
            </div>
        })}
    </div>
 )

};

export default StarPostFetch;
