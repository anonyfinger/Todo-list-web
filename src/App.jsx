import "./App.scss";
import { useState, useRef, useEffect } from "react";

function App() {
  const [isLoading, data] = useFetch("http://localhost:3000/todo");
  const [todo, setTodo] = useState([]);
  const [currentTodo, setCurrentTodo] = useState(null);
  const [time, setTime] = useState(0);
  const [isTimer, setIsTimer] = useState(false);

  useEffect(() => {
    if (currentTodo) {
      fetch(`http://localhost:3000/todo/${currentTodo}`, {
        method: "PATCH",
        body: JSON.stringify({
          time: todo.find((el) => el.id === currentTodo).time + 1,
        }),
      })
        .then((res) => res.json())
        .then((res) =>
          setTodo((prev) =>
            prev.map((el) => (el.id === currentTodo ? res : el))
          )
        );
    }
  }, [time]);

  useEffect(() => {
    setTime(0);
  }, [isTimer]);

  useEffect(() => {
    if (data) setTodo(data);
  }, [isLoading]);

  return (
    <div className="app">
      <header>
        <h1 className="title">TODO LIST</h1>
      <Clock />

      </header>

      <section className="advice-section">
        <Advice />
      </section>
      <main>
        <section className="timer-section">
          <div className="mode-indicator">
            {isTimer ? "타이머" : "스톱워치"}
          </div>
          {isTimer ? (
            <Timer
              time={time}
              setTime={setTime}
              toggleMode={() => setIsTimer(false)}
            />
          ) : (
            <Stopwatch
              time={time}
              setTime={setTime}
              toggleMode={() => setIsTimer(true)}
            />
          )}
        </section>
        <section className="todo-section">
          <TodoInput setTodo={setTodo} />
          <TodoList
            todo={todo}
            setTodo={setTodo}
            setCurrentTodo={setCurrentTodo}
            currentTodo={currentTodo}
          />
        </section>
      </main>
    </div>
  );
}

// 명언

const useFetch = (url) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch(url)
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setIsLoading(false);
      });
  }, [url]);
  return [isLoading, data];
};

const Advice = () => {
  const [isLoading, data] = useFetch(
    "https://korean-advice-open-api.vercel.app/api/advice"
  );
  return (
    <>
      {!isLoading && (
        <>
          <div className="advice">{data.message}</div>
          <div className="author">- {data.author} -</div>
        </>
      )}
    </>
  );
};

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="clock-box">
      <span className="clock">{time.toLocaleTimeString()}</span>
    </div>
  );
};

//타이머 함수
const formatTime = (seconds) => {
  const timeString = `${String(Math.floor(seconds / 3600)).padStart(
    2,
    "0"
  )}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, "0")}:${String(
    Math.floor(seconds % 60)
  ).padStart(2, "0")}`;
  return timeString;
};

// Stopwatch

const Stopwatch = ({ time, setTime, toggleMode }) => {
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOn === true) {
      const timerId = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
      timerRef.current = timerId;
    } else {
      clearInterval(timerRef.current);
    }
  }, [isOn]);

  return (
    <div className="stopwatch-container">
      <div className="time-display">{formatTime(time)}</div>
      <div className="controls">
        <button className="toggle-mode" onClick={toggleMode}>
          타이머로 변경
        </button>
        <button className="start-stop" onClick={() => setIsOn((prev) => !prev)}>
          {isOn ? "종료" : "시작"}
        </button>
        <button
          className="reset"
          onClick={() => {
            setTime(0);
            setIsOn(false);
          }}
        >
          리셋
        </button>
      </div>
    </div>
  );
};

// Timer
const Timer = ({ time, setTime, toggleMode }) => {
  const [startTime, setStartTime] = useState(0);
  const [isOn, setIsOn] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isOn && time > 0) {
      const timerId = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
      timerRef.current = timerId;
    } else if (!isOn || time === 0) {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isOn, time]);

  return (
    <div className="timer-container">
      <div className="time-display">
        남은 시간: {time ? formatTime(time) : formatTime(startTime)}
      </div>
      <div className="controls">
        <button className="toggle-mode" onClick={toggleMode}>
          스톱워치로 변경
        </button>
        <button
          className="start-stop"
          onClick={() => {
            if (!isOn) {
              setIsOn(true);
              setTime(time ? time : startTime);
              setStartTime(0);
            } else {
              setIsOn(false);
            }
          }}
        >
          {isOn ? "정지" : "시작"}
        </button>
        <button
          className="reset"
          onClick={() => {
            setTime(0);
            setIsOn(false);
          }}
        >
          리셋
        </button>
      </div>
      <div className="time-set">
        <label htmlFor="timeInput">설정:</label>
        <input
          id="timeInput"
          type="number"
          value={startTime}
          min="0"
          max="3600"
          step="30"
          onChange={(event) => setStartTime(Number(event.target.value))}
        />
        <span>초</span>
        <div className="preset-buttons">
          <button className="preset-button" onClick={() => setStartTime(60)}>
            1분
          </button>
          <button className="preset-button" onClick={() => setStartTime(600)}>
            10분
          </button>
          <button className="preset-button" onClick={() => setStartTime(1800)}>
            30분
          </button>
          <button className="preset-button" onClick={() => setStartTime(3600)}>
            1시간
          </button>
        </div>
      </div>
    </div>
  );
};

const TodoInput = ({ setTodo }) => {
  const inputRef = useRef(null);

  const handleInputChange = () => {
    inputRef.current.classList.remove("error");
    inputRef.current.style.color = "white";
  };

  const addTodo = () => {
    const newTodo = inputRef.current.value.trim();
    if (newTodo === "") {
      inputRef.current.value = "";
      inputRef.current.placeholder = "입력 후 추가해주세요";
      inputRef.current.classList.add("error");
      setTimeout(() => {
        inputRef.current.placeholder = "할 일을 입력하세요";
        inputRef.current.classList.remove("error");
      }, 3000);
      return;
    }
    inputRef.current.placeholder = "할 일을 입력하세요";
    inputRef.current.classList.remove("error");
    inputRef.current.style.color = "white";
    fetch("http://localhost:3000/todo", {
      method: "POST",
      body: JSON.stringify({ content: newTodo, time: 0 }),
    })
      .then((res) => res.json())
      .then((res) => setTodo((prev) => [...prev, res]));
    inputRef.current.value = "";
  };

  return (
    <div className="todo-input">
      <input
        ref={inputRef}
        className="todo-input-field"
        placeholder="할 일을 입력하세요"
        onChange={handleInputChange}
      />
      <button className="add-todo" onClick={addTodo}>
        추가
      </button>
    </div>
  );
};

const TodoList = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
    <ul className="todo-list">
      {todo.map((el) => (
        <Todo
          key={el.id}
          todo={el}
          setTodo={setTodo}
          currentTodo={currentTodo}
          setCurrentTodo={setCurrentTodo}
        />
      ))}
    </ul>
  );
};

const Todo = ({ todo, setTodo, setCurrentTodo, currentTodo }) => {
  return (
    <li className={currentTodo === todo.id ? "todo-item current" : "todo-item"}>
      <div className="todo-content">
        {todo.content}
        <br />
        {formatTime(todo.time)}
      </div>
      <div className="todo-actions">
        <button className="start-todo" onClick={() => setCurrentTodo(todo.id)}>
          시작하기
        </button>
        <button
          className="delete-todo"
          onClick={() => {
            fetch(`http://localhost:3000/todo/${todo.id}`, {
              method: "DELETE",
            }).then((res) => {
              if (res.ok) {
                setTodo((prev) => prev.filter((el) => el.id !== todo.id));
              }
            });
          }}
        >
          삭제
        </button>
      </div>
    </li>
  );
};

export default App;
