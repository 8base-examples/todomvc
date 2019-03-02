# 8base GraphQL + React Todo MVC

This is completed [Todo MVC](http://todomvc.com/) app with 8base GraphQL backend. If you're looking for walkthrough on how to connect 8base GraphQL API checkout the [workshop](https://github.com/8base/todomvc/tree/workshop) branch.

[Live demo](https://stackblitz.com/github/8base-examples/todomvc)

# Running the app
1. Create [8base](https://www.8base.com/) account
2. Create table `Todo` with fields `text` (field type: TEXT), `completed` (field type: SWITCH, format: Yes/No)
3. Copy the API endpoint URL - you'll need it later
4. Allow guest access to `Todo` table in Settings > Roles > Guest 
5. Clone this repo
6. Set `ENDPOINT_URL` in `App.js`
7. Run `yarn` to install dependencies
8. Start the app: `yarn start`
