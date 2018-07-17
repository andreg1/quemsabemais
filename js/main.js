
import * as db from './database.js';



$(document).ready(function () {
    db.Load(loadDashboard);

    $("#tblCategories").on("click", "button.deleteButton", (event) => {
        deleteCategory($(event.target).parents("tr"));
    });
    $("#tblCategories").on("click", "button.saveButton", (event) => {
        updateCategory($(event.target).parents("tr"));
    });
    $("#newCategory .btn-primary").click(() => {
        var categoryName = $('input[name=tbCategory]').val();
        createCategory(categoryName);
        $('#newCategory').modal('toggle');
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
    $("#saveQuizzButton").click(() => {
        saveQuizz();
    });

    $("#addQuestion").click(() => {
        toggleQuestionView();
    });

    $("button[data-target='#newQuizz']").click(() => {
        loadCategoriesDropdown();
    });

    $('#saveQuestionButton').click(() => {
        saveQuestion();
    });
    $('#cancelQuestionButton').click(() => {
        toggleQuestionView();
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
                <td><span id="lblCategoryName" class="form-control">${value.name}</span></td>
                <td>
                    <button type="button" class="editButton btn btn-primary">Editar</button>
                    <button type="button" class="deleteButton btn btn-primary">Apagar</button>
                </td>
            </tr>
        `);
    });
}

function updateCategory($row) {
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

// function viewMode($row) {
//     $row.html(`
//         <td>${$row.find("input[name=categoryName]").val()}</td>
//         <td><button type="button" class="editButton btn btn-primary">Editar</button></td>
//         <td><button type="button" class="deleteButton btn btn-primary">Apagar</button></td>
//     `);
// }
function editMode($row) {
    $row.html(`
        <td><input type="text" name="categoryName" class="form-control" value="${$row.find("#lblCategoryName").text()}"/></td>
        <td><button type="button" class="saveButton btn btn-primary">Gravar</button></td>
    `);
    $row.find("input[name=categoryName]").select();
}

function loadCategoriesDropdown() {
    $("select[name=quizzCategory] option").remove();

    //add placeholder
    $("select[name=quizzCategory]").append(`<option value="-1">Escolha uma Categoria</option>`);

    $.each(db.getCategories(), (index, category) => {
        $("select[name=quizzCategory]").append(`<option value="${index}">${category.name}</option>`);
    });
}

/* #endregion */



/* #region Quizz */


function saveQuizz() {
    var name = $("#newQuizzForm input[name=quizzName]").val();
    var categoryID = $("#newQuizzForm select[name=quizzCategory]").val();
    db.saveQuizz(name, categoryID);
    loadQuizzes();
}

function saveQuestion() {
    var question = $("#newQuestionForm input[name=question]").val();
    var explanation = $("#newQuestionForm textarea[name=answerExplanation]").val();
    var _question = { question, options: {}, explanation };
    $.each($(".newQuestionTable tbody tr"), (index, $row) => {
        $row = $($row);
        var option = $row.find("input[type=text]").val();
        var checked = $row.find("input[type=radio]").prop("checked");
        var optionID = index + 1;
        if(checked){
            _question.options.correctAnswer = optionID;
        }
        _question.options[optionID] = option;
    });

    db.saveQuestion(_question);
    loadQuestionsList();
    toggleQuestionView();
}

function loadQuestionsList() {
    $("#questionsList button").remove();
    db.getQuestions().forEach((value) => {
        $("#questionsList").append(`<button type="button" class="list-group-item list-group-item-action">${value.question}</button>`);
    });
}



// loadQuizzes(categoryID) {
//     clearQuizzes();
//     var quizzes = data.categories[categoryID].quizzes;
//     $.each(quizzes, (index, value) => {
//         $('#tblQuizzes tbody').append(`
//             <tr>
//                 <td>${value.name}</td>
//                 <td><button type="button" class="deleteButton btn btn-primary">Apagar</button></td>
//             </tr>`);
//     });
// }
function loadQuizzes() {
    clearQuizzes();
    $.each(db.getCategories(), (index, category) => {
        $.each(category.quizzes, (index, quizz) => {
            $("#tblQuizzes tbody").append(`
                <tr>
                    <td>${quizz.name}</td><td>${category.name}</td>
                    <td><button type="button" class="deleteButton btn btn-primary">Apagar</button></td>
                </tr>`);
        });
    });
}
//general use
function clearQuizzes() {
    $("#tblQuizzes tbody").empty();
}
function addQuizzView(target) {
    loadCategoriesDropdown(); //load first, then show

    $(target).hide();
    $('#newQuizzForm').removeClass('d-none');
}
function toggleQuestionView() {
    $('#addQuestion').toggle();
    $('#newQuestionForm').toggleClass('d-none');
}

/* #endregion */









