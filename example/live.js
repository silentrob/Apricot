Apricot = require('apricot').Apricot;

Apricot.open("live.html", function(err,doc) {

  doc.find('li:last').each(function(el){
    console.log(el.outerHTML);
  });
  
  setTimeout(function(){
    doc.find('li:last').each(function(el){
      console.log(el.outerHTML);
    });
  },400);
  
},true);
