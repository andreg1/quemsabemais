// import Category from './modules/category.js';
// import Quizz from './modules/quizz.js';
// import Question from './modules/question.js';

var data;
var categoriesList;
var nextCategoryID;

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


export function createCategory(name){
    categoriesList[nextCategoryID] = {name};
    Save();
}
export function getCategories(){
    return categoriesList;
}

export function updateCategory(id, newName) {
    categoriesList[id].name = newName;
    Save();
}

export function deleteCategory(id){
    delete categoriesList[id];
    Save();
}

export function getNextCategoryID(){
    return nextCategoryID++;
}

export function categoryExists(categoryID){
    return this.categories[categoryID] === undefined ? false : true;
}
