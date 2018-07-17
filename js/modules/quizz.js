

function createQuizz(){
    var name = $("#newQuizzForm input[name=quizzName]").val();

}

    
    // loadQuizzes(categoryID) {
    //     clearQuizzes();
    //     var quizzes = data.categories[categoryID].quizzes;
    //     $.each(quizzes, (index, value) => {
    //         $('#tblQuizzes tbody').append(`
    //             <tr>
    //                 <td>${value.name}</td>
    //                 <td><button class="deleteButton">Apagar</button></td>
    //             </tr>`);
    //     });
    // }
function loadQuizzes() {
    clearQuizzes();
    $.each(categories, (index, category) => {
        $.each(category.quizzes, (index, quizz) => {
            $("#tblQuizzes tbody").append(`
                <tr>
                    <td>${quizz.name}</td><td>${category.name}</td>
                    <td><button class="deleteButton">Apagar</button></td>
                </tr>`);
        });
    });
}
//general use
function clearQuizzes() {
    $("#tblQuizzes tbody").empty();
}
function addQuizzView(target){
    loadCategoriesDropdown(); //load first, then show

    $(target).hide();
    $('#newQuizzForm').removeClass('d-none');
}
function addQuestionView(target){

    $('#questionList').hide();
    $('#newQuestionForm').removeClass('d-none');
}