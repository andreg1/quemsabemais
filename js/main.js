
import * as db from './database.js';



$(document).ready(function () {
    db.Load(loadDashboard);

    $("#tblCategories").on("click", "button.deleteButton", (event) => {
        deleteCategory($(event.target).parents("tr"));
    });
    $("#newCategory").click(() => {
        createCategory();
    });
    $("#newQuizz").click(() => {
        createQuizz();
    });

    $('#saveCategory').click(() => {
        saveCategory();
    });

    $("#tblQuizzes").on("click", "button.deleteButton", (event) => {
        deleteQuizz($(event.target).parents("tr"));
    });

    $("#tblCategories").on("click", "button.editButton", (event) => {
        editCategory($(event.target).parents("tr"));
    });
    $("#tblQuizzes").on("click", "button.editButton", (event) => {
        editQuizz($(event.target).parents("tr"));
    });

    $("#saveQuizzButton").click(() => {
        saveQuizz();
    });

    $('#saveQuestionButton').click(() => {
        saveQuestion();
    });
    $('#addQuestion, #cancelQuestionButton').click(() => {
        toggleQuestionView();
    });
    $('#cancelQuizzButton').click(() => {
        //reset modal state
        $('#addQuestion').show();
        $('#questionForm').addClass('d-none');
        $('#quizzForm input[type=text], #quizzForm textarea').val('');
        $('#questionsList').html('<button type="button" class="list-group-item list-group-item-action">Não existem questões ainda</button>');
        db.resetQuestions();
    });
    //engine.loadCategories();
});


function loadDashboard() {
    loadCategories();
    loadQuizzes();
}



/* #region Category */

// function createCategory(name) {
//     db.createCategory(name);

//     loadCategories();
// }

function loadCategories() {
    $("#tblCategories tbody").empty();

    $.each(db.getCategories(), (index, value) => {
        $('#tblCategories tbody').append(`
            <tr data-ID="${index}">
                <td><label name="categoryName" class="form-control">${value.name}</label></td>
                <td>
                    <button type="button" class="editButton btn btn-primary">Editar</button>
                    <button type="button" class="deleteButton btn btn-primary">Apagar</button>
                </td>
            </tr>
        `);
    });
}

function saveCategory() {
    var mode = $('#categoryModal').attr('data-mode');
    var name = $('input[name=categoryName]').val();
    if(mode == "create"){
        db.createCategory(name);
    }
    else{
        var id = $('#categoryModal').attr('data-id');
        db.updateCategory(id, name);
    }
    loadCategories();
}

function deleteCategory($row) {
    var id = $row.attr("data-ID");

    db.deleteCategory(id);

    loadCategories();
    loadQuizzes();
}

//modal interactions
function createCategory() {
    $('#categoryModalTitle').text("Nova Categoria");
    $('#categoryModal input[name=categoryName]').val('');
    $('#categoryModal').attr('data-mode', 'create');
    $('#categoryModal').modal('toggle');
}
function editCategory($row) {
    var currentValue = $row.find('label[name=categoryName]').text();
    $('#categoryModal input[name=categoryName]').val(currentValue);
    $('#categoryModalTitle').text(`Editar categoria: "${currentValue}"`);
    $('#categoryModal').attr('data-mode', 'edit');
    $('#categoryModal').attr('data-id', $row.attr('data-id'));
    $('#categoryModal').modal('toggle');
}


// function viewMode($row) {
//     $row.html(`
//         <td>${$row.find("input[name=categoryName]").val()}</td>
//         <td><button type="button" class="editButton btn btn-primary">Editar</button></td>
//         <td><button type="button" class="deleteButton btn btn-primary">Apagar</button></td>
//     `);
// }

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
    var mode = $('#quizzModal').attr('data-mode');
    
    var name = $("#quizzForm input[name=quizzName]").val();
    var categoryID = $("#quizzForm select[name=quizzCategory]").val();
    if(mode == "create"){
        db.createQuizz(name, categoryID);
    }
    else{
        var id = $('#categoryModal').attr('data-id');
        db.updateQuizz(id, name);
    }
    loadQuizzes();
}

function saveQuestion() {
    var question = $("#questionForm input[name=question]").val();
    var explanation = $("#questionForm textarea[name=answerExplanation]").val();
    var _question = { question, options: {}, explanation };
    $.each($(".questionTable tbody tr"), (index, $row) => {
        $row = $($row);
        var option = $row.find("input[type=text]").val();
        var checked = $row.find("input[type=radio]").prop("checked");
        var optionID = index + 1;
        if (checked) {
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


function loadQuizzes() {
    $("#tblQuizzes tbody").empty();
    $.each(db.getCategories(), (categoryID, category) => {
        $.each(category.quizzes, (quizzID, quizz) => {
            $("#tblQuizzes tbody").append(`
                <tr data-id=${quizzID} data-catId=${categoryID}>
                    <td>${quizz.name}</td>
                    <td>${category.name}</td>
                    <td>${Object.keys(quizz.questions).length}</td>
                    <td>
                        <button type="button" class="editButton btn btn-primary">Editar</button>
                        <button type="button" class="deleteButton btn btn-primary">Apagar</button>
                    </td>
                </tr>`);
        });
    });
}

//modal interactions
function createQuizz() {
    hardResetQuizzModal();
    $('#quizzModal').attr('data-mode', 'create');
    $('#quizzModal').modal('toggle');
}
function editQuizz($row) {
    softResetQuizzModal();
    var categoryID = $row.attr('data-catId');
    var quizzID = $row.attr('data-id');
    var category = db.getCategoryByID(categoryID,quizzID);
    var quizz = category.quizzes[quizzID];

    $('#quizzModal input[name=quizzName]').val(quizz.name);
    $('#quizzModal select[name=quizzCategory]').val(categoryID);
    $('#quizzModal #quizzModalTitle').text(`Editar quizz: "${quizz.name}"`);
    $('#quizzModal').attr('data-mode', 'edit');
    $('#quizzModal').attr('data-id', $row.attr('data-id'));

    db.loadQuestions(quizz.questions, loadQuestionsList);
    $('#quizzModal').modal('toggle');
}

function hardResetQuizzModal(){
    softResetQuizzModal();
    $('#quizzForm input[type=text], #quizzForm textarea').val('');
    $('#questionsList').html('<button type="button" class="list-group-item list-group-item-action">Não existem questões ainda</button>');
}
function softResetQuizzModal(){
    $('#addQuestion').show();
    $('#questionForm').addClass('d-none');
    loadCategoriesDropdown();
    db.resetQuestions();
}

//general use

function toggleQuestionView() {
    $('#addQuestion').toggle();
    $('#questionForm').toggleClass('d-none');

    //clear fields
    $('#questionForm input[type=text], #questionForm textarea').val('');
    $('#questionForm input[type=radio]').prop('checked', false);
}

/* #endregion */









