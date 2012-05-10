Apricot
===

Apricot is a HTML / DOM parser, scraper for Nodejs.
It is inspired by [rubys hpricot](http://github.com/whymirror/hpricot) and designed to fetch, iterate, and augment html or html fragments.


Install
---

    npm install apricot

    
Getting Started
---
    Apricot.parse("<p id='test'>An HTML Fragment</p>", function(err, doc) {
      // Do something awesome here..
    });
    
    // OR Open a remote website, or local file
    
    Apricot.open("http://my_awesome_website.com", function(err, doc) {
      // Do something awesome here..
    });    

    // Experimental Live Code, third param.
    // Live mode will evaluate all javascript in the context of the page.
    
    Apricot.open( file, callback, live_mode)
    Apricot.open("http://my_awesome_website.com", function(doc) {
      // Do something awesome here..
    },true);

Packed with Awesomeness (API)
---

Parse and Open both return a Apricot Object, a HTML DOM, created by JSDOM, with all the power of the [Sizzle Selector Engine](http://wiki.github.com/jeresig/sizzle/), and [XUI Framework](http://github.com/silentrob/xui) for Augmentation.

    Apricot.parse("<p id='test'>An HTML Fragment</p>", function(doc) {
      doc.find("selector");     // Populates internal collection, See Sizzle selector syntax (rules)
      doc.each(callback);       // Itterates over the collection, applying a callback to each match (element)
      doc.remove();             // Removes all elements in the internal collection (See XUI Syntax)
    
      doc.inner("fragment");    // See XUI Syntax
      doc.outer("fragment");    // See XUI Syntax    
      doc.top("fragment");      // See XUI Syntax
      doc.bottom("fragment");   // See XUI Syntax
      doc.before("fragment");   // See XUI Syntax
      doc.after("fragment");    // See XUI Syntax
      doc.hasClass("class");    // See XUI Syntax      
      doc.addClass("class");    // See XUI Syntax            
      doc.removeClass("class"); // See XUI Syntax            
      
      doc.toHTML;               // Returns the HTML
      doc.innerHTML;            // Returns the innerHTML of the body.
      doc.toDOM;                // Returns the DOM representation
      
      // Most methods are chainable, so this works
      doc.find("selector").addClass('foo').after(", just because");
      
    });
    

Problems?
---
Apricot requires [JSDom](http://github.com/tmpvar/jsdom) and [htmlparser](http://github.com/tautologistics/node-htmlparser), these should be brought in via npm when you install apricot, but if you have problems

    $ npm install jsdom
    $ npm install htmlparser    

Contributors
---
* alexkappa 
* lancefisher
* brog45
* vrutberg 
* chandlerkent
* jamesaduncan

TODO 
---
* Cleanup Code, hide privates, etc.
* Tests

LICENSE (MIT)
---

_Copyright (c) 2010 Rob Ellis_

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

