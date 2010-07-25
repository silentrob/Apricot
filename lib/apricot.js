
exports.Apricot = Apricot;

function Apricot(content) {
  
  var dom = require('jsdom-0.0.1/level1/core').dom.level1.core;
  var browser = require('jsdom-0.0.1/browser/index').windowAugmentation(dom);

  // TODO, content should be applied to the whole document, not the body.
  browser.document.body.innerHTML = content;
  this.document = browser.document
  this.matches = [];
  
  this.__defineGetter__("toHTML", function(){
    return this.document.body.innerHTML;
  });

  this.__defineGetter__("innerHTML", function(){
    return this.document.body.firstChild.innerHTML;
  });
  
  this.__defineGetter__("toDOM", function(){
    return this.document.body;
  });  
}


Apricot.prototype = {
  find : function(pattern) {
    var m = [];
    var sizzleSandbox = {};
    var sizzle = require("./sizzle").sizzleInit(sizzleSandbox,this.document);
    m = sizzle(pattern);
    
    for (var i = 0, len = m.length; i < len; ++i) {
      this.matches.push(m[i]);
    }
    return this;
  },
  
  each : function(fn) {
    for (var i = 0, len = this.matches.length; i < len; ++i) {
      fn.call(this,this.matches[i]);
    }
    return this;
  },
  
  remove  : function (html) { return this.html('remove', html); },
  inner   : function (html) { return this.html('inner', html); },
  outer   : function (html) { return this.html('outer', html); },
  top     : function (html) { return this.html('top', html); },
  bottom  : function (html) { return this.html('bottom', html); },
  before  : function (html) { return this.html('before', html); },
  after   : function (html) { return this.html('after', html); },
  
  html    : function(location, html) {
    this._clean(this);

    if (arguments.length == 0) {
      return this[0].innerHTML;
    }
    if (arguments.length == 1 && arguments[0] != 'remove') {
      html = location;
      location = 'inner';
    }

    return this.each(function(el) {
      var parent, list, len, i = 0;
      
      if (location == "inner") {
              
        if (typeof html == 'string') {
          el.innerHTML = html;
          list = el.getElementsByTagName('SCRIPT');
          len = list.length;
          for (; i < len; i++) {
            eval(list[i].text);
          }
        } else {
          el.innerHTML = '';
          el.appendChild(html);
        }
      } else if (location == "outer") {
        el.parentNode.replaceChild(this._wrapHelper(html, el), el);
      } else if (location == "top") {
        el.insertBefore(this._wrapHelper(html, el), el.firstChild);
      } else if (location == "bottom") {
        el.insertBefore(this._wrapHelper(html, el), null);
      } else if (location == "before") {
        el.parentNode.insertBefore(this._wrapHelper(html, el.parentNode), el);
      } else if (location == "after") {
        el.parentNode.insertBefore(this._wrapHelper(html, el.parentNode), el.nextSibling);
      } else if (location == "remove") {
        el.parentNode.removeChild(el);
      }
    });
  },
  
  hasClass: function(className, callback) {
     
    return (callback === undefined && this.matches.length == 1) ?
    hasClass(this.matches[0], className) :
    this.each(function(el) {
      if (hasClass(el, className)) {
        callback(el);
      }
    });
  },

  removeClass: function(className) {
    if (className === undefined) {
      this.each(function(el) {
        el.className = '';
      });
    } else {
      var re = getClassRegEx(className);
      this.each(function(el) {
        el.className = el.className.replace(re, '');
      });
    }
    return this;
  },

  addClass: function(className) {
    return this.each(function(el) {
      if (hasClass(el, className) === false) {
        el.className = trim(el.className + ' ' + className);
      }
    });
  },     
    
    
  // private instance method
  _wrapHelper : function(html, el) {
    return (typeof html === "string") ? this._wrap(html, getTag(el)) : html;
  },

  // private instance method
  _clean : function(collection) {
    var ns = /\S/;
    collection.each(function(el) {
      var d = el,
      n = d.firstChild,
      ni = -1,
      nx;
      while (n) {
        nx = n.nextSibling;
        if (n.nodeType == 3 && !ns.test(n.nodeValue)) {
          d.removeChild(n);
        } else {
          n.nodeIndex = ++ni; 
        }
        n = nx;
      }
    });
  },

  // private instance method
    _wrap : function(xhtml, tag) {

      var attributes = {},
        re = /^<([A-Z][A-Z0-9]*)([^>]*)>(.*)<\/\1>/i,
        element,
        x,
        a,
        i = 0,
        attr,
        node,
        attrList;

    if (re.test(xhtml)) {
        result = re.exec(xhtml);
        tag = result[1];

        // if the node has any attributes, convert to object
        if (result[2] !== "") {
            attrList = result[2].split(/([A-Z]*\s*=\s*['|"][A-Z0-9:;#\s]*['|"])/i);

            for (; i < attrList.length; i++) {
                attr = attrList[i].replace(/^\s*|\s*$/g, "");
                if (attr !== "" && attr !== " ") {
                    node = attr.split('=');
                    attributes[node[0]] = node[1].replace(/(["']?)/g, '');
                }
            }
        }
        xhtml = result[3];
    }

    if (typeof(tag) === "undefined") {
      element = this.document.createTextNode(xhtml)
    } else {
      element = this.document.createElement(tag);
      for (x in attributes) {
          a = doc.createAttribute(x);
          a.nodeValue = attributes[x];
          element.setAttributeNode(a);
      }
      element.innerHTML = xhtml;
    }
    return element;
  },
    
}


// Starting point for  data, returns a new Apricot Object
Apricot.parse = function(data,callback) {
  callback(new Apricot(data));
}

// Starting point for File / HTTP, returns a new Apricot Object
Apricot.open = function(file,callback) {
  http = require('http'),
  fs = require('fs'),
  path = require('path'),
  url = require('url'),

  fnLoaderHandle = function (err, data) {
    if (err) throw err;
    var h = new Apricot(data);
    callback(h);
  }

  if (file.match(/^https?:\/\//)) {
    var urlInfo = url.parse(file, parseQueryString=false),
    host = http.createClient(((urlInfo.protocol === 'http:') ? 80 : 443), urlInfo.hostname),
    req_url = urlInfo.pathname;

    if (urlInfo.search) {
      req_url += urlInfo.search;
    }
    var request = host.request('GET', req_url, { host: urlInfo.hostname });

    request.addListener('response', function (response) {
      var data = '';
      response.addListener('data', function (chunk) {
        data += chunk;
      });
      response.addListener("end", function() {
        fnLoaderHandle(null, data);
      });
    });
    if (request.end) {
      request.end();
    } else {
      request.close();
    }
      
  } else {
    fs.readFile(file, encoding='utf8', fnLoaderHandle);
  }
}


// Helpers

var reClassNameCache = {},

// Via jQuery - used to avoid el.className = ' foo';
// Used for trimming whitespace
var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

// Helper for html Method
getTag = function(el) {
  return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
}

getClassRegEx = function(className) {
  var re = reClassNameCache[className];
  if (!re) {
    re = new RegExp('(?:^|\\s+)' + className + '(?:\\s+|$)');
    reClassNameCache[className] = re;
  }
  return re;
};

hasClass = function(el, className) {
  return getClassRegEx(className).test(el.className);
}

trim = function(text) {
  return (text || "").replace( rtrim, "" );
}



