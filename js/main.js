var json = {
    data: {
    }
}


class QuizzEngine {
    constructor() {
        this.loadData();
    }
    //update methods
    saveData(){
        $.ajax({
            url: "ajax/save.php",
            data: this.data,
        });
    }
    updateCategory(target){
        var $row = target.parents("tr");
        try {
            var id = $("#tblCategorias tbody tr.edit-row").index($row) + 1;

            this.categories[id].name = $row.;
            this.saveData();

            this.loadCategories();
            $row.toggle();
            $row.prev(".view-row").toggle();
        } catch (error) {
            $("#lblCategoryError").text("Ocorreu um erro.");
            console.log(error);
        }
        

    }
    //create methods
    addCategory(name) {
        try {
            this.categories[this.nextCategoryID++] = { name };
            this.saveData();
        } catch (error) {
            $("#lblCategoryError").text("Ocorreu um erro.");
            console.log(error);
        }
    }
    //delete methods
    deleteCategory(target) {
        var $row = target.parents("tr");
        var id = $("#tblCategorias tbody tr").index($row) + 1;
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
            $('#tblCategorias tbody').append(`
                <tr class="view-row">
                    <td>${value.name}</td>
                    <td><button class="editButton">Editar</button></td>
                    <td><button class="deleteButton">Apagar</button></td>
                </tr>
                <tr class="edit-row">
                    <td><input type="text" value="${value.name}"/></td>
                    <td><button class="saveButton">Gravar</button></td>
                </tr>`);
        });

        var categories = Object.keys(this.categories);
        this.nextCategoryID = parseInt(categories[categories.length - 1]) + 1;
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
    //general use
    clearCategories(){
        $("#tblCategories tbody").empty();
    }
    clearQuizzes() {
        $("#tblQuizzes tbody").empty();
    }
    editMode(target){
        var $row = target.parents("tr");
        $row.toggle();
        $row.next(".edit-row").toggle();
    }
}
var engine;
$(document).ready(function () {
    engine = new QuizzEngine();
    $("#tblCategorias").on("click", "button.deleteButton", (event) => {
        engine.deleteCategory($(event.target));
    });
    $("#tblCategorias").on("click", "button.saveButton", (event) => {
        engine.updateCategory($(event.target));
    });

    
    $("#tblQuizzes").on("click", "button.deleteButton", (event) => {
        engine.deleteQuizz($(event.target));
    });


    $("#tblCategorias, #tblQuizzes").on("click", "button.editButton", (event) => {
        engine.editMode($(event.target));
    });
    //engine.loadCategories();
});