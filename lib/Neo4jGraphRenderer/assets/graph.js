'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGraph = undefined;

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _renderer = require('./renderer');

var _connection = require('./connection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createGraph = function createGraph(urlSource, query) {
  var d3Graph = (0, _renderer.graphRenderer)();
  var connection = (0, _connection.neo4jConnection)(urlSource);
  try {
    connection.executeQuery(query, {}, function (err, res) {
      res = res || {};
      var _res = res,
          graph = _res.graph;

      if (graph) {
        var div = (0, _jquery2.default)("#graph");
        div.empty();
        d3Graph.render("graph", div, graph);
      } else {
        if (err) {
          window.alert(err.length > 0 ? 'Cypher error:\n' + err : 'JS Error:\n' + err);
        }
      }
    });
  } catch (e) {
    window.alert('Caught error: ' + e);
  }
};

exports.createGraph = createGraph;