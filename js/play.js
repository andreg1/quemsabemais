var liveVersion = window.location.host === "quemsabemais.pt";
var categoriesList;
var quizzesList;

var playersList = [];
var engine;

function loadLive(loadSelectedQuizz, loadBanner) {
	//function loadLive(loadSelectedQuizz) {
	$.getJSON("database.json", fileData => {
		data = fileData;
		categoriesList = data.categories;
		quizzesList = data.quizzes;

		loadSelectedQuizz();
		loadBanner();
	});
}
function loadMobile(loadSelectedQuizz, loadBanner) {
	//function loadMobile(loadSelectedQuizz) {
	categoriesList = data.categories;
	quizzesList = data.quizzes;

	loadSelectedQuizz();
	loadBanner();
}

function selectQuizz(quizzID) {
	selectedQuizz = quizzID;
}
function getSelectedQuizz() {
	return quizzesList[selectedQuizz];
}

function addPlayerDB(playerName, callback) {
	playersList.push(playerName);
	callback();
}

function getPlayers() {
	return playersList;
}
// function getBannerPub() {
//     return data.bannerPub;
// }

/* ----------------------------------------------------- */

class quizzEngine {
	constructor() {
		this.quizz = getSelectedQuizz();
		this.players = getPlayers();

		let questionsList = Object.values(this.quizz.questions);

		// this.questionsPerSerie = 1;
		// this.numberOfSeries = 4;
		this.questionsPerSerie = 3;
		this.numberOfSeries = Math.floor(questionsList.length / this.players.length / this.questionsPerSerie) * this.players.length;

		// if(this.players[0]=="player1"){
		//     this.questionsPerSerie = 1;
		//     this.numberOfSeries = Math.floor(questionsList.length / this.players.length / this.questionsPerSerie) * this.players.length;
		// }
		this.leaderboard = {};

		this.turns = [];
		this.currentTurn = 0;
		this.currentQuestionIndex = 0;
		this.currentRound = 1;
		this.playerOffset = 0;

		for (let i = 0; i < this.numberOfSeries / this.players.length; i++) {
			for (let player of this.players) {
				let turn = {};
				turn.player = player;
				turn.questions = questionsList.splice(0, this.questionsPerSerie);
				turn.currentQuestionIndex = 0;
				this.turns.push(turn);
			}
		}
		for (let player of this.players) {
			this.leaderboard[player] = { score: 0, totalTime: 0 };
		}

		// for (let i = 0; i < this.numberOfSeries; i++) {
		//     this.series.push(questionsList.splice(0, this.questionsPerSerie))
		// }
		//console.log(this.turns);

		this.timer = null;

		this.startQuizz();

		// this.loadQuestion();
		this.loadScores();

		$(".getPlayersSections").addClass("d-none");
		$(".playSection").removeClass("d-none");
	}
	debug() {
		//console.log(this.series);
		//console.log(this.currentPlayer);
		//console.log(this.currentSeries);
		//console.log(this.currentQuestionIndex);
	}
	debugTimer() {
		//console.log();
	}
	startQuizz() {
		this.turns[this.currentTurn].currentQuestionIndex = this.currentQuestionIndex;
		this.loadQuestion();
	}
	nextQuestion() {
		// if (this.currentSeries === undefined || !this.currentSeries.length) {
		//     if (this.nextSeries() == "gameover") return;
		// }
		// this.currentQuestionIndex = this.currentSeries.shift();
		if (this.getCurrentSeries().length == this.currentQuestionIndex + 1) {
			return this.nextPlayer();
		}

		this.currentQuestionIndex++;
		this.turns[this.currentTurn].currentQuestionIndex = this.currentQuestionIndex;
		this.loadQuestion();
		//this.debug();
	}
	// nextTurn() {
	//     this.currentTurn++;
	// }
	nextPlayer() {
		if (this.turns.length == this.currentTurn + 1) {
			return this.gameOver();
		}
		//console.log("turn " + this.currentTurn);
		if (this.players.length > 3) {
			this.playerOffset++;
		}

		if (this.currentTurn > 0 && (this.currentTurn + 1) % this.players.length == 0) {
			this.currentRound++;
			this.playerOffset = 0;
			//console.log("round " + this.currentRound);
		}

		this.currentTurn++;
		this.currentQuestionIndex = 0;
		this.loadQuestion();

		//this.nextPlayer();
		//this.currentSeries = this.series.shift();
	}
	loadGameInfo() {
		let panel = $(".gameInfo");
		panel.html("");

		//console.log(this.currentQuestionIndex);

		let questionsPerSerie = this.questionsPerSerie;
		let currentPlayer = this.getCurrentPlayer();
		let points = this.getCurrentQuestionValue();
		//console.log(this.getCurrentQuestionValue());

		let html = `
        <div class="playerPanel">`;
		//console.log(this.currentRound);

		//console.log(this.getCurrentPlayer());

		let counter = 0;
		for (
			let i = this.currentRound * this.players.length - this.players.length + this.playerOffset;
			counter < 3 && i < this.currentRound * this.players.length;
			i++
		) {
			let turns = this.turns.slice();
			let turn = turns[i];
			// console.log(turns);
			// console.log(turn);

			html += `<div class="${turn.player == currentPlayer ? "currentPlayer" : ""}"><label class="questionsAnswered">${turn.currentQuestionIndex +
				1}/${questionsPerSerie}</label><label class="playerName">${turn.player}</label></div>`;

			counter++;
		}
		html += `</div>
        <div class="questionScore"><label>Vale ${points} ${points > 1 ? "pontos" : "ponto"}</label></div>
        <div class="timerSection"></div>
        <div class="seriesInfo"><label>Série: ${this.currentTurn + 1} de ${this.turns.length}</label></div>`;
		panel.append(html);
	}
	getCurrentQuestion() {
		return this.turns[this.currentTurn].questions[this.currentQuestionIndex];
	}
	getCurrentSeries() {
		return this.turns[this.currentTurn].questions;
	}
	getCurrentTurn() {
		return this.turns[this.currentTurn];
	}
	getCurrentQuestionValue() {
		return this.getCurrentSeries().indexOf(this.getCurrentQuestion()) + 1;
	}
	getCurrentPlayer() {
		return this.getCurrentTurn().player;
	}
	getBannerPub() {
		return this.getCurrentQuestion().bannerPub;
	}

	loadQuestion() {
		let panel = $(".questionContent");
		let explanationPanel = $(".explanationContent");
		panel.html("");
		explanationPanel.html("");

		this.loadGameInfo();

		this.loadBannerPub();

		let html = `
            
            <h3 class="question">${this.getCurrentQuestion().question}</h3>
            <div>
                <div class="list-group">`;
		$.each(this.getCurrentQuestion().options, function(index, question) {
			html += `<button type="button" class="list-group-item list-group-item-action answerCTA">${index} - ${question}</button>`;
		});
		html += `</div>
                <img src="${this.getCurrentQuestion().image.imagePath}">
            </div>
            <button id="seeAnswer" class="btn btn-primary d-none">Ver Resposta</button>
        `;

		let explanationHtml = `
            <h3 class="question">${this.getCurrentQuestion().question}</h3>
            <div class="row">
                <div class="col">${this.getCurrentQuestion().explanation}</div>
                <img src="${this.getCurrentQuestion().correctAnswerImage.imagePath}" style="padding-right:15px;">
            </div>
            
            `;

		//$(document).keypress(this.confirmAnswer);

		// $('.quizzSectionContent').on('click', '.answerCTA', function () {
		//     engine.confirmAnswer($(this));
		// });

		panel.append(html);
		explanationPanel.append(explanationHtml);

		this.startTimer();

		$(".answerCTA").click(function() {
			engine.selectAnswer($(this));
		});

		if (
			this.turns.indexOf(this.getCurrentTurn()) == this.turns.length - 1 &&
			this.getCurrentSeries().indexOf(this.getCurrentQuestion()) == this.getCurrentSeries().length - 1
		) {
			// last series and last question
			$("#nextQuestionButton").text("Ver Resultados");
		}
	}
	loadScores() {
		let panel = $(".scorePanel");
		let html = "";
		let currentPlayer = this.getCurrentPlayer();
		$.each(this.leaderboard, function(player, info) {
			html += `<div class="${player == currentPlayer ? "currentPlayer" : ""}">
                        <label>${player}</label>
                        <label class="playerScore">${info.score} pontos</label>
                    </div>`;
		});
		panel.html(html);
	}
	loadScoresSection() {
		let panel = $(".scoreSectionContent");
		let html = "<h2>Scores</h2>";
		let scores = [];

		$.each(this.leaderboard, function(name, info) {
			scores.push([name, info.score, info.totalTime]);
		});

		scores.sort((a, b) => {
			return b[1] - a[1] == 0 ? a[2] - b[2] : b[1] - a[1]; //sort by score,time ASC
		});

		scores.forEach(score => {
			html += `<label class="form-control">${score[0]} : ${score[1]} (${(score[2] / 1000).toFixed(2)}s)</label>`;
		});

		panel.html(html);
	}
	loadBannerPub() {
		let bannerPub = this.getBannerPub();
		loadBannerPub(bannerPub);
	}

	selectAnswer(selectedOption) {
		$(".answerCTA").off("click");
		this.stopTimer();
		if (selectedOption !== null) selectedOption.addClass("active");

		$("#seeAnswer").removeClass("d-none");
		$("#seeAnswer").click(() => {
			engine.confirmAnswer(selectedOption);
		});
	}
	confirmAnswer(selectedOption) {
		$("#seeAnswer").off("click");
		let points = this.getCurrentQuestionValue();
		var elapsedTime = Date.now() - this.startTime;

		if (selectedOption == null) {
			$(".answerCTA")
				.eq(this.getCurrentQuestion().correctAnswer - 1)
				.addClass("right-answer");
			this.updateScore(-points, elapsedTime);
		} else {
			let selectedAnswer = $(".answerCTA").index(selectedOption) + 1;
			let isCorrect = selectedAnswer == this.getCurrentQuestion().correctAnswer;

			if (isCorrect) {
				new Audio("resources/certo.mp3").play();
				selectedOption.addClass("right-answer");
			} else {
				new Audio("resources/errado.mp3").play();
				selectedOption.addClass("wrong-answer");
				$(".answerCTA")
					.eq(this.getCurrentQuestion().correctAnswer - 1)
					.addClass("right-answer");
			}
			this.updateScore(isCorrect ? points : -points, elapsedTime);
		}

		// $('#seeAnswer').removeClass('d-none');
		// $('#seeAnswer').click(() => { setTimeout(engine.showExplanation, 2500); });
		setTimeout(engine.showExplanation, 2500);

		//selectedOption.addClass('list-group-item-' + (selectedAnswer == this.currentQuestionIndex.correctAnswer ? 'success' : 'danger' + ' active'));
	}
	updateScore(points, elapsedTime) {
		this.leaderboard[this.getCurrentPlayer()].score += points;
		this.leaderboard[this.getCurrentPlayer()].totalTime += elapsedTime;
		this.loadScores();
	}
	showExplanation() {
		$(".questionPanel").fadeOut(200, function() {
			$("#seeAnswer").addClass("d-none");
			$(".explanationPanel").fadeIn(200);
		});
	}
	gameOver() {
		this.loadScoresSection();
		$(".playSection").addClass("d-none");
		$(".gameOver").removeClass("d-none");
	}
	startTimer() {
		this.startTime = Date.now();
		this.currentTime = 30;
		this.updateTimer();
		this.timer = setInterval(function() {
			engine.tickTimer();
		}, 1000);
	}
	tickTimer() {
		engine.currentTime--;
		engine.updateTimer();
		if (engine.currentTime == 0) {
			engine.selectAnswer(null);
		}
	}
	stopTimer() {
		clearInterval(this.timer);
	}
	updateTimer() {
		let panel = $(".timerSection");
		panel.html(`<label>${this.currentTime}s</label>`);
	}
}

$(document).ready(function() {
	if (liveVersion) {
		loadLive(loadSelectedQuizz, loadBanner);
		//loadLive(loadSelectedQuizz);
	} else {
		loadMobile(loadSelectedQuizz, loadBanner);
		//loadMobile(loadSelectedQuizz);
	}
});

$("#addPlayerForm").submit(function(event) {
	event.preventDefault();
	addPlayer();
});

$("#playQuizz").click(() => {
	engine = new quizzEngine();
});

$("#nextQuestionButton").click(() => {
	if (engine.switchingQuestion) return;
	engine.switchingQuestion = true;
	$(".explanationPanel").fadeOut(200, function() {
		engine.nextQuestion();
		$(".questionPanel").fadeIn(200, function() {
			engine.switchingQuestion = false;
		});
	});
});

$("#playAgainButton").click(() => {
	$(".getPlayersSections").removeClass("d-none");
	$(".gameOver").addClass("d-none");
});

function loadSelectedQuizz() {
	let searchParams = new URLSearchParams(window.location.search);
	let id = searchParams.get("id");

	if (quizzesList[id] === undefined) {
		window.location.replace("index.html");
	} else {
		selectQuizz(id);
	}

	//to remove
	// addPlayerDB("player1", loadPlayerList);
	// addPlayerDB("player2", loadPlayerList);
	// addPlayerDB("player3", loadPlayerList);
	// addPlayerDB("player4", loadPlayerList);
	// addPlayerDB("player5", loadPlayerList);
	// addPlayerDB("player6", loadPlayerList);
	// $('#playQuizz').click();
}

function addPlayer() {
	let playerName = $("input[name=playerName]").val();
	addPlayerDB(playerName, loadPlayerList);
	$("input[name=playerName]").val("");
}

function loadPlayerList() {
	let html = "";
	let playersList = getPlayers();
	for (let player of playersList) {
		html += `<label class="form-control">${player}</label>`;
	}
	$(".playersList").html(html);

	if (playersList.length >= 2) {
		$("#playMenu").removeClass("d-none");
	} else {
		$("#playMenu").addClass("d-none");
	}
}

function loadBanner() {
	let bannerPub = getSelectedQuizz().bannerPub;
	loadBannerPub(bannerPub);
}

function loadBannerPub(bannerPub) {
	if (bannerPub !== undefined && bannerPub.imagePath !== undefined) {
		$(".bannerPubContainer a").show();
		$(".bannerPubContainer img").attr("src", bannerPub.imagePath);
		if (bannerPub.url !== undefined) {
			if (bannerPub.url.length) {
				$(".bannerPubContainer a").attr("href", bannerPub.url);
				$(".bannerPubContainer a").css("pointer-events", "all");
			}
		} else {
			$(".bannerPubContainer a").css("pointer-events", "none");
		}
	} else {
		$(".bannerPubContainer img").attr("src", "");
		$(".bannerPubContainer a").hide();
	}
}
