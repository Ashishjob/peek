/******/ (() => { // webpackBootstrap
/*!************************!*\
  !*** ./src/content.js ***!
  \************************/
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return r; }; var t, r = {}, e = Object.prototype, n = e.hasOwnProperty, o = "function" == typeof Symbol ? Symbol : {}, i = o.iterator || "@@iterator", a = o.asyncIterator || "@@asyncIterator", u = o.toStringTag || "@@toStringTag"; function c(t, r, e, n) { return Object.defineProperty(t, r, { value: e, enumerable: !n, configurable: !n, writable: !n }); } try { c({}, ""); } catch (t) { c = function c(t, r, e) { return t[r] = e; }; } function h(r, e, n, o) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype); return c(a, "_invoke", function (r, e, n) { var o = 1; return function (i, a) { if (3 === o) throw Error("Generator is already running"); if (4 === o) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var u = n.delegate; if (u) { var c = d(u, n); if (c) { if (c === f) continue; return c; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (1 === o) throw o = 4, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = 3; var h = s(r, e, n); if ("normal" === h.type) { if (o = n.done ? 4 : 2, h.arg === f) continue; return { value: h.arg, done: n.done }; } "throw" === h.type && (o = 4, n.method = "throw", n.arg = h.arg); } }; }(r, n, new Context(o || [])), !0), a; } function s(t, r, e) { try { return { type: "normal", arg: t.call(r, e) }; } catch (t) { return { type: "throw", arg: t }; } } r.wrap = h; var f = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var l = {}; c(l, i, function () { return this; }); var p = Object.getPrototypeOf, y = p && p(p(x([]))); y && y !== e && n.call(y, i) && (l = y); var v = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(l); function g(t) { ["next", "throw", "return"].forEach(function (r) { c(t, r, function (t) { return this._invoke(r, t); }); }); } function AsyncIterator(t, r) { function e(o, i, a, u) { var c = s(t[o], t, i); if ("throw" !== c.type) { var h = c.arg, f = h.value; return f && "object" == _typeof(f) && n.call(f, "__await") ? r.resolve(f.__await).then(function (t) { e("next", t, a, u); }, function (t) { e("throw", t, a, u); }) : r.resolve(f).then(function (t) { h.value = t, a(h); }, function (t) { return e("throw", t, a, u); }); } u(c.arg); } var o; c(this, "_invoke", function (t, n) { function i() { return new r(function (r, o) { e(t, n, r, o); }); } return o = o ? o.then(i, i) : i(); }, !0); } function d(r, e) { var n = e.method, o = r.i[n]; if (o === t) return e.delegate = null, "throw" === n && r.i["return"] && (e.method = "return", e.arg = t, d(r, e), "throw" === e.method) || "return" !== n && (e.method = "throw", e.arg = new TypeError("The iterator does not provide a '" + n + "' method")), f; var i = s(o, r.i, e.arg); if ("throw" === i.type) return e.method = "throw", e.arg = i.arg, e.delegate = null, f; var a = i.arg; return a ? a.done ? (e[r.r] = a.value, e.next = r.n, "return" !== e.method && (e.method = "next", e.arg = t), e.delegate = null, f) : a : (e.method = "throw", e.arg = new TypeError("iterator result is not an object"), e.delegate = null, f); } function w(t) { this.tryEntries.push(t); } function m(r) { var e = r[4] || {}; e.type = "normal", e.arg = t, r[4] = e; } function Context(t) { this.tryEntries = [[-1]], t.forEach(w, this), this.reset(!0); } function x(r) { if (null != r) { var e = r[i]; if (e) return e.call(r); if ("function" == typeof r.next) return r; if (!isNaN(r.length)) { var o = -1, a = function e() { for (; ++o < r.length;) if (n.call(r, o)) return e.value = r[o], e.done = !1, e; return e.value = t, e.done = !0, e; }; return a.next = a; } } throw new TypeError(_typeof(r) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, c(v, "constructor", GeneratorFunctionPrototype), c(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = c(GeneratorFunctionPrototype, u, "GeneratorFunction"), r.isGeneratorFunction = function (t) { var r = "function" == typeof t && t.constructor; return !!r && (r === GeneratorFunction || "GeneratorFunction" === (r.displayName || r.name)); }, r.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, c(t, u, "GeneratorFunction")), t.prototype = Object.create(v), t; }, r.awrap = function (t) { return { __await: t }; }, g(AsyncIterator.prototype), c(AsyncIterator.prototype, a, function () { return this; }), r.AsyncIterator = AsyncIterator, r.async = function (t, e, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(h(t, e, n, o), i); return r.isGeneratorFunction(e) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, g(v), c(v, u, "Generator"), c(v, i, function () { return this; }), c(v, "toString", function () { return "[object Generator]"; }), r.keys = function (t) { var r = Object(t), e = []; for (var n in r) e.unshift(n); return function t() { for (; e.length;) if ((n = e.pop()) in r) return t.value = n, t.done = !1, t; return t.done = !0, t; }; }, r.values = x, Context.prototype = { constructor: Context, reset: function reset(r) { if (this.prev = this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(m), !r) for (var e in this) "t" === e.charAt(0) && n.call(this, e) && !isNaN(+e.slice(1)) && (this[e] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0][4]; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(r) { if (this.done) throw r; var e = this; function n(t) { a.type = "throw", a.arg = r, e.next = t; } for (var o = e.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i[4], u = this.prev, c = i[1], h = i[2]; if (-1 === i[0]) return n("end"), !1; if (!c && !h) throw Error("try statement without catch or finally"); if (null != i[0] && i[0] <= u) { if (u < c) return this.method = "next", this.arg = t, n(c), !0; if (u < h) return n(h), !1; } } }, abrupt: function abrupt(t, r) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var n = this.tryEntries[e]; if (n[0] > -1 && n[0] <= this.prev && this.prev < n[2]) { var o = n; break; } } o && ("break" === t || "continue" === t) && o[0] <= r && r <= o[2] && (o = null); var i = o ? o[4] : {}; return i.type = t, i.arg = r, o ? (this.method = "next", this.next = o[2], f) : this.complete(i); }, complete: function complete(t, r) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && r && (this.next = r), f; }, finish: function finish(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[2] === t) return this.complete(e[4], e[3]), m(e), f; } }, "catch": function _catch(t) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var e = this.tryEntries[r]; if (e[0] === t) { var n = e[4]; if ("throw" === n.type) { var o = n.arg; m(e); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(r, e, n) { return this.delegate = { i: x(r), r: e, n: n }, "next" === this.method && (this.arg = t), f; } }, r; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Keep track of current page content and vectors
var pageContent = {
  chunks: [],
  vectors: []
};

// Keep track of highlighted results
var highlightedElements = [];
var currentResultIndex = -1;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log('Content script received message:', request);
  switch (request.action) {
    case 'performSearch':
      handleSearch(request.query, request.threshold, sendResponse);
      return true;
    // Keep the message channel open for the async response

    case 'scrollToResult':
      scrollToResult(request.index);
      break;
    case 'clearHighlights':
      clearHighlights();
      break;
  }
});

// Function to extract text content from the page
function extractPageContent() {
  // Get body text content, excluding scripts, styles, etc.
  var body = document.body;
  var chunks = [];

  // Function to recursively extract text from DOM nodes
  function extractTextFromNode(node) {
    var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Skip script, style, and other non-content elements
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'NOSCRIPT' || node.tagName === 'IFRAME') {
      return;
    }

    // If this is a text node with content
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
      var parentElement = node.parentElement;
      chunks.push({
        text: node.textContent.trim(),
        node: parentElement || node,
        index: chunks.length
      });
      return;
    }

    // If this is an element node with children
    if (node.nodeType === Node.ELEMENT_NODE) {
      // For block-level elements or elements with significant content, consider them as chunks
      var isBlockOrSignificant = getComputedStyle(node).display === 'block' || ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI'].includes(node.tagName);
      if (isBlockOrSignificant && node.textContent.trim().length > 0) {
        // Only add as a chunk if it has immediate text children
        // (and not just text from deeply nested elements)
        var hasDirectTextContent = false;
        for (var i = 0; i < node.childNodes.length; i++) {
          if (node.childNodes[i].nodeType === Node.TEXT_NODE && node.childNodes[i].textContent.trim().length > 0) {
            hasDirectTextContent = true;
            break;
          }
        }
        if (hasDirectTextContent) {
          chunks.push({
            text: node.textContent.trim(),
            node: node,
            index: chunks.length
          });
          return;
        }
      }

      // Recursively process child nodes
      for (var _i = 0; _i < node.childNodes.length; _i++) {
        extractTextFromNode(node.childNodes[_i], depth + 1);
      }
    }
  }
  extractTextFromNode(body);
  return chunks;
}

// Function to handle search request
function handleSearch(_x, _x2, _x3) {
  return _handleSearch.apply(this, arguments);
} // Temporary function to perform keyword search
// This will be replaced with semantic search once we integrate embeddings
function _handleSearch() {
  _handleSearch = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee(query, threshold, sendResponse) {
    var results;
    return _regeneratorRuntime().wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          try {
            clearHighlights();

            // Extract page content if not already done
            if (pageContent.chunks.length === 0) {
              pageContent.chunks = extractPageContent();
              console.log("Extracted ".concat(pageContent.chunks.length, " text chunks from page"));
            }

            // For now, we'll use a simple keyword-based approach as a placeholder
            // In the full implementation, this would use the embedded vectors
            results = performKeywordSearch(query, pageContent.chunks, threshold); // Highlight the results on the page
            highlightResults(results);

            // Send results back to popup
            sendResponse({
              results: results
            });
          } catch (error) {
            console.error('Error performing search:', error);
            sendResponse({
              error: error.message
            });
          }
        case 1:
        case "end":
          return _context.stop();
      }
    }, _callee);
  }));
  return _handleSearch.apply(this, arguments);
}
function performKeywordSearch(query, chunks, threshold) {
  var results = [];
  var queryLower = query.toLowerCase();
  chunks.forEach(function (chunk) {
    var textLower = chunk.text.toLowerCase();
    if (textLower.includes(queryLower)) {
      // Calculate a simple "similarity" based on number of occurrences
      // This is a placeholder for the actual vector similarity
      var occurrences = (textLower.match(new RegExp(queryLower, 'g')) || []).length;
      var similarity = Math.min(0.5 + occurrences * 0.1, 0.95);
      if (similarity >= threshold) {
        results.push({
          index: chunk.index,
          text: chunk.text,
          similarity: similarity
        });
      }
    }
  });
  return results.sort(function (a, b) {
    return b.similarity - a.similarity;
  });
}

// Function to highlight search results on the page
function highlightResults(results) {
  if (!results || results.length === 0) return;
  results.forEach(function (result) {
    var chunk = pageContent.chunks[result.index];
    if (!chunk || !chunk.node) return;

    // Create a highlight element to wrap the content
    var originalContent = chunk.node.innerHTML;
    var highlightColor = getHighlightColor(result.similarity);

    // Apply the highlight style
    chunk.node.style.backgroundColor = highlightColor;
    chunk.node.style.transition = 'background-color 0.3s';

    // Keep track of highlighted elements for later removal
    highlightedElements.push({
      element: chunk.node,
      originalContent: originalContent
    });
  });

  // Scroll to the first result
  if (results.length > 0) {
    scrollToResult(0);
  }
}

// Function to scroll to a specific result
function scrollToResult(index) {
  if (index < 0 || index >= pageContent.chunks.length) return;
  var chunk = pageContent.chunks[index];
  if (!chunk || !chunk.node) return;

  // Remove highlight from previous result if any
  if (currentResultIndex >= 0 && currentResultIndex < highlightedElements.length) {
    var prevElement = highlightedElements[currentResultIndex].element;
    if (prevElement) {
      prevElement.style.outline = 'none';
    }
  }

  // Add highlight to current result
  chunk.node.style.outline = '2px solid #4285f4';
  chunk.node.style.outlineOffset = '-2px';

  // Scroll the element into view
  chunk.node.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });
  currentResultIndex = index;
}

// Function to clear all highlights
function clearHighlights() {
  highlightedElements.forEach(function (highlight) {
    highlight.element.style.backgroundColor = '';
    highlight.element.style.outline = '';
  });
  highlightedElements = [];
  currentResultIndex = -1;
}

// Utility function to get highlight color based on similarity score
function getHighlightColor(similarity) {
  // Convert similarity (0.0-1.0) to a yellow-to-green gradient
  var r = Math.floor(255 - similarity * 100);
  var g = 255;
  var b = 0;
  return "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", 0.3)");
}

// Initialize when the content script loads
console.log('peek Semantic Search content script initialized');
/******/ })()
;
//# sourceMappingURL=content.js.map