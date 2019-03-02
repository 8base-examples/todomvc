import React, { Component } from "react";
import compose from "lodash/flowRight";
import { HashRouter as Router, withRouter, Link } from "react-router-dom";

import { EightBaseAppProvider } from '@8base/app-provider';

import gql from "graphql-tag";
import { graphql } from "react-apollo";

import "todomvc-app-css/index.css";
import "./App.css";


const TODO_LIST_QUERY = gql`
  query TodoList {
    todosList(orderBy: [completed_ASC, createdAt_DESC]) {
      items {
        id
        text
        completed
      }
    }
  }
`;

const withTodos = graphql(TODO_LIST_QUERY, {
  props: ({ data: { todosList }}) => {
    let todos = []
    if (todosList) {
      todos = todosList.items;
    }
    return {
      todos
    };
  },
});


const CREATE_TODO_MUTATION = gql`
  mutation TodoCreate($data: TodoCreateInput!) {
    todoCreate(data: $data) {
      id
      text
      completed
    }
  }
`;

const withCreateTodo = graphql(CREATE_TODO_MUTATION, {
  props: ({ mutate }) => ({
    createTodo: ({ text }) => {
      mutate({
        variables: { data: { text, completed: false } },
        refetchQueries: [{ query: TODO_LIST_QUERY }]
      });
    }
  })
});


const TOGGLE_TODO_MUTATION = gql`
  mutation TodoToggle($id: ID!, $completed: Boolean!) {
    todoUpdate(filter: { id: $id }, data: {
        completed: $completed
    }) {
      id
      text
      completed
    }
  }
`;

const withToggleTodo = graphql(TOGGLE_TODO_MUTATION, {
  props: ({ mutate }) => ({
    toggleTodo: ({ id, completed }) => {
      mutate({
        variables: { id, completed },
        refetchQueries: [{ query: TODO_LIST_QUERY }]
      });
    }
  })  
});

const withToggleAllTodos = graphql(TOGGLE_TODO_MUTATION, {
  props: ({ mutate, ownProps: { todos }}) => ({
    toggleAllTodos: ({ completed }) => {      
      todos.forEach((todo) => {
        mutate({
          variables: { id: todo.id, completed },
          refetchQueries: [{ query: TODO_LIST_QUERY }]
        });        
      });      
    }
  })
});

const DELETE_TODO_MUTATION = gql`
  mutation TodoDelete($id: ID!) {
    todoDelete(filter: { id: $id }) {
      success
    }
  }
`;

const withRemoveTodo = graphql(DELETE_TODO_MUTATION, {
  props: ({ mutate }) => ({
    removeTodo: ( id ) => {
      mutate({
        variables: { id },
        refetchQueries: [{ query: TODO_LIST_QUERY }]
      });
    }
  })  
});

class Header extends Component {
  state = { text: "" };
  render() {
    const { createTodo } = this.props;
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
              createTodo({ text: this.state.text });
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

Header = withCreateTodo(Header);


class Main extends Component {


  render() {
    const {
      todos,
      toggleTodo,
      toggleAllTodos,
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
              ? toggleAllTodos({ completed: true })
              : toggleAllTodos({ completed: false })
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
                <input className="edit" onChange={() => { }} value={todo.text} />
              </li>
            ))}
        </ul>
      </section>
    ) : null;
  }
}


Main = compose(
  withRouter,
  withTodos,
  withToggleTodo,
  withToggleAllTodos,
  withRemoveTodo
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

Footer = compose(
  withRouter,
  withTodos  
)(Footer);

const ENDPOINT_URL = 'https://api.8base.com/cjsrk2gxq000d01s06ye4s4vz';

class App extends Component {

  render() {
    return (
      <Router>
        <EightBaseAppProvider uri={ENDPOINT_URL} >
          {({ loading }) => loading ? <div>"Loading..."</div> : (
            <div className="todoapp">
              <Header />
              <Main />
              <Footer />
            </div>
          )}
        </EightBaseAppProvider>
      </Router>
    );
  }
}

export default App;
