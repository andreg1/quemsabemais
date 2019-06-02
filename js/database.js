var data;
var categoriesList;
var quizzesList;

export function Load(loadCallback) {
    $.getJSON("/database.json", fileData => {
        data = fileData;
        categoriesList = data.categories;
        quizzesList = data.quizzes;

        loadCallback();
    });
}

export function getCategories(){
    
}

export function getQuizzes(){

}