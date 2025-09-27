import { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const [streak, setStreak] = useState(
    parseInt(localStorage.getItem("streak") || "0")
  );
  const [lastCompleteDate, setLastCompleteDate] = useState(
    localStorage.getItem("lastCompleteDate") || null
  );

  // ------------------ AUTH ------------------
  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(email);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
    } else {
      alert(data.msg || data.error || "Signup failed");
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(email);
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.7 } });
      } else {
        alert(data.msg || data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setTodos([]);
  };

  // ------------------ TODOS ------------------
  const fetchTodos = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/api/todos", {
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      setTodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch todos error:", err);
    }
  };

  const addTodo = async () => {
    if (!newTodo.trim()) return;
    await fetch("http://localhost:5000/api/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title: newTodo }),
    });
    setNewTodo("");
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    fetchTodos();
  };

  const toggleComplete = async (id, completed) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ completed: !completed }),
    });
    fetchTodos();

    if (!completed) {
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.8 } });

      const today = new Date().toDateString();
      if (lastCompleteDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastCompleteDate === yesterday.toDateString()) {
          setStreak(streak + 1);
          localStorage.setItem("streak", streak + 1);
        } else {
          setStreak(1);
          localStorage.setItem("streak", "1");
        }
        setLastCompleteDate(today);
        localStorage.setItem("lastCompleteDate", today);
      }
    }
  };

  const saveEdit = async (id) => {
    await fetch(`http://localhost:5000/api/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ title: editText }),
    });
    setEditingId(null);
    setEditText("");
    fetchTodos();
  };

  // ------------------ DRAG & DROP ------------------
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(todos);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setTodos(reordered);
  };

  // ------------------ EFFECTS ------------------
  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ------------------ UI ------------------
  if (!token) {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden px-4"
        style={{
          background: `radial-gradient(
            600px at ${mousePosition.x}px ${mousePosition.y}px,
            rgba(59,130,246,0.15),
            transparent 80%
          ), #111827`,
        }}
      >
        <section className="w-full max-w-sm bg-gray-800 text-gray-200 p-8 rounded-xl shadow-lg border border-gray-700 space-y-5">
          <h1 className="text-3xl font-bold text-center text-blue-400">
            {isLogin ? "Login" : "Signup"}
          </h1>

          {!isLogin && (
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 w-full border border-gray-600 rounded bg-gray-900 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 w-full border border-gray-600 rounded bg-gray-900 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 w-full border border-gray-600 rounded bg-gray-900 text-gray-200 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            onClick={isLogin ? handleLogin : handleSignup}
            className="w-full py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Signup"}
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-400 hover:text-gray-200 underline text-center cursor-pointer"
          >
            {isLogin ? "Need an account? Signup" : "Have an account? Login"}
          </p>
        </section>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col text-gray-200 relative"
      style={{
        background: `radial-gradient(
          800px at ${mousePosition.x}px ${mousePosition.y}px,
          rgba(59,130,246,0.1),
          transparent 80%
        ), #111827`,
      }}
    >
      {/* HEADER */}
      <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center p-4">
          <h1 className="text-2xl font-bold text-blue-400 flex items-center gap-2">
            🚀 My To-Do List
          </h1>
          <nav className="space-x-4">
            <a href="#" className="hover:text-blue-300">Home</a>
            <a href="#" className="hover:text-blue-300">Projects</a>
            <a href="#" className="hover:text-blue-300">Contact</a>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1 flex max-w-6xl mx-auto w-full p-6 gap-6">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-1/4 bg-gray-800 rounded-lg p-4 shadow-lg border border-gray-700">
          <h2 className="text-lg font-semibold mb-4 text-blue-300">My Projects</h2>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="https://github.com/yourusername/project1" className="block p-2 rounded bg-gray-700 hover:bg-blue-600 transition">
                📚 My Portfolio
              </a>
            </li>
            <li>
              <a href="https://github.com/yourusername/project2" className="block p-2 rounded bg-gray-700 hover:bg-blue-600 transition">
                📝 BlogApp
              </a>
            </li>
            <li>
              <a href="https://github.com/yourusername/project3" className="block p-2 rounded bg-gray-700 hover:bg-blue-600 transition">
                📊 AmazonProductSummarizer
              </a>
            </li>
          </ul>
        </aside>

        {/* TODO LIST */}
        <section className="flex-1 bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
          <div className="flex flex-col justify-between items-center mb-4">
            <p>Welcome, {user}!</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>

          {/* Input */}
          <div className="flex mb-6 shadow rounded overflow-hidden">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              className="px-4 py-2 w-full bg-gray-900 text-gray-200 focus:outline-none"
              placeholder="Enter a task..."
            />
            <button
              onClick={addTodo}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add
            </button>
          </div>

          {/* Todo List */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="todos">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {todos.length > 0 ? (
                    todos.map((todo, index) => (
                      <Draggable key={todo._id} draggableId={todo._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex justify-between items-center bg-gray-700 p-3 rounded shadow mb-2 hover:scale-[1.01] transition"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleComplete(todo._id, todo.completed)}
                              />
                              {editingId === todo._id ? (
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="bg-gray-600 text-gray-200 border px-2 py-1 rounded"
                                />
                              ) : (
                                <span className={todo.completed ? "line-through text-gray-500" : ""}>
                                  {todo.title}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {editingId === todo._id ? (
                                <button
                                  onClick={() => saveEdit(todo._id)}
                                  className="text-green-400 hover:underline"
                                >
                                  Save
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setEditingId(todo._id);
                                    setEditText(todo.title);
                                  }}
                                  className="text-blue-400 hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                              <button
                                onClick={() => deleteTodo(todo._id)}
                                className="text-red-400 hover:text-red-600"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-gray-500">No todos yet. Add one!</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <p className="mt-4 text-gray-400">
            {todos.filter((t) => !t.completed).length} tasks remaining
          </p>
          <p className="mt-2 text-yellow-400 font-semibold">🔥 {streak} day streak!</p>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center p-4 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} My To-Do App. All rights reserved.</p>
          <div className="space-x-4">
            <a href="https://github.com/yourusername" className="hover:text-blue-400">GitHub</a>
            <a href="https://linkedin.com/in/yourusername" className="hover:text-blue-400">LinkedIn</a>
            <a href="https://twitter.com/yourusername" className="hover:text-blue-400">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
