import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import Neo4jGraphRenderer from 'Neo4jGraphRenderer';

const App = () => (
  <div>
    <Neo4jGraphRenderer url="http://localhost:7474" user="neo4j" password="password" query="MATCH (s:Service)-[r]-(e:Event) RETURN s,r,e"/>
  </div>
);

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
