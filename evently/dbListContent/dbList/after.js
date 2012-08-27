function (data) {
    $.log("evently/dbListContent/after.js" );
   	if (!$firstview) {$("#dbListContent").trigger("create");}
   	$firstview = false;
    return data;
}
