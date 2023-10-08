import { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

const initialPosts = [
  {
    id: 1,
    text: "Finally got my acceptance to the nursing program :)",
    link: "https://i.redd.it/3t0swz8x81d51.jpg",
    category: "admissions",
    votesUp: 24,
    votesMid: 9,
    votesDown: 4,
  },
  {
    id: 2,
    text: "Pickup Soccer on Alumni Field 6pm Today!",
    link: "https://maps.app.goo.gl/6T2PorfBevRgjvt78",
    category: "event",
    votesUp: 54,
    votesMid: 10,
    votesDown: 6,
  },
  {
    id: 3,
    text: "Anyone else fail the COMP 2540 Midterm...",
    link: "https://media1.giphy.com/media/OBhDa8A9ZBIUU/giphy.gif",
    category: "academics",
    votesUp: 5,
    votesMid: 2,
    votesDown: 10,
  },
];

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <span style={{ fontSize: "40px" }}>{count}</span>
      <button className="btn btn-large" onClick={() => setCount((c) => c + 1)}>
        +1
      </button>
    </div>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function getPosts() {
        setIsLoading(true);

        let query = supabase.from("posts").select("*");

        if (currentCategory !== "all")
          query = query.eq("category", currentCategory);

        const { data: posts, error } = await query
          .order("votesUp", { ascending: false })
          .limit(1000);

        if (!error) setPosts(posts);
        else alert("There was a problem getting data");
        setIsLoading(false);
      }
      getPosts();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewPostForm setPosts={setPosts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />

        {isLoading ? (
          <Loader />
        ) : (
          <PostList posts={posts} setPosts={setPosts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today I Learned";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>{appTitle}</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a post"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "academics", color: "#3b82f6" },
  { name: "social", color: "#16a34a" },
  { name: "advice", color: "#ef4444" },
  { name: "news", color: "#eab308" },
  { name: "event", color: "#db2777" },
  { name: "athletics", color: "#14b8a6" },
  { name: "humour", color: "#f97316" },
  { name: "admissions", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function NewPostForm({ setPosts, setShowForm }) {
  const [text, setText] = useState("");
  // Fixed in a video text overlay
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();
    console.log(text, link, category);

    if (text && isValidHttpUrl(link) && category && textLength <= 200) {
      setIsUploading(true);

      try {
        const { data: newPost, error } = await supabase
          .from("posts")
          .insert([{ text, link, category }])
          .single();

        if (error) {
          throw error;
        }

        if (newPost) {
          setPosts((posts) => [newPost, ...posts]);
          setText("");
          setLink("");
          setCategory("");
          setShowForm(false);
        }
      } catch (error) {
        console.error("Error submitting post:", error);
        alert("Error submitting post. Please try again.");
      }

      setIsUploading(false);
    } else {
      alert("Please ensure all fields are filled correctly.");
    }
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a post with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        value={link}
        type="text"
        placeholder="Trustworthy link..."
        onChange={(e) => setLink(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PostList({ posts, setPosts }) {
  if (posts.length === 0)
    return (
      <p className="message">
        No posts for this category yet! Create the first one ✌️
      </p>
    );

  return (
    <section>
      <ul className="posts-list">
        {posts.map((post) => (
          <Post key={post.id} post={post} setPosts={setPosts} />
        ))}
      </ul>
      <p>There are {posts.length} posts in the database. Add your own!</p>
    </section>
  );
}

function Post({ post, setPosts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  async function handleVote(columnName) {
    const hasVoted = localStorage.getItem(`voted_${post.id}`);

    if (hasVoted) {
      alert("You have already voted on this post.");
      return;
    }

    setIsUpdating(true);
    const { data: updatedPost, error } = await supabase
      .from("posts")
      .update({ [columnName]: post[columnName] + 1 })
      .eq("id", post.id)
      .select();
    setIsUpdating(false);

    if (!error) {
      setPosts((posts) =>
        posts.map((f) => (f.id === post.id ? updatedPost[0] : f))
      );
      localStorage.setItem(`voted_${post.id}`, "true"); // Mark post as voted
    }
  }

  return (
    <li className="post">
      <p>
        {post.text}
        <a className="link" href={post.link} target="_blank">
          (link)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === post.category)
            .color,
        }}
      >
        {post.category}
      </span>
      <div className="vote-buttons">
        <button onClick={() => handleVote("votesUp")} disabled={isUpdating}>
          👍 {post.votesUp}
        </button>
        <button onClick={() => handleVote("votesMeh")} disabled={isUpdating}>
          😐 {post.votesMeh}
        </button>
        <button onClick={() => handleVote("votesDown")} disabled={isUpdating}>
          👎 {post.votesDown}
        </button>
      </div>
    </li>
  );
}

export default App;
