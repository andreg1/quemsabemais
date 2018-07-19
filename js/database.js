// import Category from './modules/category.js';
// import Quizz from './modules/quizz.js';
// import Question from './modules/question.js';

var data;
var categoriesList;
var nextCategoryID;
var questions = [];
var nextQuestionID;

function Save() {
    $.ajax({
        url: "ajax/save.php",
        data: data,
    });
}

export function Load(loadCallback) {
    $.getJSON("/database.json", fileData => {
        data = fileData;
        categoriesList = fileData.categories;
        loadCallback();

        var categories = Object.keys(categoriesList);
        nextCategoryID = parseInt(categories[categories.length - 1]) + 1;
    });
}

/* #region Category */

export function createCategory(name) {
    categoriesList[nextCategoryID++] = { name };
    Save();
}
export function getCategories() {
    return categoriesList;
}

export function updateCategory(id, newName) {
    categoriesList[id].name = newName;
    Save();
}

export function deleteCategory(id) {
    delete categoriesList[id];
    Save();
}

export function getNextCategoryID() {
    return nextCategoryID++;
}

export function categoryExists(categoryID) {
    return this.categories[categoryID] === undefined ? false : true;
}

/* #endregion */
/* #region Quizz */

export function saveQuizz(name, categoryID) {
    var quizzes = Object.keys(categoriesList[categoryID].quizzes);
    var nextQuizzID = parseInt(quizzes[quizzes.length - 1]) + 1;
    categoriesList[categoryID].quizzes[nextQuizzID] = { name, questions: {} };
    questions.forEach((value, index) => {
        categoriesList[categoryID].quizzes[nextQuizzID].questions[index] = { value };
    });
    questions = [];
    Save();
}

export function getCategoryByID(categoryID){
    return categoriesList[categoryID];
}

export function saveQuestion(question) {
    questions.push(question);
}
export function loadQuestions(questions,callback) {
    $.each(questions,(value)=>{
        questions.push(value);
    });
    callback();
}
export function getQuestions() {
    return questions;
}
export function resetQuestions() {
    questions = [];
}


/* #endregion */




