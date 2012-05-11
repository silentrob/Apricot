Apricot = require('../lib/apricot').Apricot;

// Use Case one
console.log("UC 1");


Apricot.parse("<p id='test'>A simple <b>test</b> string. <b>Nothing to worry about</b></p>", function(err, doc) {
  doc.find('b');
  doc.remove();
  console.log(doc.toHTML);
});

Apricot.parse("That's my <b id='test'>spoon</b> Tyler.", function(err,doc) {  
  doc.find('b').inner("food");
  console.log(doc.toHTML);
  
});

Apricot.open("test.html", function(err, doc){
  doc.find('p');
  // el is the html Element found by find.
  doc.each(function(el){
    console.log(el.innerHTML);
  })
  
});

Apricot.open("test.html", function(err, doc){
  doc.find('span').removeClass('hot');
  doc.find('li').addClass('list_item').addClass('main_list');  
  console.log(doc.toHTML);

});

// Another Example of looping
Apricot.open('http://www.silentrob.me', function(err, doc){
  console.log("Looping 2");
  doc.find('a');

  var links = [];
  
  doc.each(function(el){
    links.push(el.href);
  })

  console.log((links.unique()).join('\n\r'));      
});


Array.prototype.unique = function () {
 var r = new Array();
 o:for(var i = 0, n = this.length; i < n; i++) {
   for(var x = 0, y = r.length; x < y; x++) {
     if(r[x]==this[i]) {
       continue o;
     }
   }
   r[r.length] = this[i];
 }
 return r;
}
