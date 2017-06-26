'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.graphRenderer = undefined;

var _jquery = require('jquery');

var _jquery2 = _interopRequireDefault(_jquery);

var _d = require('d3');

var d3 = _interopRequireWildcard(_d);

var _util = require('./util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var graphRenderer = function graphRenderer() {

  var styleContents = 'node {\n      diameter: 40px;\n      color: #DFE1E3;\n      border-color: #D4D6D7;\n      border-width: 2px;\n      text-color-internal: #000000;\n      text-color-external: #000000;\n      caption: \'{name}\';\n      font-size: 12px;\n    }\n    relationship {\n      color: #4356C0;\n      shaft-width: 3px;\n      font-size: 9px;\n      padding: 3px;\n      text-color-external: #000000;\n      text-color-internal: #FFFFFF;\n    }\n';

  var skip = ["id", "start", "end", "source", "target", "labels", "type", "selected", "properties"];
  var entities = ["name", "title", "tag", "username", "lastname", "caption"];

  var svgStyling = '<style>\ntext{font-family:sans-serif}\n</style>';
  var stylingUrl = window.location.hostname === 'www.neo4j.org' ? 'http://gist.neo4j.org/css/neod3' : 'styles/neod3';
  if (window.isInternetExplorer) {
    stylingUrl += '-ie.css';
  } else {
    stylingUrl += '.css';
  }

  var existingStyles = {};
  var currentColor = 1;

  var render = function render(id, $container, visualization) {
    var extractProps = function extractProps(pc) {
      var p = {};
      for (var key in pc) {
        if (!pc.hasOwnProperty(key) || skip.indexOf(key) !== -1) continue;
        p[key] = pc[key];
      }
      return p;
    };

    var nodeStyles = function nodeStyles(nodes) {
      var label = function label(n) {
        var labels = n["labels"];
        if (labels && labels.length) {
          return labels[labels.length - 1];
        }
        return "";
      };

      var style = {};

      var _loop = function _loop(i) {
        var props = nodes[i].properties = extractProps(nodes[i]);
        var keys = Object.keys(props);
        if (label(nodes[i]) !== "" && keys.length > 0) {
          var selectedKeys = entities.filter(function (k) {
            return keys.indexOf(k) !== -1;
          });
          selectedKeys = selectedKeys.concat(keys).concat(['id']);
          var selector = 'node.' + label(nodes[i]);
          var selectedKey = selectedKeys[0];
          if (typeof props[selectedKey] === "string" && props[selectedKey].length > 30) {
            props[selectedKey] = props[selectedKey].substring(0, 30) + ' ...';
          }
          style[selector] = style[selector] || selectedKey;
        }
      };

      for (var i = 0; i < nodes.length; i++) {
        _loop(i);
      }
      return style;
    };

    var styleSheet = function styleSheet(styles, styleContents) {
      var format = function format(key) {
        var item = styles[key];
        return item.selector + " {caption: '{" + item.caption + "}'; color: " + item.color + "; border-color: " + item['border-color'] + "; text-color-internal: " + item['text-color-internal'] + "; text-color-external: " + item['text-color-external'] + "; }";
      };
      return styleContents + Object.keys(styles).map(format).join("\n");
    };

    var createStyles = function createStyles(styleCaptions, styles) {
      var colors = _util2.default.style.defaults.colors;

      for (var selector in styleCaptions) {
        if (!(selector in styles)) {
          var color = colors[currentColor];
          currentColor = (currentColor + 1) % colors.length;
          var textColor = window.isInternetExplorer ? '#000000' : color['text-color-internal'];
          var style = { selector: selector, caption: styleCaptions[selector], color: color.color,
            "border-color": color['border-color'], "text-color-internal": textColor, "text-color-external": textColor };
          styles[selector] = style;
        }
      }
      return styles;
    };

    var applyZoom = function applyZoom() {
      renderer.select(".nodes").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
      renderer.select(".relationships").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    };

    var enableZoomHandlers = function enableZoomHandlers() {
      renderer.on("wheel.zoom", zoomHandlers.wheel);
      renderer.on("mousewheel.zoom", zoomHandlers.mousewheel);
      renderer.on("mousedown.zoom", zoomHandlers.mousedown);
      renderer.on("DOMMouseScroll.zoom", zoomHandlers.DOMMouseScroll);
      renderer.on("touchstart.zoom", zoomHandlers.touchstart);
      renderer.on("touchmove.zoom", zoomHandlers.touchmove);
      renderer.on("touchend.zoom", zoomHandlers.touchend);
    };

    var disableZoomHandlers = function disableZoomHandlers() {
      renderer.on("wheel.zoom", null);
      renderer.on("mousewheel.zoom", null);
      renderer.on("mousedown.zoom", null);
      renderer.on("DOMMouseScroll.zoom", null);
      renderer.on("touchstart.zoom", null);
      renderer.on("touchmove.zoom", null);
      renderer.on("touchend.zoom", null);
    };

    var legend = function legend(svg, styles) {
      var keys = Object.keys(styles).sort();
      var circles = svg.selectAll('circle.legend').data(keys);
      var r = 20;

      circles.enter().append('circle').classed('legend', true).attr({
        cx: 2 * r,
        r: r
      });

      circles.attr({
        cy: function cy(node) {
          return (keys.indexOf(node) + 1) * 2.2 * r;
        },
        fill: function fill(node) {
          return styles[node]['color'];
        },
        stroke: function stroke(node) {
          return styles[node]['border-color'];
        },
        'stroke-width': function strokeWidth(node) {
          return "2px";
        }
      });

      var text = svg.selectAll('text.legend').data(keys);
      text.enter().append('text').classed('legend', true).attr({
        'text-anchor': 'left',
        'font-weight': 'bold',
        'stroke-width': '0',
        'stroke-color': 'black',
        'fill': 'black',
        'x': 3.2 * r,
        'font-size': "12px"
      });

      text.text(function (node) {
        var label = styles[node].selector;
        return label ? label.substring(5) : "";
      }).attr('y', function (node) {
        return (keys.indexOf(node) + 1) * 2.2 * r + 6;
      });

      return circles.exit().remove();
    };

    var keyHandler = function keyHandler() {
      if (d3.event.altKey || d3.event.shiftKey) {
        enableZoomHandlers();
      } else {
        disableZoomHandlers();
      }
    };

    var links = visualization.links,
        nodes = visualization.nodes;

    for (var i = 0; i < links.length; i++) {
      links[i].source = links[i].start;
      links[i].target = links[i].end;
    }

    createStyles(nodeStyles(nodes), existingStyles);

    var graphModel = _util2.default.graphModel().nodes(nodes).relationships(links);

    var graphView = _util2.default.graphView().style(styleSheet(existingStyles, styleContents)).width($container.width()).height($container.height());

    var svg = d3.select('#' + id).append("svg");
    var renderer = svg.data([graphModel]);
    legend(svg, existingStyles);
    var zoomHandlers = {};
    var zoomBehavior = d3.behavior.zoom().on("zoom", applyZoom).scaleExtent([0.2, 8]);

    renderer.call(graphView);
    renderer.call(zoomBehavior);

    zoomHandlers.wheel = renderer.on("wheel.zoom");
    zoomHandlers.mousewheel = renderer.on("mousewheel.zoom");
    zoomHandlers.mousedown = renderer.on("mousedown.zoom");
    zoomHandlers.DOMMouseScroll = renderer.on("DOMMouseScroll.zoom");
    zoomHandlers.touchstart = renderer.on("touchstart.zoom");
    zoomHandlers.touchmove = renderer.on("touchmove.zoom");
    zoomHandlers.touchend = renderer.on("touchend.zoom");
    disableZoomHandlers();

    d3.select('body').on("keydown", keyHandler).on("keyup", keyHandler);

    var refresh = function refresh() {
      graphView.height($container.height());
      graphView.width($container.width());
      renderer.call(graphView);
    };

    return {
      'subscriptions': {
        'expand': refresh,
        'contract': refresh,
        'sizeChange': refresh
      }
    };
  };

  _jquery2.default.get(stylingUrl, function (data) {
    svgStyling = '<style>\n' + data + '\n</style>';
    (0, _jquery2.default)(svgStyling).appendTo('head');
  });

  return { 'render': render };
};

exports.graphRenderer = graphRenderer;