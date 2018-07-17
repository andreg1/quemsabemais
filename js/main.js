
import * as db from './database.js';



$(document).ready(function () {
    db.Load(loadDashboard);

    $("#tblCategories").on("click", "button.deleteButton", (event) => {
        deleteCategory($(event.target).parents("tr"));
    });
    $("#tblCategories").on("click", "button.saveButton", (event) => {
        updateCategory($(event.target).parents("tr"));
    });
    $("#btNewCategory").click(() => {
        var categoryName = $('input[name=tbCategory]').val();
        createCategory(categoryName);
        $('input[name=tbCategory]').val(""); // clear val
    });


    $("#tblQuizzes").on("click", "button.deleteButton", (event) => {
        deleteQuizz($(event.target).parents("tr"));
    });
    $("#tblCategories, #tblQuizzes").on("click", "button.editButton", (event) => {
        editMode($(event.target).parents("tr"));
    });
    $("#btNewQuizz").click((event) => {
        addQuizzView(event.target);
    });
    $("#newQuizzForm button[type=submit]").click(() => {
        createQuizz();
    });

    $('#addQuestion').click((event)=>{
        addQuestionView(event.target);
    });
    //engine.loadCategories();
});


function loadDashboard() {
    loadCategories();
    loadQuizzes();
}



/* #region Category */

function createCategory(name) {
    db.createCategory(name);
    
    loadCategories();
}

function loadCategories() {
    clearCategories();

    $.each(db.getCategories(), (index, value) => {
        $('#tblCategories tbody').append(`
            <tr data-Id="${index}">
                <td><label id="lblCategoryName">${value.name}</label></td>
                <td><button class="editButton">Editar</button></td>
                <td><button class="deleteButton">Apagar</button></td>
            </tr>
        `);
    });
}

function updateCategory($row){
    var id = $row.attr("data-Id");
    var name = $row.find("input[name=categoryName]").val();

    db.updateCategory(id, name);
    loadCategories();
}

function deleteCategory($row) {
    var id = $row.attr("data-Id");

    db.deleteCategory(id);
    
    loadCategories();
    loadQuizzes();
}

function clearCategories() {
    $("#tblCategories tbody").empty();
}

function viewMode($row) {
    $row.html(`
        <td>${$row.find("input[name=categoryName]").val()}</td>
        <td><button class="editButton">Editar</button></td>
        <td><button class="deleteButton">Apagar</button></td>
    `);
}
function editMode($row) {
    $row.html(`
        <td><input type="text" name="categoryName" class="form-control" value="${$row.find("#lblCategoryName").text()}"/></td>
        <td><button class="saveButton">Gravar</button></td>
    `);
}

/* #endregion */



/* #region Quizz */


/* #endregion */ 









