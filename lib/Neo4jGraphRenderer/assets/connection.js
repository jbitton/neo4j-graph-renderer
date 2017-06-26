"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getURL = function getURL(url) {
  return (url || "http://localhost:7474").replace(/\/db\/data.*/, "") + "/db/data/transaction/commit";
};

var neo4jConnection = function neo4jConnection(connection) {
  return {
    executeQuery: function executeQuery(query, params, callback) {
      var auth = (connection.user || "") === "" ? "" : "Basic " + btoa(connection.user + ":" + connection.pass);
      if (auth && auth.length) {
        fetch(getURL(connection.url), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': auth
          },
          body: JSON.stringify({
            statements: [{
              statement: query,
              parameters: params || {},
              resultDataContents: ["row", "graph"]
            }]
          })
        }).then(function (res) {
          return res.json();
        }).then(function (res) {
          if (res.errors && res.errors.length > 0) {
            callback(res.errors);
          } else {
            var cols = res.results[0].columns;
            var rows = res.results[0].data.map(function (row) {
              var r = {};
              cols.forEach(function (col, index) {
                r[col] = row.row[index];
              });
              return r;
            });
            var nodes = [];
            var relations = [];
            var labels = [];

            res.results[0].data.forEach(function (row) {
              row.graph.nodes.forEach(function (n) {
                var found = nodes.filter(function (m) {
                  return m.id === n.id;
                }).length > 0;
                if (!found) {
                  for (var p in n.properties || {}) {
                    n[p] = n.properties[p];
                    delete n.properties[p];
                  }
                  delete n.properties;
                  nodes.push(n);
                  labels = labels.concat(n.labels.filter(function (l) {
                    return labels.indexOf(l) === -1;
                  }));
                }
              });
              relations = relations.concat(row.graph.relationships.map(function (r) {
                return { id: r.id, start: r.startNode, end: r.endNode, type: r.type };
              }));
            });
            callback(null, { table: rows, graph: { nodes: nodes, links: relations }, labels: labels });
          }
        }).catch(function (err) {
          return callback(err);
        });
      }
    }
  };
};

exports.neo4jConnection = neo4jConnection;