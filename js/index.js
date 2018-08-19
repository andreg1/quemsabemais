var data;
var categoriesList;
var quizzesList;

var playersList = new Set();

function Load(callback) {
    $.getJSON("../database.json", fileData => {
        data = fileData;
        categoriesList = data.categories;
        quizzesList = data.quizzes;

        callback();
    });
}

function getCategories() {
    return categoriesList;
}

function getQuizzesByCategoryID(categoryID) {
    quizzList = [];
    $.each(quizzesList, function (quizzID, quizz) {
        if (quizz.categoryID == categoryID) {
            quizzList.push({ quizzID, quizz });
        }
    });
    return quizzList;
}






/* ----------------------------------------------------- */

$(document).ready(function () {
    Load(loadCategories);
});

function loadCategories() {
    var html = "";
    $.each(getCategories(), function (categoryID, category) {
        var quizzesList = getQuizzesByCategoryID(categoryID);
        if (quizzesList.length) {
            html += `<h3>${category.name}`;
            $.each(quizzesList, function (index, data) {
                html += `<a href="play.html?id=${data.quizzID}"><h5 class="quizzCTA">${data.quizz.name}</h5></a>`;
            });
            html += "</h3>";
        }
    });
    $('.categoriesSection .sectionContent').html(html);
}









// $('div.content').on("click", "#playButton", function () {
//     getPlayers();
// });
// $('div.content').on("click", "#backButton", function () {
//     cancelPlay();
// }); 



// function loadQuizz() {
//     $('.categoriesSection').addClass('d-none');
//     var quizz = getSelectedQuizz();
//     var html = "";
//     html += `<h3>${quizz.name}</h3>`;
//     html += `<p>texto ${quizz.name}</p>`;

//     $('.quizzSection .sectionContent').html(html);
//     $('.quizzSection').removeClass('d-none');
// }
// function cancelPlay() {
//     $('.categoriesSection').removeClass('d-none');
//     $('.quizzSection').addClass('d-none');
// }



// function Play() {
// }







