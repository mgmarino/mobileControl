function (data) {
  	$("#deviceParameters").trigger("create");
  	$(".account").trigger("_init");
  	$("#voltage").slider();
    return data;
}
