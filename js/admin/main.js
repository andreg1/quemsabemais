import * as db from "./database.js";

$(document).ready(function() {
	db.Load(loadDashboard);

	$("#loginForm").submit(event => {
		event.preventDefault();
		Login();
	});

	$("#newCategory").click(() => {
		createCategory();
	});
	$("#saveCategory").click(() => {
		saveCategory();
	});
	$("#cancelCategory").click(() => {
		db.cancelCategoryEdit();
	});
	$("#tblCategories").on("click", "button.editButton", event => {
		editCategory($(event.target).parents("tr"));
	});
	$("#tblCategories").on("click", "button.deleteButton", event => {
		if (confirm("Tem a certeza que pretende remover esta Categoria?")) {
			deleteCategory($(event.target).parents("tr"));
		}
	});

	$("#newQuizz").click(() => {
		createQuizz();
	});
	$("#saveQuizzButton").click(() => {
		saveQuizz();
	});
	$("#cancelQuizzButton").click(() => {
		db.cancelQuizzEdit();
	});
	$("#tblQuizzes").on("click", "button.editButton", event => {
		editQuizz($(event.target).parents("tr"));
	});
	$("#tblQuizzes").on("click", "button.deleteButton", event => {
		if (confirm("Tem a certeza que pretende remover este Quizz?")) {
			deleteQuizz($(event.target).parents("tr"));
		}
	});

	$("#addQuestion").click(() => {
		clearQuestionView();
		showQuestionView();
	});
	$("#saveQuestionButton").click(() => {
		saveQuestion();
	});
	$("#cancelQuestionButton").click(() => {
		hideQuestionView();
		$("#questionsList .list-group-item-action.active").removeClass("active");
	});
	$("#removeQuestionButton").click(() => {
		removeQuestion();
		hideQuestionView();
	});
	$("#questionForm input[type=file]").change(function() {
		previewImage(this);
	});

	$("#questionsList").on("click", "button.list-group-item-action", function() {
		$("#questionsList .list-group-item-action.active").removeClass("active");
		$(this).addClass("active");
		var index = $("#questionsList .list-group-item-action").index($(this));
		editQuestion(index);
	});
	$("#categoryModal").on("hidden.bs.modal", function() {
		db.cancelCategoryEdit();
	});
	$("#quizzModal").on("hidden.bs.modal", function() {
		db.cancelQuizzEdit();
	});

	// $("#updateBannerPub").click(() => {
	// 	saveBannerPub();
	// });

	$("#downloadMobileVersion").click(() => {
		downloadMobileVersion();
	});
});

function Login() {
	var username = $("#loginSection input[name=username]").val();
	var password = $("#loginSection input[name=password]").val();
	if (db.checkLogin(username, password.hashCode())) {
		$("#loginSection").hide();
		$("#backOffice").show();
	}
}

function loadDashboard() {
	loadCategories();
	loadQuizzes();
	// loadBannerPub();
}

/* #region Category */

function loadCategories() {
	$("#tblCategories tbody").empty();
	$.each(db.getCategories(), (index, value) => {
		$("#tblCategories tbody").append(`
            <tr data-id="${index}">
                <td><label name="categoryName" class="form-control">${value.name}</label></td>
                <td>
                    <button type="button" class="editButton btn btn-primary">Editar</button>
                    <!-- <button type="button" class="deleteButton btn btn-primary" disabled>Apagar</button> -->
                </td>
            </tr>
        `);
	});
}
function createCategory() {
	$("#categoryModalTitle").text("Nova Categoria");
	$("#categoryModal input[name=categoryName]").val("");
	$("#categoryModal").modal("toggle");
}
function editCategory($row) {
	var categoryID = $row.data("id");
	var category = db.editCategory(categoryID);
	$("#categoryModal input[name=categoryName]").val(category.name);
	$("#categoryModalTitle").text(`Editar Categoria: "${category.name}"`);
	$("#categoryModal").modal("toggle");
}
function deleteCategory($row) {
	var id = $row.data("id");
	db.deleteCategory(id);
	loadCategories();
	loadQuizzes();
}
function saveCategory() {
	var name = $("#categoryModal input[name=categoryName]").val();
	db.saveCategory(name);
	loadCategories();
}

/* #endregion */
/* #region Quizz */

function loadQuizzes() {
	$("#tblQuizzes tbody").empty();
	$.each(db.getQuizzes(), (quizzID, quizz) => {
		var questionCount = quizz.questions === undefined ? 0 : Object.keys(quizz.questions).length;
		var categoryName =
			quizz.categoryID !== undefined ? db.getCategoryByID(quizz.categoryID).name : "Sem categoria";

		$("#tblQuizzes tbody").append(`
            <tr data-id=${quizzID}>
                <td>${quizz.name}(${quizz.hidden == "true" ? "escondido" : "visivel"})</td>
                <td>${categoryName}</td>
                <td>${questionCount}</td>
                <td>
                    <button type="button" class="editButton btn btn-primary">Editar</button>
                    <button type="button" class="deleteButton btn btn-primary">Apagar</button>
                </td>
            </tr>`);
	});
}

function createQuizz() {
	hardResetQuizzModal();
	$("#quizzModal #quizzModalTitle").text("Novo Quizz");
	$("#quizzModal").modal("toggle");
}
function editQuizz($row) {
	softResetQuizzModal();
	var quizzID = $row.data("id");
	var quizz = db.editQuizz(quizzID);
	$("#quizzModal input[name=quizzName]").val(quizz.name);
	$("#quizzModal select[name=quizzCategory]").val(quizz.categoryID);
	$("#quizzModal #quizzModalTitle").text(`Editar Quizz: "${quizz.name}"`);
	$("#quizzModal input[name=quizzHidden]").prop("checked", quizz.hidden == "true");
	db.loadQuestions(quizz.questions, loadQuestionsList);
	$("#quizzModal").modal("toggle");
}
function deleteQuizz($row) {
	var quizzID = $row.data("id");
	db.deleteQuizz(quizzID);
	loadQuizzes();
}
function saveQuizz() {
	var name = $("#quizzForm input[name=quizzName]").val();
	var categoryID = $("#quizzForm select[name=quizzCategory]").val();
	var hidden = $("#quizzForm input[name=quizzHidden]").prop("checked");

	db.saveQuizz(categoryID, name, hidden.toString());
	loadQuizzes();
}
async function saveQuestion() {
	let question = $("#questionForm input[name=question]").val();
	let explanation = $("#questionForm textarea[name=answerExplanation]").val();
	let _question = { question, options: {}, explanation, bannerPub: {} };
	$.each($(".questionTable tbody tr"), (index, $row) => {
		$row = $($row);
		let option = $row.find("input[type=text]").val();
		let checked = $row.find("input[type=radio]").prop("checked");
		let optionID = index + 1;
		if (checked) {
			_question.correctAnswer = optionID;
		}
		_question.options[optionID] = option;
	});

	let questionImage = await saveQuestionImage();
	let answerImage = await saveAnswerImage();
	let bannerPub = await saveBannerPub();

	db.saveQuestion(
		_question,
		questionImage,
		answerImage,
		bannerPub,
		hideQuestionView,
		loadQuestionsList
	);
}
function saveQuestionImage() {
	let questionImage = $("#quizzForm input[name=questionImage]")[0].files[0];
	if (questionImage === undefined) {
		return null;
	} else {
		let questionImageReader = new FileReader();
		return new Promise(resolve => {
			questionImageReader.readAsDataURL(questionImage);
			questionImageReader.onload = () => {
				resolve({ name: questionImage.name, image: questionImage });
			};
		});
	}
}
function saveAnswerImage() {
	let answerImage = $("#quizzForm input[name=answerImage]")[0].files[0];
	if (answerImage === undefined) {
		return null;
	} else {
		let answerImageReader = new FileReader();
		return new Promise(resolve => {
			answerImageReader.readAsDataURL(answerImage);
			answerImageReader.onload = () => {
				resolve({ name: answerImage.name, image: answerImage });
			};
		});
	}
}
function saveBannerPub() {
	let bannerPub = $("#quizzForm input[name=bannerPubFile]")[0].files[0];
	var url = $("input[name=bannerPubURL]").val();
	if (bannerPub === undefined) {
		return { url, image: null };
	} else {
		let bannerPubReader = new FileReader();
		return new Promise(resolve => {
			bannerPubReader.readAsDataURL(bannerPub);
			bannerPubReader.onload = () => {
				resolve({ url, image: bannerPub });
				//db.saveBannerPub(file, url);
			};
		});
	}
}

function previewImage(input) {
	if (input.files && input.files[0]) {
		var reader = new FileReader();

		reader.onload = function(e) {
			$("#" + $(input).attr("name") + "Preview").attr("src", e.target.result);
		};

		reader.readAsDataURL(input.files[0]);
	}
}

function editQuestion(index) {
	var data = db.editQuestion(index);
	$("#questionForm input[name=question]").val(data.question);
	$("#questionForm textarea").val(data.explanation);
	$("#questionForm input:file").val("");
	$("#questionImagePreview").attr("src", data.image !== undefined ? data.image.imagePath : "");
	$("#answerImagePreview").attr(
		"src",
		data.correctAnswerImage !== undefined ? data.correctAnswerImage.imagePath : ""
	);
	//console.log(data);
	$("#bannerPub").attr("src", data.bannerPub !== undefined ? data.bannerPub.imagePath : "");
	$("input[name=bannerPubURL]").val(data.bannerPub !== undefined ? data.bannerPub.url : "");
	for (var index in data.options) {
		$(`#questionForm input[name=option${index}]`).val(data.options[index]);
	}
	$(`#questionForm input[type=radio][value=${data.correctAnswer}]`).prop("checked", "true");
	showQuestionView();
	$("#removeQuestionButton").removeClass("d-none");
}
function removeQuestion() {
	var index = $("#questionsList .list-group-item-action").index(
		$("#questionsList .list-group-item-action.active")
	);
	db.removeQuestion(index);
	hideQuestionView();
	loadQuestionsList();
}
function loadCategoriesDropdown() {
	$("select[name=quizzCategory] option").remove();
	$("select[name=quizzCategory]").append(`<option value="-1">Escolha uma Categoria</option>`);
	$.each(db.getCategories(), (index, category) => {
		$("select[name=quizzCategory]").append(`<option value="${index}">${category.name}</option>`);
	});
}
function loadQuestionsList() {
	$("#questionsList button").remove();
	var questions = db.getQuestions();
	if (questions.length) {
		db.getQuestions().forEach(value => {
			$("#questionsList").append(
				`<button type="button" class="list-group-item list-group-item-action ${
					value.image === undefined && value.correctAnswerImage === undefined
						? "list-group-item-danger"
						: ""
				}">${value.question}</button>`
			);
		});
	} else {
		$("#questionsList").html(
			'<button type="button" class="list-group-item list-group-item-action">Não existem questões ainda</button>'
		);
	}
}

//modal interactions
function hardResetQuizzModal() {
	softResetQuizzModal();
	$("#questionsList").html(
		'<button type="button" class="list-group-item list-group-item-action">Não existem questões ainda</button>'
	);
	$("#quizzForm input[name=quizzName]").val("");
	$("#quizzForm input[name=quizzHidden]").prop("checked", false);
	clearQuestionView();
}
function softResetQuizzModal() {
	$("#addQuestion").show();
	$("#questionForm").addClass("d-none");
	loadCategoriesDropdown();
	db.resetQuestions();
}

//general use
function clearQuestionView() {
	$("#questionForm input:text, #quizzForm input:file, #quizzForm textarea").val("");
	$("#questionForm input:radio").prop("checked", false);
	$("#questionForm img").attr("src", "");
}
function showQuestionView() {
	//clear fields
	$("#addQuestion").hide();
	$("#questionForm").removeClass("d-none");
}
function hideQuestionView() {
	$("#addQuestion").show();
	$("#questionForm").addClass("d-none");
	$("#removeQuestionButton").addClass("d-none");
	db.cancelQuestionEdit();
}

// function loadBannerPub() {
// 	let bannerPub = db.getBannerPub();
// 	$("#bannerPub").attr("src", bannerPub.path);
// 	$("input[name=bannerPubURL]").val(bannerPub.url);
// }

$("#deleteUnusedImages").click(() => {
	db.deleteUnusedImages();
});

/* #endregion */

String.prototype.hashCode = function() {
	var hash = 0,
		i,
		chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr = this.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
