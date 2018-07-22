// import Category from './modules/category.js';
// import Quizz from './modules/quizz.js';
// import Question from './modules/question.js';

var data;
var categoriesList;
var nextCategoryID;
var questionsList = [];
var editedQuestion;

function Save() {
    //console.log(data);
    $.ajax({
        url: "../ajax/save.php",
        data: { data },
        method: "POST"
    });
}

export function Load(loadCallback) {
    $.getJSON("../database.json", fileData => {
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

function saveQuizz(quizzID, categoryID, name) {
    if (!quizzID) quizzID = getNextQuizzID(categoryID);

    categoriesList[categoryID].quizzes[quizzID] = { name, questions: {} };
    questionsList.forEach((question, index) => {
        categoriesList[categoryID].quizzes[quizzID].questions[index + 1] = question;
    });
    questionsList = [];
    //Save();
}

export function createQuizz(categoryID, name) {
    saveQuizz(0, categoryID, name);
}

export function updateQuizz(quizzID, newCategoryID, newName) {
    var oldCategoryID = $('#quizzModal').attr('data-catId');
    if (oldCategoryID == newCategoryID){
        saveQuizz(quizzID, oldCategoryID, newName);
    }
    else{
        delete categoriesList[oldCategoryID].quizzes[quizzID];
        saveQuizz(0, newCategoryID, newName);
    }
}

export function deleteQuizz(quizzID, categoryID){
    delete categoriesList[categoryID].quizzes[quizzID];
}

export function getCategoryByID(categoryID) {
    return categoriesList[categoryID];
}

export function saveQuestion(question) {
    if(editedQuestion !== undefined){
        questionsList[editedQuestion] = question;
    }
    else{
        questionsList.push(question);
    }
}
export function loadQuestions(questions, callback) {
    $.each(questions, (index, value) => {
        questionsList.push(value);
    });
    //console.log(questionsList);
    callback();
}
export function editQuestion(index){
    editedQuestion = index;
    return questionsList[index];
}
export function removeQuestion(index){
    questionsList.splice(index,1);
}
export function getQuestions() {
    return questionsList;
}
export function resetQuestions() {
    questionsList = [];
}

function getNextQuizzID(categoryID) {
    if (categoriesList[categoryID].quizzes === undefined) {
        categoriesList[categoryID].quizzes = {};
        return 1;
    }
    else {
        let quizzes = Object.keys(categoriesList[categoryID].quizzes);

        if(!quizzes.length){
            return 1;
        }

        return parseInt(quizzes[quizzes.length - 1]) + 1;
    }
}

/* #endregion */