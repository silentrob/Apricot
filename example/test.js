  var i = 0;
  
  function addItem() {
    var list = document.getElementById("list");
    var li = document.createElement("li");
    li.innerHTML = "New Item " + i;
    list.appendChild(li); 
    i++;
   
  }
  
  window.onload = function() {
    addItem();
    addItem();   
  }

