var data;
var categoriesList;
var quizzesList;

var playersList = [];
var engine;

function Load(callback) {
    $.getJSON("../database.json", fileData => {
        data = fileData;
        categoriesList = data.categories;
        quizzesList = data.quizzes;

        callback();
    });
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

/* ----------------------------------------------------- */

class quizzEngine {
    constructor() {
        this.quizz = getSelectedQuizz();
        this.players = getPlayers();



        let questionsList = Object.values(this.quizz.questions);

        // let questionsPerSerie = 1;
        // let numberOfSeries = 2;
        this.questionsPerSerie = 3;
        this.numberOfSeries = Math.floor(questionsList.length / this.players.length / this.questionsPerSerie) * this.players.length;

        this.leaderboard = {};

        this.turns = [];
        this.currentTurn = 0;
        this.currentQuestionIndex = 0;

        for (let player of this.players) {
            let turn = {};
            turn.player = player;
            for (let i = 0; i < this.numberOfSeries / 2; i++) {
                turn.questions = questionsList.splice(0, this.questionsPerSerie);
                turn.currentQuestionIndex = 0;
            }
            this.turns.push(turn);
            this.leaderboard[player] = { score: 0, totalTime: 0 };
        }

        // for (let i = 0; i < this.numberOfSeries; i++) {
        //     this.series.push(questionsList.splice(0, this.questionsPerSerie))
        // }
        console.log(this.turns);


        this.timer = null;

        this.startQuizz();

        // this.loadQuestion();
        this.loadScores();

        $('.getPlayersSections').addClass('d-none');
        $('.playSection').removeClass('d-none');
    }
    debug() {
        //console.log(this.series);


        console.log(this.currentPlayer);
        //console.log(this.currentSeries);
        console.log(this.currentQuestionIndex);
    }
    debugTimer() {
        console.log();
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
            return this.nextSeries();
        }

        this.currentQuestionIndex++;
        this.turns[this.currentTurn].currentQuestionIndex = this.currentQuestionIndex;
        this.loadQuestion();
        //this.debug();
    }
    // nextTurn() {
    //     this.currentTurn++;
    // }
    nextSeries() {
        if (this.turns.length == this.currentTurn + 1) {
            return this.gameOver();
        }
        this.currentTurn++;
        this.currentQuestionIndex = 0;
        this.loadQuestion();

        //this.nextPlayer();
        //this.currentSeries = this.series.shift();
    }
    loadGameInfo() {
        let panel = $('.gameInfo');
        panel.html('');

        //console.log(this.currentQuestionIndex);

        let questionsPerSerie = this.questionsPerSerie;
        let currentPlayer = this.getCurrentPlayer();
        let points = this.getCurrentQuestionValue();
        //console.log(this.getCurrentQuestionValue());

        let html = `
        <div class="playerPanel">`;

        $.each(this.turns, function (index, turn) {
            html += `<div class="${turn.player == currentPlayer ? 'currentPlayer' : ''}"><label class="questionsAnswered">${turn.currentQuestionIndex + 1}/${questionsPerSerie}</label><label class="playerName">${turn.player}</label></div>`;
        });

        html += `</div>
        <div class="questionScore"><label>Vale ${points} ${points > 1 ? 'pontos' : 'ponto'}</label></div>
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

    loadQuestion() {
        let panel = $('.questionContent');
        let explanationPanel = $('.explanationContent');
        panel.html('');
        explanationPanel.html('');

        this.loadGameInfo();

        let html = `
            
            <h2 class="question">${this.getCurrentQuestion().question}</h2>
            <div style="display:flex;">
                <div class="list-group">`;
        $.each(this.getCurrentQuestion().options, function (index, question) {
            html += `<button type="button" class="list-group-item list-group-item-action answerCTA">${index} - ${question}</button>`;
        });
        html += `</div>
                <img src="${this.getCurrentQuestion().correctAnswerImage.imagePath}" style="flex:1;">
            </div>
        
        `;

        let explanationHtml = `
            <h2 class="question">${this.getCurrentQuestion().question}</h2>
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

        $('.answerCTA').click(function () { engine.confirmAnswer($(this)) });
    }
    loadScores() {
        let panel = $('.scorePanel');
        let html = '';
        let currentPlayer = this.getCurrentPlayer();
        $.each(this.leaderboard, function (player, info) {
            html += `<div class="${player == currentPlayer ? "currentPlayer" : ""}">
                        <label>${player}</label>
                        <label class="playerScore">${info.score} pontos</label>
                    </div>`;
        });
        panel.html(html);
    }
    loadScoresSection() {
        let panel = $('.scoreSectionContent');
        let html = '<h2>Scores</h2>';
        $.each(this.leaderboard, function (player, info) {
            html += `<label class="form-control">${player} : ${info.score} (${(info.totalTime/1000).toFixed(2)}s)</label>`;
        });
        panel.html(html);
    }
    confirmAnswer(selectedOption) {
        $('.answerCTA').off('click');
        this.stopTimer();


        //$('.answerCTA').eq(this.currentQuestionIndex.correctAnswer).addClass('list-group-item-success');
        //$('.answerCTA').not($('.answerCTA').eq(this.currentQuestionIndex.correctAnswer)).addClass('list-group-item-danger');

        let selectedIndex = $('.answerCTA').index(selectedOption);
        let selectedAnswer = selectedIndex + 1;

        let points = this.getCurrentQuestionValue();
        var elapsedTime = Date.now() - this.startTime;
        console.log(selectedAnswer);
        console.log(this.getCurrentQuestion().correctAnswer);




        if (selectedOption == null) {
            this.updateScore(-points, elapsedTime);
        }
        else {
            selectedOption.addClass('active');
            this.updateScore(selectedAnswer == this.getCurrentQuestion().correctAnswer ? points : -points, elapsedTime);
        }

        setTimeout(this.showExplanation, 1000);

        //selectedOption.addClass('list-group-item-' + (selectedAnswer == this.currentQuestionIndex.correctAnswer ? 'success' : 'danger' + ' active'));

    }
    updateScore(points, elapsedTime) {
        this.leaderboard[this.getCurrentPlayer()].score += points;
        this.leaderboard[this.getCurrentPlayer()].totalTime += elapsedTime;
        this.loadScores();
    }
    showExplanation() {
        $('.questionPanel').fadeOut(200, function () {
            $('.explanationPanel').fadeIn(200);
        });
    }
    gameOver() {
        this.loadScoresSection();
        $('.playSection').addClass('d-none');
        $('.gameOver').removeClass('d-none');
    }
    startTimer() {
        this.startTime = Date.now();
        this.currentTime = 30;
        this.updateTimer();
        this.timer = setInterval(function () {
            engine.tickTimer();
        }, 1000);
    }
    tickTimer() {
        engine.currentTime--;
        engine.updateTimer();
        if (engine.currentTime == 0) {
            engine.confirmAnswer(null);
        }
    }
    stopTimer() {
        clearInterval(this.timer);
    }
    updateTimer() {
        let panel = $('.timerSection');
        panel.html(`<label>${this.currentTime}s</label>`);
    }
}

$(document).ready(function () {
    Load(loadSelectedQuizz);
});

$('#addPlayerForm').submit(function (event) {
    event.preventDefault();
    addPlayer();
});

$('#playQuizz').click(() => {
    engine = new quizzEngine();
});

$('#nextQuestionButton').click(() => {
    if (engine.switchingQuestion) return;
    engine.switchingQuestion = true;
    $('.explanationPanel').fadeOut(200, function () {
        engine.nextQuestion();
        $('.questionPanel').fadeIn(200, function () {
            engine.switchingQuestion = false;
        });
    });
});

$('#playAgainButton').click(() => {
    $('.getPlayersSections').removeClass('d-none');
    $('.gameOver').addClass('d-none');
});


function loadSelectedQuizz() {
    let searchParams = new URLSearchParams(window.location.search);
    let id = searchParams.get('id');

    if (quizzesList[id] === undefined) {
        window.location.replace('index.html');
    }
    else {
        selectQuizz(id);
    }

    //to remove
    // addPlayerDB("player1", loadPlayerList);
    // addPlayerDB("player2", loadPlayerList);
    // $('#playQuizz').click();
}

function addPlayer() {
    let playerName = $('input[name=playerName]').val();
    addPlayerDB(playerName, loadPlayerList);
    $('input[name=playerName]').val('');
}

function loadPlayerList() {
    let html = "";
    let playersList = getPlayers();
    for (let player of playersList) {
        html += `<label class="form-control">${player}</label>`;
    }
    $('.playersList').html(html);

    if (playersList.length >= 2) {
        $('#playMenu').removeClass('d-none');
    }
    else {
        $('#playMenu').addClass('d-none');
    }
}