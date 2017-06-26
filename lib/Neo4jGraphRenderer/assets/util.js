'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _arguments = arguments;

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

window.neo = {};

var __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

var neo = {
  models: {},
  renderers: {
    node: [],
    relationship: []
  },
  utils: {
    copy: function copy(src) {
      return JSON.parse(JSON.stringify(src));
    },
    extend: function extend(dest, src) {
      if (!neo.utils.isObject(dest) && neo.utils.isObject(src)) return;
      for (var k in src) {
        if (!__hasProp.call(src, k)) continue;
        dest[k] = src[k];
      }
      return dest;
    },
    isArray: Array.isArray || function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isObject: function isObject(obj) {
      return Object(obj) === obj;
    }
  }
};

var __bind = function __bind(fn, me) {
  return function () {
    return fn.apply(me, arguments);
  };
};

neo.models.Graph = function () {
  function Graph(cypher) {
    this.removeRelationships = __bind(this.removeRelationships, this);
    this.removeNodes = __bind(this.removeNodes, this);
    this.findRelationship = __bind(this.findRelationship, this);
    this.findNode = __bind(this.findNode, this);
    this.addRelationships = __bind(this.addRelationships, this);
    this.addNodes = __bind(this.addNodes, this);
    this.nodeMap = {};
    this.relationshipMap = {};
    if (cypher) {
      this.addNodes(cypher.nodes);
      this.addRelationships(cypher.relationships);
    }
  }

  Graph.prototype.nodes = function () {
    var _ref = this.nodeMap;
    var _results = [];
    for (var key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _results.push(_ref[key]);
    }
    return _results;
  };

  Graph.prototype.relationships = function () {
    var _ref = this.relationshipMap;
    var _results = [];
    for (var key in _ref) {
      if (!__hasProp.call(_ref, key)) continue;
      _results.push(_ref[key]);
    }
    return _results;
  };

  Graph.prototype.addNodes = function (item) {
    var _base = void 0,
        _name = void 0;
    var items = !neo.utils.isArray(item) ? [item] : item;
    for (var _i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      var node = !(item instanceof neo.models.Node) ? new neo.models.Node(item.id, item.labels, item.properties) : item;
      (_base = this.nodeMap)[_name = item.id] || (_base[_name] = node);
    }
    return this;
  };

  Graph.prototype.addRelationships = function (item) {
    var items = !neo.utils.isArray(item) ? [item] : item;
    for (var _i = 0, _len = items.length; _i < _len; _i++) {
      item = items[_i];
      var source = this.nodeMap[item.source] || function () {
        throw new Error("Invalid source");
      }();
      var target = this.nodeMap[item.target] || function () {
        throw new Error("Invalid target");
      }();
      this.relationshipMap[item.id] = new neo.models.Relationship(item.id, source, target, item.type, item.properties);
    }
    return this;
  };

  Graph.prototype.findNode = function (id) {
    return undefined.nodeMap[id];
  };

  Graph.prototype.findRelationship = function (id) {
    return undefined.relationshipMap[id];
  };

  Graph.prototype.merge = function (result) {
    undefined.addNodes(result.nodes);
    undefined.addRelationships(result.relationships);
    return undefined;
  };

  Graph.prototype.removeNodes = function () {
    var _this2 = this;

    var remove = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (arguments.length === 0) {
      this.nodeMap = {};
      this.relationshipMap = {};
      return this;
    }
    remove = neo.utils.isArray(remove[0]) ? remove[0] : remove;

    var _loop = function _loop(_i, _len) {
      var id = remove[_i];
      var rels = function () {
        var _ref = _this2.relationshipMap;
        var _results = [];
        for (var rId in _ref) {
          if (!__hasProp.call(_ref, rId)) continue;
          var rel = _ref[rId];
          if (rel.source.id === id || rel.target.id === id) {
            _results.push(rel.id);
          }
        }
        return _results;
      }.call(_this2);
      _this2.removeRelationships(rels);
      delete _this2.nodeMap[id];
    };

    for (var _i = 0, _len = remove.length; _i < _len; _i++) {
      _loop(_i, _len);
    }
    return this;
  };

  Graph.prototype.removeRelationships = function () {
    var remove = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if (arguments.length === 0) {
      this.relationshipMap = {};
      return this;
    }
    remove = neo.utils.isArray(remove[0]) ? remove[0] : remove;
    for (var _i = 0, _len = remove.length; _i < _len; _i++) {
      var _id = remove[_i];
      delete this.relationshipMap[_id];
    }
    return this;
  };

  return Graph;
}();

var NeoD3Geometry = function () {
  var square = function square(distance) {
    return distance * distance;
  };

  function NeoD3Geometry(style) {
    this.style = style;
  }

  NeoD3Geometry.prototype.formatNodeCaptions = function (nodes) {
    var style = this.style;
    var _results = [];
    for (var _i = 0, _len = nodes.length; _i < _len; _i++) {
      var node = nodes[_i];
      var template = style.forNode(node).get("caption");
      var captionText = style.interpolate(template, node.id, node.propertyMap);
      var words = captionText.split(" ");
      var lines = [];
      var _j = void 0;
      for (var i = _j = 0, _ref = words.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
        lines.push({ node: node, text: words[i], baseline: (1 + i - words.length / 2) * 10 });
      }
      _results.push(node.caption = lines);
    }
    return _results;
  };

  NeoD3Geometry.prototype.measureRelationshipCaption = function (relationship, caption) {
    var fontFamily = 'sans-serif';
    var fontSize = parseFloat(this.style.forRelationship(relationship).get('font-size'));
    var padding = parseFloat(this.style.forRelationship(relationship).get('padding'));
    return neo.utils.measureText(caption, fontFamily, fontSize) + padding * 2;
  };

  NeoD3Geometry.prototype.captionFitsInsideArrowShaftWidth = function (relationship) {
    return parseFloat(this.style.forRelationship(relationship).get('shaft-width')) > parseFloat(this.style.forRelationship(relationship).get('font-size'));
  };

  NeoD3Geometry.prototype.measureRelationshipCaptions = function (relationships) {
    var _results = [];
    for (var _i = 0, _len = relationships.length; _i < _len; _i++) {
      var relationship = relationships[_i];
      relationship.captionLength = this.measureRelationshipCaption(relationship, relationship.type);
      _results.push(relationship.captionLayout = this.captionFitsInsideArrowShaftWidth(relationship) ? "internal" : "external");
    }
    return _results;
  };

  NeoD3Geometry.prototype.shortenCaption = function (relationship, caption, targetWidth) {
    var shortCaption = caption;
    while (true) {
      if (shortCaption.length <= 2) return ['', 0];
      shortCaption = shortCaption.substr(0, shortCaption.length - 2) + '\u2026';
      var width = this.measureRelationshipCaption(relationship, shortCaption);
      if (width < targetWidth) return [shortCaption, width];
    }
  };

  NeoD3Geometry.prototype.layoutRelationships = function (relationships) {
    var relationship = void 0,
        dx = void 0,
        dy = void 0,
        length = void 0;
    var _results = [];
    var alongPath = function alongPath(from, distance) {
      return { x: from.x + dx * distance / length, y: from.y + dy * distance / length };
    };

    for (var _i = 0, _len = relationships.length; _i < _len; _i++) {
      relationship = relationships[_i];
      dx = relationship.target.x - relationship.source.x;
      dy = relationship.target.y - relationship.source.y;
      length = Math.sqrt(square(dx) + square(dy));
      relationship.arrowLength = length - relationship.source.radius - relationship.target.radius;
      var shaftRadius = parseFloat(this.style.forRelationship(relationship).get('shaft-width')) / 2 || 2;
      var headRadius = shaftRadius + 3;
      var headHeight = headRadius * 2;
      var shaftLength = relationship.arrowLength - headHeight;
      relationship.startPoint = alongPath(relationship.source, relationship.source.radius);
      relationship.endPoint = alongPath(relationship.target, -relationship.target.radius);
      relationship.midShaftPoint = alongPath(relationship.startPoint, shaftLength / 2);
      relationship.angle = Math.atan2(dy, dx) / Math.PI * 180;
      relationship.textAngle = relationship.angle;
      if (relationship.angle < -90 || relationship.angle > 90) {
        relationship.textAngle += 180;
      }
      var _ref = shaftLength > relationship.captionLength ? [relationship.type, relationship.captionLength] : this.shortenCaption(relationship, relationship.type, shaftLength);
      relationship.shortCaption = _ref[0];
      relationship.shortCaptionLength = _ref[1];
      if (relationship.captionLayout === "external") {
        var startBreak = (shaftLength - relationship.shortCaptionLength) / 2;
        var endBreak = shaftLength - startBreak;
        _results.push(relationship.arrowOutline = ['M', 0, shaftRadius, 'L', startBreak, shaftRadius, 'L', startBreak, -shaftRadius, 'L', 0, -shaftRadius, 'Z', 'M', endBreak, shaftRadius, 'L', shaftLength, shaftRadius, 'L', shaftLength, headRadius, 'L', relationship.arrowLength, 0, 'L', shaftLength, -headRadius, 'L', shaftLength, -shaftRadius, 'L', endBreak, -shaftRadius, 'Z'].join(' '));
      } else {
        _results.push(relationship.arrowOutline = ['M', 0, shaftRadius, 'L', shaftLength, shaftRadius, 'L', shaftLength, headRadius, 'L', relationship.arrowLength, 0, 'L', shaftLength, -headRadius, 'L', shaftLength, -shaftRadius, 'L', 0, -shaftRadius, 'Z'].join(' '));
      }
    }
    return _results;
  };

  NeoD3Geometry.prototype.setNodeRadii = function (nodes) {
    var _results = [];
    for (var _i = 0, _len = nodes.length; _i < _len; _i++) {
      var node = nodes[_i];
      _results.push(node.radius = parseFloat(this.style.forNode(node).get("diameter")) / 2);
    }
    return _results;
  };

  NeoD3Geometry.prototype.onGraphChange = function (graph) {
    this.setNodeRadii(graph.nodes());
    this.formatNodeCaptions(graph.nodes());
    return this.measureRelationshipCaptions(graph.relationships());
  };

  NeoD3Geometry.prototype.onTick = function (graph) {
    return this.layoutRelationships(graph.relationships());
  };

  return NeoD3Geometry;
}();

neo.graphModel = function () {
  var graph = new neo.models.Graph();

  var model = function model() {};

  model.callbacks = {};

  model.trigger = function () {
    var args = 2 <= _arguments.length ? __slice.call(_arguments, 1) : [];
    var event = 'updated';
    if (model.callbacks[event]) {
      var _ref = model.callbacks[event];
      var _results = [];
      for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var callback = _ref[_i];
        _results.push(callback.apply(null, args));
      }
      return _results;
    }
  };

  model.nodes = function (items) {
    if (items == null) return graph.nodes();
    graph.removeNodes().addNodes(items);
    model.trigger('nodesAdded');
    return model;
  };

  model.nodes.add = function (items) {
    if (items != null) {
      graph.addNodes(items);
      model.trigger('nodesAdded');
    }
    return model;
  };

  model.nodes.find = graph.findNode;

  model.nodes.remove = function () {
    graph.removeNodes.apply(null, _arguments);
    model.trigger('nodesRemoved');
    return model;
  };

  model.relationships = function (items) {
    if (items == null) return graph.relationships();
    graph.removeRelationships().addRelationships(items);
    model.trigger('relationshipsAdded');
    return model;
  };

  model.relationships.add = function (items) {
    if (items != null) {
      graph.addRelationships(items);
      model.trigger('relationshipsAdded');
    }
    return model;
  };

  model.relationships.find = graph.findRelationship;

  model.relationships.remove = function () {
    graph.removeRelationships.apply(null, _arguments);
    model.trigger('relationshipsRemoved');
    return model;
  };

  model.on = function (event, callback) {
    var _base = model.callbacks;
    _base[event] = _base[event] != null ? _base[event] : [];
    _base[event].push(callback);
    return model;
  };

  return model;
};

neo.graphView = function () {
  var layout = neo.layout.force();
  var style = neo.style();
  var viz = null;
  var callbacks = {};
  var trigger = function trigger() {
    var event = _arguments[0];
    var args = 2 <= _arguments.length ? __slice.call(_arguments, 1) : [];
    var _ref = callbacks[event];
    var _results = [];
    for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
      var callback = _ref[_i];
      _results.push(callback.apply(null, args));
    }
    return _results;
  };

  var chart = function chart(selection) {
    selection.each(function (graphModel) {
      if (!viz) {
        viz = neo.viz(this, graphModel, layout, style);
        graphModel.on('updated', function () {
          return viz.update();
        });
        viz.trigger = trigger;
      }
      return viz.update();
    });
  };

  chart.on = function (event, callback) {
    (callbacks[event] != null ? callbacks[event] : callbacks[event] = []).push(callback);
    return chart;
  };

  chart.layout = function (value) {
    if (!_arguments.length) return layout;
    layout = value;
    return chart;
  };

  chart.style = function (value) {
    if (!_arguments.length) return style.toSheet();
    style.importGrass(value);
    return chart;
  };

  chart.width = function (value) {
    if (!_arguments.length) return viz.width;
    return chart;
  };

  chart.height = function (value) {
    if (!_arguments.length) return viz.height;
    return chart;
  };

  chart.update = function () {
    viz.update();
    return chart;
  };

  return chart;
};

neo.layout = function () {
  var _layout = {};
  _layout.force = function () {
    var _force = {};
    _force.init = function (render) {
      var forceLayout = {};
      var linkDistance = 60;
      var d3force = d3.layout.force().linkDistance(linkDistance).charge(-1000).gravity(0.3);
      var accelerateLayout = function accelerateLayout() {
        var maxStepsPerTick = 100;
        var maxAnimationFramesPerSecond = 60;
        var maxComputeTime = 1000 / maxAnimationFramesPerSecond;
        var now = window.performance ? function () {
          return window.performance.now();
        } : function () {
          return Date.now();
        };
        var d3Tick = d3force.tick;
        return d3force.tick = function (_this) {
          return function () {
            var startTick = now();
            var step = maxStepsPerTick;
            while (step-- && now() - startTick < maxComputeTime) {
              if (d3Tick()) {
                maxStepsPerTick = 2;
                return true;
              }
            }
            render();
            return false;
          };
        }(undefined);
      };
      accelerateLayout();
      forceLayout.update = function (graph, size) {
        var nodes = graph.nodes();
        var relationships = graph.relationships();
        var radius = nodes.length * linkDistance / (Math.PI * 2);
        var center = { x: size[0] / 2, y: size[1] / 2 };
        neo.utils.circularLayout(nodes, center, radius);
        return d3force.nodes(nodes).links(relationships).size(size).start();
      };
      forceLayout.drag = d3force.drag;
      return forceLayout;
    };
    return _force;
  };

  return _layout;
}();

neo.models.Node = function () {
  function Node(id, labels, properties) {
    this.id = id;
    this.labels = labels;
    this.propertyMap = properties;
    this.propertyList = function () {
      var _results = [];
      for (var key in properties) {
        if (!__hasProp.call(properties, key)) continue;
        var value = properties[key];
        _results.push({ key: key, value: value });
      }
      return _results;
    }();
  }

  Node.prototype.toJSON = function () {
    return undefined.propertyMap;
  };

  Node.prototype.isNode = true;

  Node.prototype.isRelationship = false;

  return Node;
}();

neo.models.Relationship = function () {
  function Relationship(id, source, target, type, properties) {
    var _this3 = this;

    this.id = id;
    this.source = source;
    this.target = target;
    this.type = type;
    this.propertyMap = properties;
    this.propertyList = function () {
      var _ref = _this3.propertyMap;
      var _results = [];
      for (var key in _ref) {
        if (!__hasProp.call(_ref, key)) continue;
        var value = _ref[key];
        _results.push({ key: key, value: value });
      }
      return _results;
    }.call(this);
  }

  Relationship.prototype.toJSON = function () {
    return undefined.propertyMap;
  };

  Relationship.prototype.isNode = false;

  Relationship.prototype.isRelationship = true;

  return Relationship;
}();

neo.Renderer = function () {
  function Renderer(opts) {
    if (opts == null) opts = {};
    neo.utils.extend(this, opts);
    if (this.onGraphChange == null) {
      this.onGraphChange = function () {};
    }
    if (this.onTick == null) {
      this.onTick = function () {};
    }
  }

  return Renderer;
}();

neo.style = function () {
  var _style = function _style(storage) {
    return new GraphStyle(storage);
  };

  _style.defaults = {
    autoColor: true,
    colors: [{
      color: '#DFE1E3',
      'border-color': '#D4D6D7',
      'text-color-internal': '#000'
    }, {
      color: '#BBDAFF',
      'border-color': '#BBBBFF',
      'text-color-internal': '#000'
    }, {
      color: '#CEF0FF',
      'border-color': '#ACF3FD',
      'text-color-internal': '#000'
    }, {
      color: '#B5FFFC',
      'border-color': '#A5FEEB',
      'text-color-internal': '#000'
    }, {
      color: '#B5FFC8',
      'border-color': '#A4F0B7',
      'text-color-internal': '#000'
    }, {
      color: '#CAFEB8',
      'border-color': '#A5FF8A',
      'text-color-internal': '#000'
    }, {
      color: '#B8E2EF',
      'border-color': '#8CD1E6',
      'text-color-internal': '#000'
    }, {
      color: '#CEDEF4',
      'border-color': '#D7D1F8',
      'text-color-internal': '#000'
    }, {
      color: '#E1CAF9',
      'border-color': '#E8C6FF',
      'text-color-internal': '#000'
    }, {
      color: '#F0C4F0',
      'border-color': '#FFCEFF',
      'text-color-internal': '#000'
    }, {
      color: '#FFCAF9',
      'border-color': '#FEA9F3',
      'text-color-internal': '#000'
    }, {
      color: '#DDCEFF',
      'border-color': '#C4ABFE',
      'text-color-internal': '#000'
    }],
    style: {
      'node': {
        'diameter': '40px',
        'color': '#DFE1E3',
        'border-color': '#D4D6D7',
        'border-width': '2px',
        'text-color-internal': '#000',
        'caption': '{id}',
        'font-size': '8px'
      },
      'relationship': {
        'color': '#D4D6D7',
        'shaft-width': '1px',
        'font-size': '8px',
        'padding': '3px',
        'text-color-external': '#000',
        'text-color-internal': '#FFF'
      }
    },
    sizes: [{
      diameter: '10px'
    }, {
      diameter: '20px'
    }, {
      diameter: '30px'
    }, {
      diameter: '50px'
    }, {
      diameter: '80px'
    }],
    arrayWidths: [{
      'shaft-width': '1px'
    }, {
      'shaft-width': '2px'
    }, {
      'shaft-width': '3px'
    }, {
      'shaft-width': '5px'
    }, {
      'shaft-width': '8px'
    }, {
      'shaft-width': '13px'
    }, {
      'shaft-width': '25px'
    }, {
      'shaft-width': '38px'
    }]
  };

  var Selector = function () {
    function Selector(selector) {
      var _ref = selector.indexOf('.') > 0 ? selector.split('.') : [selector, void 0];
      this.tag = _ref[0];
      this.klass = _ref[1];
    }

    Selector.prototype.toString = function () {
      var str = undefined.tag;
      if (undefined.klass != null) {
        str += "." + undefined.klass;
      }
      return str;
    };

    return Selector;
  }();

  var StyleRule = function () {
    function StyleRule(selector, props) {
      this.selector = selector;
      this.props = props;
    }

    StyleRule.prototype.matches = function (selector) {
      if (this.selector.tag === selector.tag) {
        if (this.selector.klass === selector.klass || !this.selector.klass) {
          return true;
        }
      }
      return false;
    };

    StyleRule.prototype.matchesExact = function (selector) {
      return this.selector.tag === selector.tag && this.selector.klass === selector.klass;
    };

    return StyleRule;
  }();

  var StyleElement = function () {
    function StyleElement(selector, data) {
      this.data = data;
      this.selector = selector;
      this.props = {};
    }

    StyleElement.prototype.applyRules = function (rules) {
      for (var _i = 0, _len = rules.length; _i < _len; _i++) {
        var rule = rules[_i];
        if (!rule.matches(this.selector)) {
          continue;
        }
        neo.utils.extend(this.props, rule.props);
        break;
      }
      for (var _j = 0, _len1 = rules.length; _j < _len1; _j++) {
        var _rule = rules[_j];
        if (!_rule.matchesExact(this.selector)) {
          continue;
        }
        neo.utils.extend(this.props, _rule.props);
        break;
      }

      return this;
    };

    StyleElement.prototype.get = function (attr) {
      return this.props[attr] || '';
    };

    return StyleElement;
  }();

  var GraphStyle = function () {
    function GraphStyle(storage) {
      this.storage = storage;
      this.rules = [];
      this.loadRules();
    }

    GraphStyle.prototype.selector = function (item) {
      return item.isNode ? this.nodeSelector(item) : item.isRelationship ? this.relationshipSelector(item) : null;
    };

    GraphStyle.prototype.calculateStyle = function (selector, data) {
      return new StyleElement(selector, data).applyRules(this.rules);
    };

    GraphStyle.prototype.forEntity = function (item) {
      return this.calculateStyle(this.selector(item), item);
    };

    GraphStyle.prototype.forNode = function (node) {
      if (node == null) node = {};

      var selector = this.nodeSelector(node);
      var _ref = node.labels;
      if ((_ref != null ? _ref.length : void 0) > 0) {
        this.setDefaultStyling(selector);
      }
      return this.calculateStyle(selector, node);
    };

    GraphStyle.prototype.forRelationship = function (rel) {
      return this.calculateStyle(this.relationshipSelector(rel), rel);
    };

    GraphStyle.prototype.findAvailableDefaultColor = function () {
      var usedColors = {};
      var _ref = this.rules;
      for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var rule = _ref[_i];
        if (rule.props.color != null) {
          usedColors[rule.props.color] = true;
        }
      }
      var _ref1 = _style.defaults.colors;
      for (var _j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        var defaultColor = _ref1[_j];
        if (usedColors[defaultColor.color] == null) {
          return neo.utils.copy(defaultColor);
        }
      }
      return neo.utils.copy(_style.defaults.colors[0]);
    };

    GraphStyle.prototype.setDefaultStyling = function (selector) {
      var rule = this.findRule(selector);
      if (_style.defaults.autoColor && rule == null) {
        rule = new StyleRule(selector, this.findAvailableDefaultColor());
        this.rules.push(rule);
        return this.persist();
      }
    };

    GraphStyle.prototype.change = function (item, props) {
      var selector = this.selector(item);
      var rule = this.findRule(selector);
      if (rule == null) {
        rule = new StyleRule(selector, {});
        this.rules.push(rule);
      }
      neo.utils.extend(rule.props, props);
      this.persist();
      return rule;
    };

    GraphStyle.prototype.destroyRule = function (rule) {
      var idx = this.rules.indexOf(rule);
      if (idx != null) {
        this.rules.splice(idx, 1);
      }
      return this.persist();
    };

    GraphStyle.prototype.findRule = function (selector) {
      var rule = void 0;
      var _ref = this.rules;
      for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var r = _ref[_i];
        if (r.matchesExact(selector)) {
          rule = r;
        }
      }
      return rule;
    };

    GraphStyle.prototype.nodeSelector = function (node) {
      if (node == null) node = {};
      var selector = 'node';
      var _ref = node.labels;
      if ((_ref != null ? _ref.length : void 0) > 0) {
        selector += "." + node.labels[0];
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.relationshipSelector = function (rel) {
      if (rel == null) rel = {};
      var selector = 'relationship';
      if (rel.type != null) {
        selector += "." + rel.type;
      }
      return new Selector(selector);
    };

    GraphStyle.prototype.importGrass = function (string) {
      try {
        var rules = this.parse(string);
        this.loadRules(rules);
        return this.persist();
      } catch (_error) {
        console.error(_error);
      }
    };

    GraphStyle.prototype.loadRules = function (data) {
      if (!neo.utils.isObject(data)) {
        data = _style.defaults.style;
      }
      this.rules.length = 0;
      for (var rule in data) {
        var props = data[rule];
        this.rules.push(new StyleRule(new Selector(rule), neo.utils.copy(props)));
      }
      return this;
    };

    GraphStyle.prototype.parse = function (string) {
      var chars = string.split(''),
          rules = {};
      var insideString = false,
          insideProps = false,
          keyword = "",
          props = "";
      for (var _i = 0, _len = chars.length; _i < _len; _i++) {
        var c = chars[_i];
        var skipThis = true;
        switch (c) {
          case "{":
            if (!insideString) {
              insideProps = true;
            } else {
              skipThis = false;
            }
            break;
          case "}":
            if (!insideString) {
              insideProps = false;
              rules[keyword] = props;
              keyword = "";
              props = "";
            } else {
              skipThis = false;
            }
            break;
          case "'":
          case "\"":
            insideString ^= true;
            break;
          default:
            skipThis = false;
        }
        if (skipThis) {
          continue;
        }
        if (insideProps) {
          props += c;
        } else {
          if (!c.match(/[\s\n]/)) {
            keyword += c;
          }
        }
      }
      for (var k in rules) {
        var v = rules[k];
        rules[k] = {};
        var _ref = v.split(';');
        for (var _j = 0, _len1 = _ref.length; _j < _len1; _j++) {
          var prop = _ref[_j];
          var _ref1 = prop.split(':');
          var key = _ref1[0];
          var val = _ref1[1];
          if (!(key && val)) {
            continue;
          }
          rules[k][key != null ? key.trim() : void 0] = val != null ? val.trim() : void 0;
        }
      }
      return rules;
    };

    GraphStyle.prototype.persist = function () {
      var _ref = this.storage;
      return _ref != null ? _ref.add('grass', JSON.stringify(this.toSheet())) : void 0;
    };

    GraphStyle.prototype.resetToDefault = function () {
      this.loadRules();
      return this.persist();
    };

    GraphStyle.prototype.toSheet = function () {
      var sheet = {};
      var _ref = this.rules;
      for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var rule = _ref[_i];
        sheet[rule.selector.toString()] = rule.props;
      }
      return sheet;
    };

    GraphStyle.prototype.toString = function () {
      var str = "";
      var _ref = this.rules;
      for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
        var r = _ref[_i];
        str += r.selector.toString() + " {\n";
        var _ref1 = r.props;
        for (var k in _ref1) {
          var v = _ref1[k];
          if (k === "caption") {
            v = "'" + v + "'";
          }
          str += "  " + k + ": " + v + ";\n";
        }
        str += "}\n\n";
      }
      return str;
    };

    GraphStyle.prototype.nextDefaultColor = 0;

    GraphStyle.prototype.defaultColors = function () {
      return neo.utils.copy(_style.defaults.colors);
    };

    GraphStyle.prototype.interpolate = function (str, id, properties) {
      return str.replace(/\{([^{}]*)\}/g, function (a, b) {
        var r = properties[b] || id;
        return typeof r === 'string' || typeof r === 'number' ? r : a;
      });
    };

    return GraphStyle;
  }();

  return _style;
}();

neo.viz = function (el, graph, layout, style) {
  var viz = { style: style },
      geometry = new NeoD3Geometry(style);
  el = d3.select(el);

  viz.trigger = function () {};

  var onNodeClick = function (_this) {
    return function (node) {
      return viz.trigger('nodeClicked', node);
    };
  }(this);

  var onNodeDblClick = function (_this) {
    return function (node) {
      return viz.trigger('nodeDblClicked', node);
    };
  }(this);

  var onRelationshipClick = function (_this) {
    return function (relationship) {
      return viz.trigger('relationshipClicked', relationship);
    };
  }(this);

  var render = function render() {
    var renderer = void 0;
    geometry.onTick(graph);

    var nodeGroups = el.selectAll("g.node").attr("transform", function (node) {
      return "translate(" + node.x + "," + node.y + ")";
    });

    var _ref = neo.renderers.node;
    for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
      renderer = _ref[_i];
      nodeGroups.call(renderer.onTick, viz);
    }

    var relationshipGroups = el.selectAll("g.relationship");
    var _ref1 = neo.renderers.relationship;
    var _results = [];
    for (var _j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      renderer = _ref1[_j];
      _results.push(relationshipGroups.call(renderer.onTick, viz));
    }
    return _results;
  };

  var force = layout.init(render);

  viz.update = function () {
    if (!graph) return;

    var height = function () {
      try {
        return parseInt(el.style('height').replace('px', ''), 10);
      } catch (_error) {}
    }();

    var width = function () {
      try {
        return parseInt(el.style('width').replace('px', ''), 10);
      } catch (_error) {}
    }();

    var layers = el.selectAll("g.layer").data(["relationships", "nodes"]);
    layers.enter().append("g").attr("class", function (d) {
      return "layer " + d;
    });

    var nodes = graph.nodes();
    var relationships = graph.relationships();
    var relationshipGroups = el.select("g.layer.relationships").selectAll("g.relationship").data(relationships, function (d) {
      return d.id;
    });
    relationshipGroups.enter().append("g").attr("class", "relationship").on("click", onRelationshipClick);

    geometry.onGraphChange(graph);

    var renderer = void 0;
    var _ref = neo.renderers.relationship;
    for (var _i = 0, _len = _ref.length; _i < _len; _i++) {
      renderer = _ref[_i];
      relationshipGroups.call(renderer.onGraphChange, viz);
    }
    relationshipGroups.exit().remove();

    var nodeGroups = el.select("g.layer.nodes").selectAll("g.node").data(nodes, function (d) {
      return d.id;
    });
    nodeGroups.enter().append("g").attr("class", "node").call(force.drag).call(clickHandler);
    var _ref1 = neo.renderers.node;
    for (var _j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      renderer = _ref1[_j];
      nodeGroups.call(renderer.onGraphChange, viz);
    }
    nodeGroups.exit().remove();
    return force.update(graph, [width, height]);
  };
  var clickHandler = neo.utils.clickHandler();
  clickHandler.on('click', onNodeClick);
  clickHandler.on('dblclick', onNodeDblClick);
  return viz;
};

neo.utils.circularLayout = function (nodes, center, radius) {
  var unlocatedNodes = nodes.filter(function (node) {
    return !(node.x != null && node.y != null);
  }),
      _results = [];
  var _i = void 0;
  for (var i = _i = 0, _len = unlocatedNodes.length; _i < _len; i = ++_i) {
    var n = unlocatedNodes[i];
    n.x = center.x + radius * Math.sin(2 * Math.PI * i / unlocatedNodes.length);
    _results.push(n.y = center.y + radius * Math.cos(2 * Math.PI * i / unlocatedNodes.length));
  }
  return _results;
};

neo.utils.distributeCircular = function (arrowAngles, minSeparation) {
  var list = [],
      _ref = arrowAngles.floating,
      result = {};
  var angle = void 0,
      key = void 0,
      _i = void 0,
      _k = void 0;
  for (key in _ref) {
    angle = _ref[key];
    list.push({ key: key, angle: angle });
  }

  list.sort(function (a, b) {
    return a.angle - b.angle;
  });

  var runsOfTooDenseArrows = [];
  var length = function length(startIndex, endIndex) {
    return startIndex < endIndex ? endIndex - startIndex + 1 : endIndex + list.length - startIndex + 1;
  };

  angle = function angle(startIndex, endIndex) {
    return startIndex < endIndex ? list[endIndex].angle - list[startIndex].angle : 360 - (list[startIndex].angle - list[endIndex].angle);
  };

  var tooDense = function tooDense(startIndex, endIndex) {
    return angle(startIndex, endIndex) < length(startIndex, endIndex) * minSeparation;
  };

  var wrapIndex = function wrapIndex(index) {
    return index === -1 ? list.length - 1 : index >= list.length ? index - list.length : index;
  };

  var wrapAngle = function wrapAngle(angle) {
    return angle >= 360 ? angle - 360 : angle;
  };

  var expand = function expand(startIndex, endIndex) {
    if (length(startIndex, endIndex) < list.length) {
      if (tooDense(startIndex, wrapIndex(endIndex + 1))) return expand(startIndex, wrapIndex(endIndex + 1));
      if (tooDense(wrapIndex(startIndex - 1), endIndex)) return expand(wrapIndex(startIndex - 1), endIndex);
    }
    return runsOfTooDenseArrows.push({ start: startIndex, end: endIndex });
  };

  for (var i = _i = 0, _ref1 = list.length - 2; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = 0 <= _ref1 ? ++_i : --_i) {
    if (tooDense(i, i + 1)) expand(i, i + 1);
  }

  for (var _j = 0, _len = runsOfTooDenseArrows.length; _j < _len; _j++) {
    var run = runsOfTooDenseArrows[_j];
    var center = list[run.start].angle + angle(run.start, run.end) / 2;
    var runLength = length(run.start, run.end);
    for (var _i2 = _k = 0, _ref2 = runLength - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; _i2 = 0 <= _ref2 ? ++_k : --_k) {
      var rawAngle = center + (_i2 - (runLength - 1) / 2) * minSeparation;
      result[list[wrapIndex(run.start + _i2)].key] = wrapAngle(rawAngle);
    }
  }
  var _ref3 = arrowAngles.floating;

  for (key in _ref3) {
    angle = _ref3[key];
    if (!result[key]) result[key] = arrowAngles.floating[key];
  }
  return result;
};

neo.utils.clickHandler = function () {
  var cc = function cc(selection) {
    var dist = function dist(a, b) {
      return Math.sqrt(Math.pow(a - b[0], 2));
    };
    var tolerance = 5;
    var wait = null;

    selection.on("mousedown", function (e) {
      d3.event = e;
      d3.event.fixed = true;
      return +new Date();
    });

    return selection.on("mouseup", function (e) {
      d3.event = e;
      if (dist(void 0, d3.mouse(document.body)) > tolerance) {} else {
        if (wait) {
          window.clearTimeout(wait);
          wait = null;
          return event.dblclick(d3.event);
        } else {
          return wait = window.setTimeout(function (ev) {
            return function () {
              event.click(ev);
              return wait = null;
            };
          }(d3.event), 250);
        }
      }
    });
  };
  var event = d3.dispatch("click", "dblclick");
  return d3.rebind(cc, event, "on");
};

neo.utils.measureText = function () {
  var measureUsingCanvas = function measureUsingCanvas(text, font) {
    var canvasSelection = d3.select('canvas#textMeasurementCanvas').data([undefined]);
    canvasSelection.enter().append('canvas').attr('id', 'textMeasurementCanvas').style('display', 'none');
    var canvas = canvasSelection.node();
    var context = canvas.getContext('2d');
    context.font = font;
    return context.measureText(text).width;
  };

  var cache = function () {
    var cacheSize = 10000,
        map = {},
        list = [];
    return function (key, calc) {
      if (map[key]) {
        return map[key];
      } else {
        var result = calc();
        if (list.length > cacheSize) {
          delete map[list.splice(0, 1)];
          list.push(key);
        }
        return map[key] = result;
      }
    };
  }();

  return function (text, fontFamily, fontSize) {
    var font = 'normal normal normal ' + fontSize + 'px/normal ' + fontFamily;
    return cache(text + font, function () {
      return measureUsingCanvas(text, font);
    });
  };
}();

(function () {
  var noop = function noop() {};

  var nodeOutline = new neo.Renderer({
    onGraphChange: function onGraphChange(selection, viz) {
      var circles = selection.selectAll('circle.outline').data(function (node) {
        return [node];
      });
      circles.enter().append('circle').classed('outline', true).attr({ cx: 0, cy: 0 });
      circles.attr({
        r: function r(node) {
          return node.radius;
        },
        fill: function fill(node) {
          return viz.style.forNode(node).get('color');
        },
        stroke: function stroke(node) {
          return viz.style.forNode(node).get('border-color');
        },
        'stroke-width': function strokeWidth(node) {
          return viz.style.forNode(node).get('border-width');
        }
      });
      return circles.exit().remove();
    },
    onTick: noop
  });

  var nodeCaption = new neo.Renderer({
    onGraphChange: function onGraphChange(selection, viz) {
      var text = selection.selectAll('text').data(function (node) {
        return node.caption;
      });
      text.enter().append('text').attr({
        'text-anchor': 'middle',
        'font-weight': 'normal',
        'stroke': '#FFFFFF',
        'stroke-width': '0'
      });
      text.text(function (line) {
        return line.text;
      }).attr('y', function (line) {
        return line.baseline;
      }).attr('font-size', function (line) {
        return viz.style.forNode(line.node).get('font-size');
      }).attr('stroke', function (line) {
        return viz.style.forNode(line.node).get('color');
      }).attr('fill', function (line) {
        return viz.style.forNode(line.node).get('text-color-internal');
      });
      return text.exit().remove();
    },
    onTick: noop
  });

  var nodeOverlay = new neo.Renderer({
    onGraphChange: function onGraphChange(selection) {
      var circles = selection.selectAll('circle.overlay').data(function (node) {
        return node.selected ? [node] : [];
      });
      circles.enter().insert('circle', '.outline').classed('ring', true).classed('overlay', true).attr({
        cx: 0, cy: 0, fill: '#f5F6F6', stroke: 'rgba(151, 151, 151, 0.2)', 'stroke-width': '3px' });
      circles.attr({ r: function r(node) {
          return node.radius + 6;
        } });
      return circles.exit().remove();
    },
    onTick: noop
  });

  var arrowPath = new neo.Renderer({
    onGraphChange: function onGraphChange(selection, viz) {
      var paths = selection.selectAll('path').data(function (rel) {
        return [rel];
      });
      paths.enter().append('path');
      paths.attr('fill', function (rel) {
        return viz.style.forRelationship(rel).get('color');
      }).attr('stroke', 'none');
      return paths.exit().remove();
    },
    onTick: function onTick(selection) {
      return selection.selectAll('path').attr('d', function (d) {
        return d.arrowOutline;
      }).attr('transform', function (d) {
        return isNaN(d.startPoint.x) || isNaN(d.startPoint.y) ? null : "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")";
      });
    }
  });

  var relationshipType = new neo.Renderer({
    onGraphChange: function onGraphChange(selection, viz) {
      var texts = selection.selectAll("text").data(function (rel) {
        return [rel];
      });
      texts.enter().append("text").attr({ "text-anchor": "middle" });
      texts.attr('font-size', function (rel) {
        return viz.style.forRelationship(rel).get('font-size');
      }).attr('fill', function (rel) {
        return viz.style.forRelationship(rel).get('text-color-' + rel.captionLayout);
      });
      return texts.exit().remove();
    },
    onTick: function onTick(selection, viz) {
      return selection.selectAll('text').attr('x', function (rel) {
        return isNaN(rel.midShaftPoint.x) ? null : rel.midShaftPoint.x;
      }).attr('y', function (rel) {
        return isNaN(rel.midShaftPoint.y) ? null : rel.midShaftPoint.y + parseFloat(viz.style.forRelationship(rel).get('font-size')) / 2 - 1;
      }).attr('transform', function (rel) {
        return isNaN(rel.midShaftPoint.x) || isNaN(rel.midShaftPoint.y) ? null : "rotate(" + rel.textAngle + " " + rel.midShaftPoint.x + " " + rel.midShaftPoint.y + ")";
      }).text(function (rel) {
        return rel.shortCaption;
      });
    }
  });

  var relationshipOverlay = new neo.Renderer({
    onGraphChange: function onGraphChange(selection) {
      var rects = selection.selectAll("rect").data(function (rel) {
        return [rel];
      });
      var band = 20;
      rects.enter().append('rect').classed('overlay', true).attr('fill', 'yellow').attr('x', 0).attr('y', -band / 2).attr('height', band);
      rects.attr('opacity', function (rel) {
        return rel.selected ? 0.3 : 0;
      });
      return rects.exit().remove();
    },
    onTick: function onTick(selection) {
      return selection.selectAll('rect').attr('width', function (d) {
        return d.arrowLength > 0 ? d.arrowLength : 0;
      }).attr('transform', function (d) {
        return isNaN(d.startPoint.x) || isNaN(d.startPoint.y) ? null : "translate(" + d.startPoint.x + " " + d.startPoint.y + ") rotate(" + d.angle + ")";
      });
    }
  });

  neo.renderers.node.push(nodeOutline);
  neo.renderers.node.push(nodeCaption);
  neo.renderers.node.push(nodeOverlay);
  neo.renderers.relationship.push(arrowPath);
  neo.renderers.relationship.push(relationshipType);
  return neo.renderers.relationship.push(relationshipOverlay);
})();

exports.default = neo;