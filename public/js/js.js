$(document).ready(function(){


})

function readURL(input) {
   if (input.files && input.files[0]) {
       var reader = new FileReader();
       reader.onload = function (e) {
           $('#ImageDiv img')
               .attr('src', e.target.result);
       };
       reader.readAsDataURL(input.files[0]);
   }
}

$(document).on("click", ".changeicons > i", function() {
  // console.log($(this).parent().parent().parent().attr('id'));
  $('#delete-id').val($(this).parent().parent().parent().attr('id'));
  $('#edit-id').val($(this).parent().parent().parent().attr('id'));
    // console.log($('.changeicons').parent().parent().closest('div').attr('id'));
    // console.log($('.changeicons').parent().parent().find('.description').text());
    var desc = $(this).parent().parent().parent().find('.description').text();
    var tgs = $(this).parent().parent().parent().find('.tags').text()
    $('.descriptionarea').val(desc);
    $('.taginput').val(tgs);
});
