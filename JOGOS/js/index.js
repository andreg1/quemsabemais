var liveVersion = window.location.host === "quemsabemais.pt";
var categoriesList;
var quizzesList;

var playersList = new Set();

function loadLive(loadCategories,loadBannerPub){
    $.getJSON("database.json", fileData => {
        data = fileData;
        categoriesList = data.categories;
        quizzesList = data.quizzes;

        loadCategories();
        loadBannerPub();
    });
}
function loadMobile(loadCategories, loadBannerPub) {
    categoriesList = data.categories;
    quizzesList = data.quizzes;

    loadCategories();
    loadBannerPub();
}

function getCategories() {
    return categoriesList;
}

function getQuizzesByCategoryID(categoryID) {
    quizzList = [];
    $.each(quizzesList, function (quizzID, quizz) {
        if (quizz.categoryID == categoryID) {
            if(quizz.hidden == 'false'){
                quizzList.push({ quizzID, quizz });
            }
            else if(!liveVersion){
                quizzList.push({ quizzID, quizz });
            }
        }
    });
    return quizzList;
}

function getBannerPub(){
    return data.bannerPub;
}





/* ----------------------------------------------------- */

$(document).ready(function () {
    if(liveVersion){
        loadLive(loadCategories, loadBannerPub);  
    }
    else{
        loadMobile(loadCategories, loadBannerPub);  
    }  
});

function loadCategories() {
    var html = "";
    $.each(getCategories(), function (categoryID, category) {
        var quizzesList = getQuizzesByCategoryID(categoryID);
        if (quizzesList.length) {
            //console.log("hey");
            
            html += `<h3>${category.name}`;
            $.each(quizzesList, function (index, data) {
                html += `<a href="play.html?id=${data.quizzID}"><h5 class="quizzCTA">${data.quizz.name}</h5></a>`;
            });
            html += "</h3>";
        }
    });
    $('.categoriesSection .sectionContent').html(html);
}

function loadBannerPub(){
    let bannerPub = getBannerPub();
    $('.bannerPubContainer a').attr('href', bannerPub.url);
    $('.bannerPubContainer img').attr('src', bannerPub.path);
}