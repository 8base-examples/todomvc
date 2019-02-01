# 8base GraphQL + React Todo MVC

[Todo MVC](http://todomvc.com/) app with 8base GraphQL backend walkthrough. If you don't want to go through steps you can find the result in the [8base](https://github.com/8base/MangoHacks/tree/8base) branch.


# Preparing the environment
1. Create [8base](https://www.8base.com/) account
2. Create table `Todo` with fields `text` (field type: TEXT), `completed` (field type: SWITCH, format: Yes/No)
3. Copy the API endpoint URL - you'll need it later where it says `8BASE_API_URL`
4. Allow guest access to `Todo` table in Settings > Roles > Guest 
5. Clone this repo 
6. Install dependencies: 
```
yarn add @8base/app-provider @8base/web-auth0-auth-client graphql graphql-tag react-apollo && yarn
```
7. Test that the app works without backend: `yarn start`
8. (optional) Setup VS Code [Apollo GraphQL](https://marketplace.visualstudio.com/items?itemName=apollographql.vscode-apollo) extension:
Create file `apollo.config.js` in the root of the project with the following content:
```javascript
module.exports = {
  client: {
    service: {
      name: '8base',
      url: '8BASE_API_URL',
    },
    includes: [
      "src/*.{ts,tsx,js,jsx}"
    ]
  },
};
```

# Connecting the backend
**1. Import graphql-related dependencies**
```javascript
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { EightBaseAppProvider } from '@8base/app-provider';
import { WebAuth0AuthClient } from '@8base/web-auth0-auth-client';
```

**2. Initialize auth**
```javascript
const ENDPOINT_URL = 'YOUR_8BASE_ENDPOINT_URL'
const AUTH_CLIENT_ID = 'qGHZVu5CxY5klivm28OPLjopvsYp0baD';
const AUTH_DOMAIN = 'auth.8base.com';

const authClient = new WebAuth0AuthClient({
  domain: AUTH_DOMAIN,
  clientId: AUTH_CLIENT_ID,
  redirectUri: `${window.location.origin}/auth/callback`,
  logoutRedirectUri: `${window.location.origin}/auth`,
});
```

**3. Initialize `EightBaseAppProvider`**
```jsx
<EightBaseAppProvider uri={ENDPOINT_URL} authClient={authClient} >
  {({ loading }) => loading ? <div>"Loading..."</div> : (
    <div className="todoapp">...</div>
  })}
</EightBaseAppProvider> 
```

**4. Fetch todos**
* Query and HOC
```javascript
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
  props: ({ data: { todosList: ({ items } = {}) } }) => {
    return {
      todos: items || []
    };
  },
});
```
* Wrap `Main` and `Footer` into `withTodos`
```javascript
Main = compose(
  withRouter,
  withTodos // Add this
)(Main);
```
```javascript
Footer = compose(
  withRouter,
  withTodos // Add this
)(Footer);
```

* Remove passing `todos` prop
```jsx
<Main 
    todos={ this.state.todos }  // Remove this
    ...

<Footer 
    todos={ this.state.todos }  // Remove this

```

**5. Create todo**
* Mutation and HOC
```javascript
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
```
* Wrap `Header`
```javascript
Header = withCreateTodo(Header);
```
* Remove `createTodo` from App
```jsx
<Header 
    createTodo={ this.createTodo }  // Remove this
```

**6. Toggle todo mutation**
* Mutation and HOC
```javascript
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
```
* Wrap `Main` in `withToggleTodo`:
```javascript
Main = compose(
  withRouter,
  withTodos,
  withToggleTodo  // Add this
)(Main);
```
* Remove `toggleTodo` from App
```jsx
<Main 
    toggleTodo={ this.toggleTodo }  // Remove this
    ...
```

**7. Toggle all todos**
* We only need a new HOC, we can reuse the mutation. All mutations in the loop will be batched in a single request.
```javascript
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
```
* Wrap `Main` in `withToggleAllTodos`
```javascript
Main = compose(
  withRouter,
  withTodos,
  withToggleTodo,
  withToggleAllTodos // Add this
)(Main);
```
* Remove `toggleAllTodos` from `App`
```jsx
<Main 
    toggleAllTodos={ this.toggleAllTodos }  // Remove this
    ...
```

**8. Remove todo**
* Mutation and HOC
```javascript
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
```
* Wrap `Main` in `withRemoveTodo`
```javascript
Main = compose(
  withRouter,
  withTodos,
  withToggleTodo,
  withRemoveTodo // Add this
)(Main);
```
* Remove `removeTodo` from `App`
```jsx
<Main 
    removeTodo={ this.removeTodo }  // Remove this
    ...
```

Completed example with 8base backend connected can be found in the [8base](https://github.com/8base/MangoHacks/tree/8base) branch.