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
	console.log(data);
	$.ajax({
		url: "ajax/save.php",
		data: { data },
		method: "POST"
	});
}

export function Load(loadCallback) {
	$.getJSON("database.json", fileData => {
		data = fileData;
		if (data.categories === undefined) data.categories = {};
		categoriesList = data.categories;
		if (data.quizzes === undefined) data.quizzes = {};
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

export async function saveQuizz(categoryID, name, hidden, bannerPub) {
	var quizzID = editedQuizz !== undefined ? editedQuizz : getNextQuizzID();

	quizzesList[quizzID] = { name, categoryID, hidden, questions: {} };

	questionsList.forEach((question, index) => {
		quizzesList[quizzID].questions[index + 1] = question;
	});

	quizzesList[quizzID].bannerPub = await saveBannerPub(bannerPub);
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
	Save();
}

export function getCategoryByID(categoryID) {
	return categoriesList[categoryID];
}

function saveImage(file) {
	if (file === null) return null;
	var formData = new FormData();
	formData.append("file", file.image);
	return new Promise(resolve => {
		$.ajax({
			url: "ajax/saveImage.php",
			data: formData,
			method: "POST",
			processData: false,
			contentType: false,
			dataType: "json"
		}).done(response => {
			resolve({ imageName: file.name, imagePath: response.path });
		});
	});
}
export async function saveQuestion(question, questionImage, answerImage, bannerPub, hideQuestionView, updateQuestions) {
	questionImage = await saveImage(questionImage);
	answerImage = await saveImage(answerImage);
	bannerPub = await saveBannerPub(bannerPub);

	if (editedQuestion !== undefined) {
		question.image = questionImage ? questionImage : questionsList[editedQuestion].image;
		question.correctAnswerImage = answerImage ? answerImage : questionsList[editedQuestion].correctAnswerImage;
		questionsList[editedQuestion] = question;
		question.bannerPub = {};
		question.bannerPub.imagePath = bannerPub.imagePath ? bannerPub.imagePath : questionsList[editedQuestion].bannerPub.imagePath;
		question.bannerPub.url = bannerPub.url ? bannerPub.url : questionsList[editedQuestion].bannerPub.url;
	} else {
		questionsList.push(question);
	}
	editedQuestion = undefined;
	hideQuestionView();
	updateQuestions();
}

function saveBannerPub(file) {
	if (file.image === null) {
		return { url: file.url };
	}
	var formData = new FormData();
	formData.append("file", file.image);
	return new Promise(resolve => {
		$.ajax({
			url: "ajax/saveImage.php",
			data: formData,
			method: "POST",
			processData: false,
			contentType: false,
			dataType: "json"
		}).done(response => {
			resolve({ url: file.url, imagePath: response.path });
		});
	});
}

// if (image !== undefined) {
// 	var formData = new FormData();
// 	formData.append("image", image);

// 	$.ajax({
// 		url: "ajax/saveBannerPub.php",
// 		data: formData,
// 		method: "POST",
// 		processData: false,
// 		contentType: false
// 	}).done(imagePath => {
// 		data.bannerPub = { path: imagePath, url };

// 		Save();
// 	});
// }

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

export function deleteUnusedImages() {
	let images = [];
	var count = 0;
	$.each(quizzesList, (index, quizz) => {
		$.each(quizz.questions, (index, question) => {
			count++;
			if (question.image === undefined || question.correctAnswerImage === undefined) {
				alert("ERROR");
			}
			images.push(question.image.imagePath.replace("uploads/", ""));
			images.push(question.correctAnswerImage.imagePath.replace("uploads/", ""));
		});
	});
	let json = JSON.stringify(images);
	// console.log(count);
	// console.log(images.length);

	$.ajax({
		url: "ajax/deleteUnusedImages.php",
		data: { data: json },
		method: "POST"
	});
}

/* #endregion */
