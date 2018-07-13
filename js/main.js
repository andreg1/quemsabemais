// var json = {
//     data:{
//         categories:{
//             1:{
//                 name: "Teste Category 1",
//                 quizzes:{
//                     1:{

//                     }
//                 }
//             },
//             2:{
//                 name: "Teste Category 2",
//                 quizzes:{
//                     1:{

//                     }
//                 }
//             },
//             3:{
//                 name: "Teste Category 3",
//                 quizzes:{
//                     1:{

//                     }
//                 }
//             },
//         }
//     }
// }

// $.ajax({
//     url: "ajax/save.php",
//     data: json,
// });

class QuizzEngine{
    constructor(){
        this.loadData();
    }
    loadData(){
        var self = this;
        $.getJSON("database.json", data => {
            self.data = data;
            self.loadDashboard();
        });
    }
    loadDashboard(){
        this.loadCategories();
    }
    loadCategories(){
        var self = this;
        console.log(this.data)
        $.each(self.data.categories, (index, value) =>{
            $('#tblCategorias').append(`<tr><td>${value.name}</td></tr>`)
        });
    }
}
var engine;
$(document).ready(function(){
    engine = new QuizzEngine();
    //engine.loadCategories();
});