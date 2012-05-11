var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    util = require('util'),
    sizz = require('node-sizzle'),
    dom = require("jsdom").jsdom;
    
exports.Apricot = Apricot;

function Apricot(content,live) {
  
  this.raw = content;
  
  this.document = dom("<html><head></head><body></body></html>");
  this.window =  this.document.createWindow();
  // TODO, content should be applied to the whole document, not the body.
  this.document.body.innerHTML = content;  
  this.matches = [];
  
  if (live) {
    this.live();
  }
  
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
    this.matches = [];
    var m = [];
    
    var sizzle   = sizz.sizzleInit({ document: this.document });
    this.matches = sizzle(pattern);

    return this;
  },
  
  live: function() {
    var Script = process.binding('evals').Script;
    console.alert = function(m) {
      console.log("Alerting: " + m);
    }
    
    console.console = {
      log: function(m) {
        console.log("Console: " + m);
      }
    }

    this.window.__defineSetter__("onload", function(e){
      e.call();
    });
    
    try {
      // Setup the page
      var sandbox = {
        document:this.document, 
        window:this.window, 
        setTimeout:this.window.setTimeout,
        setInterval:this.window.setInterval,
        alert:console.alert,
        console:console.console
      }; 
      
      // Add all script blocks to the scope
      this.find('script').each(function(script){
        if (script.src) {
          var fnLoaderHandle = function(e,d) {
            Script.runInNewContext(d,sandbox);
          }
          fs.readFile(script.src, encoding='utf8', fnLoaderHandle);

        } else {
          Script.runInNewContext(script.innerHTML,sandbox);        
        }
      });

      // Call the onload (if it exists)
      this.find("[onload]").each(function(onload){
        var fnName = onload.getAttribute('onload');
        Script.runInNewContext(fnName,sandbox);
      });
      
    } catch(e){
      util.puts(util.inspect(e));
    }
    
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
    
  //
  // Private instance method
  //
  _wrapHelper : function(html, el) {
    return (typeof html === "string") ? this._wrap(html, getTag(el)) : html;
  },

  //
  // Private instance method
  //
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

  //
  // Private instance method
  //
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



  // This is the older version of ON from XUI.
  // TODO: grab the newer one.
  // TODO: add support for dispatchEvent in JSDom Level 2
  on: function(type, fn) {
    return this.each(function(el) {
      if (this.window.addEventListener) {
        el.addEventListener(type, fn, false);
      }
    });
  },  
    
}

//
// Starting point for  data, returns a new Apricot Object
//
Apricot.parse = function (data, callback) {
  try {
    var a = new Apricot(data);
  }
  catch (error) {
    console.log(error)
    return callback(error);
  }
  
  callback(null, a);
}

//
// Starting point for File / HTTP, returns a new Apricot Object
//
Apricot.open = function(file, callback, live) {

  var fnLoaderHandle = function (err, data) {
    if (err) {
      callback(err);
    }
    else {
      try { 
        var h = live ? new Apricot(data, true) : new Apricot(data);
        callback(null, h);
      } 
      catch (error) {
        callback(error);
      }
    }
  };

  if (file.match(/^https?:\/\//)) {
    var urlInfo = url.parse(file, parseQueryString=false),
    host = http.createClient(((urlInfo.protocol === 'http:') ? urlInfo.port || 80 : 443), urlInfo.hostname),
    req_url = urlInfo.pathname;

    if (urlInfo.search) {
      req_url += urlInfo.search;
    }
    var request = host.request('GET', req_url, { host: urlInfo.hostname, "User-Agent": "Apricot" });

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
};

//
// Helpers
//

var reClassNameCache = {};

// Via jQuery - used to avoid el.className = ' foo';
// Used for trimming whitespace
var rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g;

// Helper for html Method
getTag = function(el) {
  return (el.firstChild === null) ? {'UL':'LI','DL':'DT','TR':'TD'}[el.tagName] || el.tagName : el.firstChild.tagName;
};

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
};

trim = function(text) {
  return (text || "").replace( rtrim, "" );
};