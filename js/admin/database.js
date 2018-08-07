var data;
var categoriesList;
var quizzesList;

var questionsList = [];

var editedCategory;
var editedQuizz;
var editedQuestion;

export function checkLogin(username, password) {
    return username == data.username && password == data.password;
}

export function cancelCategoryEdit() {
    editedCategory = undefined;
}
export function cancelQuizzEdit() {
    editedQuizz = undefined;
    editedQuestion = undefined;
    questionsList = [];
}
export function cancelQuestionEdit() {
    editedQuestion = undefined;
}

function Save() {
    $.ajax({
        url: "../ajax/save.php",
        data: { data },
        method: "POST"
    });
    console.log(data);
}

export function Load(loadCallback) {
    $.getJSON("../database.json", fileData => {
        data = fileData;
        categoriesList = data.categories;
        quizzesList = data.quizzes;

        loadCallback();
    });
}

/* #region Category */

export function getCategories() {
    return categoriesList;
}
export function saveCategory(name) {
    var categoryID = editedCategory !== undefined ? editedCategory : getNextCategoryID();
    categoriesList[categoryID] = { name };
    Save();

    editedCategory = undefined;
}
export function editCategory(categoryID) {
    editedCategory = categoryID;
    return categoriesList[categoryID];
}
export function deleteCategory(id) {
    delete categoriesList[id];
    //Save();
}

/* #endregion */
/* #region Quizz */

export function getQuizzes() {
    return quizzesList;
}

export function saveQuizz(categoryID, name) {
    var quizzID = editedQuizz !== undefined ? editedQuizz : getNextQuizzID();

    quizzesList[quizzID] = { name, categoryID, questions: {} };
    questionsList.forEach((question, index) => {
        quizzesList[quizzID].questions[index + 1] = question;
    });
    questionsList = [];
    editedQuizz = undefined;
    Save();
}

export function editQuizz(quizzID) {
    editedQuizz = quizzID;
    return quizzesList[quizzID];
}

export function deleteQuizz(quizzID) {
    delete quizzesList[quizzID];
    //Save();
}

export function getCategoryByID(categoryID) {
    return categoriesList[categoryID];
}

export function saveQuestion(question, imageName, image, hideQuestionView) {
    if (image !== undefined && imageName !== undefined) {
        var formData = new FormData();
        //formData.append("imageName", imageName);
        formData.append("image", image);

        $.ajax({
            url: "../ajax/saveImage.php",
            data: formData,
            method: "POST",
            processData: false,
            contentType: false
        }).done((imagePath) => {
            //imagePath = JSON.parse(imagePath);
            //console.log(imagePath)
            question.correctAnswerImage = { imageName, imagePath }
        }).always(() => {
            if (editedQuestion !== undefined) {
                questionsList[editedQuestion] = question;
            }
            else {
                questionsList.push(question);
            }
            editedQuestion = undefined;
            hideQuestionView();
        });
    }
}

// export function saveImage(event){
//     var result = event.target.result;
//     var fileName = document.getElementById('fileBox').files[0].name;
// }
export function loadQuestions(questions, callback) {
    $.each(questions, (index, value) => {
        questionsList.push(value);
    });
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

function getNextCategoryID() {
    var categories = Object.keys(categoriesList);
    if (!categories.length) {
        return 1;
    }
    return parseInt(categories[categories.length - 1]) + 1;
}

/* #endregion */