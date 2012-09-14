function(e, name, pass) {
  var elem = $(".account");
  $.couch.login({
    name : name,
    password : pass,
    success : function(r) {
      $('#login').dialog('close');
      elem.trigger("_init")
    },
    error : function(data) {
      $("#loginstatus")
  	  .text("Wrong username and/or password")
  	  .css("color", "red")
  	  .fadeIn(500);
  	  $("#login").trigger("create");
    }
  });      
}
