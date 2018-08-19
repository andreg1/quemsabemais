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

        let questionsPerSerie = 1;
        let numberOfSeries = 2;
        //let questionsPerSerie = 3;
        //let numberOfSeries = Math.floor(questionsList.length / this.players.length / questionsPerSerie) * this.players.length;

        this.series = [];
        this.scores = {};

        for (let i = 0; i < numberOfSeries; i++) {
            this.series.push(questionsList.splice(0, questionsPerSerie))
        }

        for (let player of this.players) {
            this.scores[player] = 0;
        }


        this.timer = null;

        this.nextQuestion();

        // this.loadQuestion();
        this.loadScores();

        $('.playersSectionContent').addClass('d-none');
        $('.quizzSectionContent').removeClass('d-none');
    }
    debug() {
        //console.log(this.series);


        console.log(this.currentPlayer);
        //console.log(this.currentSeries);
        console.log(this.currentQuestion);
    }
    debugTimer() {
        console.log();
    }
    nextQuestion() {
        if (this.currentSeries === undefined || !this.currentSeries.length) {
            if (this.nextSeries() == "gameover") return;
        }
        this.currentQuestion = this.currentSeries.shift();


        this.loadQuestion();
        this.startTimer();
        //this.debug();
    }
    nextPlayer() {
        this.currentPlayer = this.players.shift();
        this.players.push(this.currentPlayer);
    }
    nextSeries() {
        if (!this.series.length) {
            this.gameOver();
            return "gameover";
        }
        this.nextPlayer();
        this.currentSeries = this.series.shift();
    }

    loadQuestion() {
        let panel = $('.questionContent');
        let explanationPanel = $('.explanationContent');
        panel.html('');
        explanationPanel.html('');

        let html = `
            <div class="timerSection"></div>
            <h2>${this.currentQuestion.question}</h2>
            <div class="list-group">`;
        $.each(this.currentQuestion.options, function (index, question) {
            html += `<button type="button" class="list-group-item list-group-item-action answerCTA">${index}. ${question}</button>`;
        });
        html += `</div>`;

        let explanationHtml = `
            <h2>${this.currentQuestion.question}</h2>
            <div class="row">
                <div class="col">${this.currentQuestion.explanation}</div>
                <img src="${this.currentQuestion.correctAnswerImage.imagePath}">
            </div>
            
            `;

        //$(document).keypress(this.confirmAnswer);

        // $('.quizzSectionContent').on('click', '.answerCTA', function () {
        //     engine.confirmAnswer($(this));
        // });

        panel.append(html);
        explanationPanel.append(explanationHtml);

        $('.answerCTA').click(function () { engine.confirmAnswer($(this)) });
    }
    loadScores() {
        let panel = $('.scorePanel');
        let html = '<h3>Scores</h3>';
        $.each(this.scores, function (player, score) {
            html += `<label class="form-control">${player} : ${score}</label>`;
        });
        panel.html(html);
    }
    loadScoresSection() {
        let panel = $('.scoreSectionContent');
        let html = '<h2>Scores</h2>';
        $.each(this.scores, function (player, score) {
            html += `<label class="form-control">${player} : ${score}</label>`;
        });
        panel.html(html);
    }
    confirmAnswer(selectedOption) {
        $('.answerCTA').off('click');
        this.stopTimer();

        $('.answerCTA').eq(this.currentQuestion.correctAnswer).addClass('list-group-item-success');
        $('.answerCTA').not($('.answerCTA').eq(this.currentQuestion.correctAnswer)).addClass('list-group-item-danger');
        
        let points = 3 - this.currentSeries.length;

        if(selectedOption == null){
            this.updateScore(-points);
        }
        else{
            selectedOption.addClass('active');
            this.updateScore(selectedOption.hasClass('list-group-item-danger') ? -points : points);
        }

        setTimeout(this.showExplanation, 1000);

        //selectedOption.addClass('list-group-item-' + (selectedAnswer == this.currentQuestion.correctAnswer ? 'success' : 'danger' + ' active'));

    }
    updateScore(points) {
        this.scores[this.currentPlayer] = this.scores[this.currentPlayer] + points;
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
        $('.scoreSection').removeClass('d-none');
    }
    startTimer() {
        this.currentTime = 5;
        this.updateTimer();
        this.timer = setInterval(function () {
            engine.tickTimer();
        }, 1000);
    }
    tickTimer(){
        engine.currentTime--;
        engine.updateTimer();
        if(engine.currentTime == 0){
            engine.confirmAnswer(null);
        }
    }
    stopTimer(){
        clearInterval(this.timer);
    }
    updateTimer() {
        let panel = $('.timerSection');
        panel.html(`<label class="form-control">${this.currentTime}</label>`);
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
    engine = new quizzEngine();
    $('.playSection').removeClass('d-none');
    $('.scoreSection').addClass('d-none');
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
    addPlayerDB("player1", loadPlayerList);
    addPlayerDB("player2", loadPlayerList);
    $('#playQuizz').click();
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

    if (playersList.size >= 2) {
        $('#playMenu').removeClass('d-none');
    }
    else {
        $('#playMenu').addClass('d-none');
    }
}