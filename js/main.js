var json = {
    data: {
    }
}


class QuizzEngine {
    constructor() {
        this.loadData();
    }

    //update methods
    saveData() {
        $.ajax({
            url: "ajax/save.php",
            data: this.data,
        });
    }
    updateCategory($row) {
        try {
            var id = $row.attr("data-Id");

            this.categories[id].name = $row.find("input[name=categoryName]").val();
            this.saveData();

            this.loadCategories();
        } catch (error) {
            $("#lblCategoryError").text("Ocorreu um erro.");
            console.log(error);
        }


    }
    //create methods
    createCategory(name) {
        try {
            this.categories[this.nextCategoryID++] = { name };
            this.saveData();
            this.loadCategories();
        } catch (error) {
            $("#lblCategoryError").text("Ocorreu um erro.");
            console.log(error);
        }
    }
    createQuizz(){
        var name = $("#newQuizzForm input[name=quizzName]").val();

    }
    //delete methods
    deleteCategory($row) {
        var id = $row.attr("data-Id");
        try {
            delete this.categories[id];
            this.saveData();

            //update view
            $row.remove();
            this.loadQuizzes();
        } catch (error) {
            $("#lblCategoryError").text("Ocorreu um erro.");
            console.log(error);
        }
    }
    //read methods
    loadData() {
        var self = this;
        $.getJSON("database.json", data => {
            self.data = data;
            self.categories = data.categories;
            self.loadDashboard();
        });
    }
    loadDashboard() {
        this.loadCategories();
        this.loadQuizzes();
    }
    loadCategories() {
        this.clearCategories();

        $.each(this.categories, (index, value) => {
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
    loadCategoriesDropdown(){
        $("select[name=quizzCategory] option").remove();

        //add placeholder
        $("select[name=quizzCategory]").append(`<option value="-1">Escolha uma Categoria</option>`);

        $.each(this.categories, (index, category) => {
            $("select[name=quizzCategory]").append(`<option value="${index}">${category.name}</option>`);
        });
    }
    // loadQuizzes(categoryID) {
    //     this.clearQuizzes();
    //     var quizzes = this.data.categories[categoryID].quizzes;
    //     $.each(quizzes, (index, value) => {
    //         $('#tblQuizzes tbody').append(`
    //             <tr>
    //                 <td>${value.name}</td>
    //                 <td><button class="deleteButton">Apagar</button></td>
    //             </tr>`);
    //     });
    // }
    loadQuizzes() {
        this.clearQuizzes();
        $.each(this.categories, (index, category) => {
            $.each(category.quizzes, (index, quizz) => {
                $("#tblQuizzes tbody").append(`
                    <tr>
                        <td>${quizz.name}</td><td>${category.name}</td>
                        <td><button class="deleteButton">Apagar</button></td>
                    </tr>`);
            });
        });
    }
    //checks
    categoryExists(categoryID){
        return this.categories[categoryID] === undefined ? false : true;
    }
    //general use
    clearCategories() {
        $("#tblCategories tbody").empty();
    }
    clearQuizzes() {
        $("#tblQuizzes tbody").empty();
    }
    viewMode($row) {
        $row.html(`
            <td>${$row.find("input[name=categoryName]").val()}</td>
            <td><button class="editButton">Editar</button></td>
            <td><button class="deleteButton">Apagar</button></td>
        `);
    }
    editMode($row) {
        $row.html(`
            <td><input type="text" name="categoryName" class="form-control" value="${$row.find("#lblCategoryName").text()}"/></td>
            <td><button class="saveButton">Gravar</button></td>
        `);
    }
    addQuizzView(target){
        this.loadCategoriesDropdown(); //load first, then show

        $(target).hide();
        $('#newQuizzForm').removeClass('d-none');
    }
    addQuestionView(target){

        $('#questionList').hide();
        $('#newQuestionForm').removeClass('d-none');
    }
}
var engine;
$(document).ready(function () {
    engine = new QuizzEngine();
    $("#tblCategories").on("click", "button.deleteButton", (event) => {
        engine.deleteCategory($(event.target).parents("tr"));
    });
    $("#tblCategories").on("click", "button.saveButton", (event) => {
        engine.updateCategory($(event.target).parents("tr"));
    });
    $("#btNewCategory").click(() => {
        var categoryName = $('input[name=tbCategory]').val();
        engine.createCategory(categoryName);
        $('input[name=tbCategory]').val(""); // clear val
    });


    $("#tblQuizzes").on("click", "button.deleteButton", (event) => {
        engine.deleteQuizz($(event.target).parents("tr"));
    });
    $("#tblCategories, #tblQuizzes").on("click", "button.editButton", (event) => {
        engine.editMode($(event.target).parents("tr"));
    });
    $("#btNewQuizz").click((event) => {
        engine.addQuizzView(event.target);
    });
    $("#newQuizzForm button[type=submit]").click(() => {
        engine.createQuizz();
    });

    $('#addQuestion').click((event)=>{
        engine.addQuestionView(event.target);
    });
    //engine.loadCategories();
});