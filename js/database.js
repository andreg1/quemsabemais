// import Category from './modules/category.js';
// import Quizz from './modules/quizz.js';
// import Question from './modules/question.js';

var data;
var categoriesList;
var quizzesList;

var nextCategoryID;
var questionsList = [];
var editedQuestion;
var editedQuizz;

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
        categoriesList = data.categories;
        quizzesList = data.quizzes;

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
export function getQuizzes() {
    return quizzesList;
}

export function updateCategory(id, newName) {
    categoriesList[id].name = newName;
    Save();
}

export function deleteCategory(id) {
    delete categoriesList[id];
    Save();
}

export function categoryExists(categoryID) {
    return this.categories[categoryID] === undefined ? false : true;
}

/* #endregion */
/* #region Quizz */

export function saveQuizz(categoryID, name) {
    var quizzID = editedQuizz !== undefined ? editedQuizz : getNextQuizzID();

    quizzesList[quizzID] = { name, categoryID, questions: {} };
    // questionsList.forEach((question, index) => {
    //     categoriesList[categoryID].quizzes[quizzID].questions[index + 1] = question;
    // });
    questionsList = [];
    editedQuizz = undefined;
    Save();
}

export function editQuizz(quizzID){
    editedQuizz = quizzID;
    return quizzesList[quizzID];
}

export function deleteQuizz(quizzID) {
    delete quizzesList[quizzID];
}

export function getCategoryByID(categoryID) {
    return categoriesList[categoryID];
}

export function saveQuestion(question) {
    if (editedQuestion !== undefined) {
        questionsList[editedQuestion] = question;
    }
    else {
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
export function editQuestion(index) {
    editedQuestion = index;
    return questionsList[index];
}
export function removeQuestion(index) {
    questionsList.splice(index, 1);
}
export function getQuestions() {
    return questionsList;
}
export function resetQuestions() {
    questionsList = [];
}

function getNextQuizzID() {
    let quizzes = Object.keys(quizzesList);

    if (!quizzes.length) {
        return 1;
    }

    return parseInt(quizzes[quizzes.length - 1]) + 1;
}

/* #endregion */