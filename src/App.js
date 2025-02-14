import React, { useState } from 'react';

function App() {
  const [todo, setTodo] = useState('');
  const [warning, setWarning] = useState('');

  const addTodo = () => {
    if (todo.trim() === '') {
      setWarning('할 일을 입력하세요.');
      return;
    }
    setWarning('');
    // ...existing code...
  };

  return (
    <div className="app">
      <div className="todo-input">
        <input
          type="text"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
        />
        <button className="add-todo" onClick={addTodo}>추가</button>
      </div>
      {warning && <div className="warning">{warning}</div>}
      // ...existing code...
    </div>
  );
}

export default App;
