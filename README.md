# neo4j-graph-renderer

Since neo4j does not provide a way to render its graphs, I've created a react component that can be used in order to render a neo4j graph (with all the animations, etc).

## Installation

```bash
# using NPM
$ npm install neo4j-graph-renderer --save
# using yarn
$ yarn add neo4j-graph-renderer
```

## Usage

```javascript
// Using ES6 Syntax
import React from 'react';
import ReactDOM from 'react-dom';
import { Neo4jGraphRenderer } from 'neo4j-graph-renderer';

const App = () => (
  <div>
     <Neo4jGraphRenderer url={process.env.NEO4J_URL} user={process.env.NEO4J_USER}
        password={process.env.NEO4J_PASSWORD} query="MATCH (n)-[r]->(m) RETURN n,r,m"/>
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
```

Props you must provide:
* ```url```: the url required to access your neo4j db (e.g. "http://localhost:7474")
* ```user```: the username required to access your neo4j db
* ```password```: the password required to access your neo4j db
* ```query```: the query you'd like to execute

& There you go! Your neo4j graph has been rendered!

**NOTE**: If you would like to add any extra CSS or your own font, the graph is generated in a ```div``` with id "graph"

## Issues

If you find a bug, please file an issue on the [issue tracker](https://github.com/jbitton/neo4j-graph-renderer/issues) on GitHub.
