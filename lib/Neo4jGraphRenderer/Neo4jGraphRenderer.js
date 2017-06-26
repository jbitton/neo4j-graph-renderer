'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _graph = require('./assets/graph');

require('./Neo4jGraphRenderer.css');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Neo4JGraphRenderer = function (_Component) {
  _inherits(Neo4JGraphRenderer, _Component);

  function Neo4JGraphRenderer() {
    _classCallCheck(this, Neo4JGraphRenderer);

    return _possibleConstructorReturn(this, (Neo4JGraphRenderer.__proto__ || Object.getPrototypeOf(Neo4JGraphRenderer)).apply(this, arguments));
  }

  _createClass(Neo4JGraphRenderer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.loadData(this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this.loadData(newProps);
    }
  }, {
    key: 'loadData',
    value: function loadData(props) {
      var connection = { url: props.url, user: props.user, pass: props.password };
      (0, _graph.createGraph)(connection, props.query);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', { id: 'graph' });
    }
  }]);

  return Neo4JGraphRenderer;
}(_react.Component);

exports.default = Neo4JGraphRenderer;