export default class Category{
    constructor()

}


//create methods
export function createCategory(name) {
    try {
        categories[nextCategoryID++] = { name };
        saveData();
        loadCategories();
    } catch (error) {
        $("#lblCategoryError").text("Ocorreu um erro.");
        console.log(error);
    }
}


export function loadCategoriesDropdown(){
    $("select[name=quizzCategory] option").remove();

    //add placeholder
    $("select[name=quizzCategory]").append(`<option value="-1">Escolha uma Categoria</option>`);

    $.each(this.categories, (index, category) => {
        $("select[name=quizzCategory]").append(`<option value="${index}">${category.name}</option>`);
    });
}

//delete methods
export function deleteCategory($row) {
    var id = $row.attr("data-Id");
    try {
        delete categories[id];
        saveData();

        //update view
        $row.remove();
        loadQuizzes();
    } catch (error) {
        $("#lblCategoryError").text("Ocorreu um erro.");
        console.log(error);
    }
}

//checks
export function categoryExists(categoryID){
    return this.categories[categoryID] === undefined ? false : true;
}



export function viewMode($row) {
    $row.html(`
        <td>${$row.find("input[name=categoryName]").val()}</td>
        <td><button class="editButton">Editar</button></td>
        <td><button class="deleteButton">Apagar</button></td>
    `);
}
export function editMode($row) {
    $row.html(`
        <td><input type="text" name="categoryName" class="form-control" value="${$row.find("#lblCategoryName").text()}"/></td>
        <td><button class="saveButton">Gravar</button></td>
    `);
}







export function Load() {
    clearCategories();

    $.each(data.categories, (index, value) => {
        $('#tblCategories tbody').append(`
            <tr data-Id="${index}">
                <td><label id="lblCategoryName">${value.name}</label></td>
                <td><button class="editButton">Editar</button></td>
                <td><button class="deleteButton">Apagar</button></td>
            </tr>
        `);
    });

    var categories = Object.keys(this.categories);
    this.nextCategoryID = parseInt(categories[categories.length - 1]) + 1;
}

export function clearCategories() {
    $("#tblCategories tbody").empty();
}