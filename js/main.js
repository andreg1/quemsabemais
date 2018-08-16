var data;
var categoriesList;
var quizzesList;

var playersList = [];

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

function selectQuizz(quizzID) {
    selectedQuizz = quizzID;
}
function getSelectedQuizz() {
    return quizzesList[selectedQuizz];
}

function addPlayerDB(playerName, callback){
    playersList.push(playerName);
    console.log(callback);
    callback();
}

function getPlayers(){
    return playersList;
}





/* ----------------------------------------------------- */

$(document).ready(function () {
    Load(loadCategories);
});

$('div.content').on("click", ".quizzCTA", function () {
    var quizzID = $(this).data("id");
    selectQuizz(quizzID);
    loadQuizz();
});

$('div.content').on("click", "#playButton", function () {
    getPlayers();
});
$('div.content').on("click", "#backButton", function () {
    cancelPlay();
}); 

$('#addPlayer').click(()=>{
    addPlayer();
});

function loadCategories() {
    var html = "";
    $.each(getCategories(), function (categoryID, category) {
        var quizzesList = getQuizzesByCategoryID(categoryID);
        if (quizzesList.length) {
            html += `<h3>${category.name}`;
            $.each(quizzesList, function (index, data) {
                html += `<h5 data-id="${data.quizzID}" class="quizzCTA">${data.quizz.name}</h5>`;
            });
            html += "</h3>";
        }
    });
    $('.categoriesSection .sectionContent').html(html);
}


function loadQuizz() {
    $('.categoriesSection').addClass('d-none');
    var quizz = getSelectedQuizz();
    var html = "";
    html += `<h3>${quizz.name}</h3>`;
    html += `<p>texto ${quizz.name}</p>`;

    $('.quizzSection .sectionContent').html(html);
    $('.quizzSection').removeClass('d-none');
}
function cancelPlay() {
    $('.categoriesSection').removeClass('d-none');
    $('.quizzSection').addClass('d-none');
}

function getPlayers() {
    $('.quizzSection').addClass('d-none');
    $('.playSection').removeClass('d-none');
}
function addPlayer() {
    var playerName = $('input[name=playerName]').val();
    addPlayerDB(playerName, loadPlayerList);
}

function loadPlayerList() {
    var html = "";
    $.each(getPlayers(), function (index, player) {
        html += `<label>${player}</label>`;
    });
    $('.playersList').html(html);
}

function Play() {
}







