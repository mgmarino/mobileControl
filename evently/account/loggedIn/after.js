function(e, r) {
  $$(this).userCtx = r.userCtx;
  $$(this).info = r.info;
  $(".account").trigger("create");
};
