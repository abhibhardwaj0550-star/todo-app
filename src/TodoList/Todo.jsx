import React, { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { v4 as uuidv4 } from 'uuid';

function Todo() {
  const [todo, settodo] = useState("")
  const [todos, settodos] = useState([])
  const [showFinished, setshowFinished] = useState(false)

  console.log("todos", todos)

  useEffect(() => {
    let todostring = localStorage.getItem("todos")
    if (todostring) {
      settodos(JSON.parse(todostring))
    }
  }, [])

  const saveTols = (newTodos) => {
    localStorage.setItem("todos", JSON.stringify(newTodos))
  }

  const toggleFinished = () => {
    setshowFinished(!showFinished)
  }

  const handleEdit = (e, id) => {
    let t = todos.find(i => i.id === id)
    settodo(t.todo)
    let newTodos = todos.filter(item => item.id !== id)
    settodos(newTodos)
    saveTols(newTodos)
  }

  const handleDelete = (e, id) => {
    let newTodos = todos.filter(item => item.id !== id)
    settodos(newTodos)
    saveTols(newTodos)
  }

  const handleAdd = () => {
    if (!todo.trim()) return;
    let newTodos = [...todos, { id: uuidv4(), todo, iscompleted: false }]
    settodos(newTodos)
    settodo("")
    saveTols(newTodos)
  }

  const handleChange = (e) => {
    settodo(e.target.value)
  }

  const handleCheckbox = (e) => {
    let id = e.target.name;
    let index = todos.findIndex(item => item.id === id)
    let newTodos = [...todos];
    newTodos[index].iscompleted = !newTodos[index].iscompleted;
    settodos(newTodos)
    saveTols(newTodos)
  }

  return (
    <div>
      <Navbar />
      <div className=" mx-3 container md:mx-auto my-5 rounded-xl p-5 bg-violet-100 min-h-[80vh] w-1/2">
        <h1 className='font-bold text-center text-4xl'>iTask - Manage your todo at one place</h1>

        <div className="addTodo my-5 flex-col gap-4 ">
          <h2 className='text-lg font-bold'>Add a Todo</h2>
          <div className='flex' >
            <input onChange={handleChange} value={todo} type="text" className='w-full rounded-full px-5 py-2 border-1 bg-white shadow-black' />
            <button
              onClick={handleAdd}
              disabled={todo.length <= 3}
              className='bg-violet-800 mx-2 rounded-full hover:bg-violet-950 disabled:bg-violet-700 p-2 py-1 text-sm font-bold text-white'>
              Save
            </button>
          </div>

        </div>

        <input onChange={toggleFinished} type="checkbox" checked={showFinished} /> Show Finished

        <h2 className='text-lg font-bold mt-3'>Your Todos</h2>
        <div className='todos'>
          {todos.length === 0 && <div className='m-5'>No todos to display</div>}
          {todos.map(item => {
            return (!showFinished || item.iscompleted) && (
              <div key={item.id} className='todo flex md:w-1/2 my-3 justify-between'>
                <div className='flex gap-5'>
                  <input name={item.id} onChange={handleCheckbox} type="checkbox" checked={item.iscompleted} />
                  <div className={item.iscompleted ? "line-through" : ""}>{item.todo}</div>
                </div>
                <div className="buttons flex h-full">
                  <button onClick={(e) => handleEdit(e, item.id)} className='bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1'>Edit</button>
                  <button onClick={(e) => handleDelete(e, item.id)} className='bg-violet-800 hover:bg-violet-950 p-2 py-1 text-sm font-bold text-white rounded-md mx-1'>Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Todo
