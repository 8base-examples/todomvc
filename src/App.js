import React, { Component } from "react";
import compose from "lodash/flowRight";
import { HashRouter as Router, withRouter, Link } from "react-router-dom";

import "todomvc-app-css/index.css";
import "./App.css";


class Header extends Component {
  state = { text: "" };
  render() {    
    const { onNewTodo } = this.props;
    return (
      <header className="header">
        <h1>todos</h1>
        <input
          className="new-todo"
          onChange={({ target }) =>
            this.setState(({ text }) => ({ text: target.value }))
          }
          onKeyPress={({ key }) => {
            if (key === "Enter") {
              onNewTodo({ text: this.state.text });
              this.setState({ text: "" });
            }
          }}
          value={this.state.text}
          placeholder="What needs to be done?"
        />
      </header>
    );
  }
}

class Main extends Component {
  render() {
    const {
      todos,
      completeAllTodos,
      uncompleteAllTodos,
      toggleTodo,
      removeTodo,
      location
    } = this.props;
    return todos && todos.length ? (
      <section className="main">
        <input
          className="toggle-all"
          type="checkbox"
          onChange={() =>
            todos.some(todo => todo.completed === false)
              ? completeAllTodos()
              : uncompleteAllTodos()
          }
          checked={false}
        />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {todos
            .filter(todo => {
              if (location.pathname === "/completed") {
                return todo.completed;
              }
              if (location.pathname === "/active") {
                return !todo.completed;
              }
              return true;
            })
            .map(todo => (
              <li
                key={todo.id}
                className={todo.completed ? "completed" : undefined}
              >
                <div className="view">
                  <input
                    className="toggle"
                    onChange={() =>
                      toggleTodo({ id: todo.id, completed: !todo.completed })
                    }
                    checked={todo.completed}
                    type="checkbox"
                  />
                  <label>{todo.text}</label>
                  <button
                    onClick={() => removeTodo(todo.id)}
                    className="destroy"
                  />
                </div>
                <input className="edit" onChange={() => {}} value={todo.text} />
              </li>
            ))}
        </ul>
      </section>
    ) : null;
  }
}


Main = compose(
  withRouter
)(Main);

class Footer extends Component {
  render() {
    const { location, todos } = this.props;
    return todos.length ? (
      <footer className="footer">
        <span className="todo-count">
          <strong>0</strong> item left
        </span>
        <ul className="filters">
          <li>
            <Link
              className={location.pathname === "/" ? "selected" : undefined}
              to="/"
            >
              All
            </Link>
          </li>
          <li>
            <Link
              className={
                location.pathname === "/active" ? "selected" : undefined
              }
              to="/active"
            >
              Active
            </Link>
          </li>
          <li>
            <Link
              className={
                location.pathname === "/completed" ? "completed" : undefined
              }
              to="/completed"
            >
              Completed
            </Link>
          </li>
        </ul>
        <button className="clear-completed">Clear completed</button>
      </footer>
    ) : null;
  }
}

Footer = compose(withRouter)(Footer);

class App extends Component {
  constructor() {
    super();
    const todos = [
      {
        id: '1',
        text: 'Todo 1',
        completed: false
      },
      {
        id: '2',
        text: 'Todo 2',
        completed: false
      },
      {
        id: '3',
        text: 'Todo 3',
        completed: true
      }
    ];

    this.state = { todos };
  }

  completeAllTodos = () => {
    const { todos } = this.state;
    todos.forEach((todo) => {
      todo.completed = true;
    });
    this.setState({ todos });
  }

  uncompleteAllTodos = () => {
    const { todos } = this.state;
    todos.forEach((todo) => {
      todo.completed = false;
    });
    this.setState({ todos });
  }

  toggleTodo = ({ id, completed }) => {
    const { todos } = this.state;
    todos.forEach((todo) => {
      if (todo.id === id) {
        todo.completed = completed;
      }
    });
    this.setState({ todos });
  }

  removeTodo = (id) => {
    let { todos } = this.state;
    todos = todos.filter(( todo ) => {
      return todo.id !== id;
    });
    this.setState({ todos });
  }

  onNewTodo = ({ text }) => {
    let { todos } = this.state;
    const lastTodo = todos[todos.length - 1];
    let newTodoId = 1; 
    if (lastTodo) {
      newTodoId = parseInt(lastTodo.id, 10) + 1;
    }
    todos.push({
      id: newTodoId.toString(),
      text,
      completed: false
    });
    this.setState({ todos });
  }

  render() {
    return (
      <Router>    
          <div className="todoapp">
            <Header onNewTodo={ this.onNewTodo } />
            <Main todos={ this.state.todos }
                  completeAllTodos={ this.completeAllTodos }
                  uncompleteAllTodos={ this.uncompleteAllTodos }
                  toggleTodo={ this.toggleTodo }
                  removeTodo={ this.removeTodo } />
            <Footer todos={ this.state.todos } />
          </div>        
      </Router>
    );
  }
}

export default App;
