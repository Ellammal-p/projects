let questionNo = 1;
let score = 0;
let attempt = 0;
let correctAnswer = 0;

const questions = [
    {a:5,b:5,op:'+'},
    {a:10,b:3,op:'-'},
    {a:4,b:6,op:'*'},
    {a:20,b:5,op:'/'},
    {a:8,b:2,op:'+'},
    {a:15,b:4,op:'-'},
    {a:3,b:7,op:'*'},
    {a:18,b:3,op:'/'},
    {a:9,b:8,op:'+'},
    {a:25,b:5,op:'/'}
];
console.log("JS Loaded");

function loadQuestion(){
    console.log("firstQuestion loaded..");
    let q = questions[questionNo - 1];

    document.getElementById("num1").innerHTML = q.a;
    document.getElementById("num2").innerHTML = q.b;
    document.getElementById("op").innerHTML = q.op;

    if(q.op == '+'){
        correctAnswer = q.a + q.b;
    }else if(q.op == '-'){
        correctAnswer = q.a - q.b;
    }else if(q.op == '*'){
        correctAnswer = q.a * q.b;
    }else{
        correctAnswer = q.a / q.b;
    }

    attempt = 0;

    document.getElementById("attempt").innerHTML =
        "Attempts Left : 3";

    document.getElementById("qno").innerHTML =
        "QUIZ NO : " + questionNo;
}

function nextQuestion() {
    console.log("nextQuestion loaded..");

    questionNo++;

    document.getElementById("result").innerHTML = "";
    document.getElementById("check_ans").value = "";

    document.getElementById("score").innerHTML =
        "Score : " + score;

    if(questionNo > 10){
    document.querySelector(".app").innerHTML = `
        <div class="quiz">
            <h2 class="text-center">🎉 Quiz Finished 🎉</h2>
            <br>
            <h3 class="text-center">Thank You!</h3>
            <h3 class="text-center">
                Total Score : ${score} / 10
            </h3>

            <br>

            <button
                onclick="window.location.href='/results/'"
                class="btn btn-primary">
                📊 View Results
            </button>
        </div>
    `;

    return;
}

    loadQuestion();
}
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}


document.getElementById("submitBtn").addEventListener("click", function () {
    console.log("submitted loaded..");
    let input = document.getElementById("check_ans");
    let result = document.getElementById("result");

    if (input.value.trim() === "") {
        result.innerHTML = "⚠️ Please enter an answer";
        result.style.color = "orange";
        return;
    }

    if (!/^[-]?\d*\.?\d+$/.test(input.value.trim())) {
        result.innerHTML = "⚠️ Please enter numbers only";
        result.style.color = "#ff9a44";
        return;
    }

    result.innerHTML = "";
    let ans =
    parseFloat(document.getElementById("check_ans").value);

    attempt++;

    document.getElementById("attempt").innerHTML =
    "Attempts Left : " + Math.max(0, 3 - attempt);
    if (Math.abs(ans - correctAnswer) < 0.0001){
        console.log("correct answer...");
        if(attempt == 1)
            score += 1;

        else if(attempt == 2)
            score += 0.5;

        else
            score += 0.25;

        let rec=document.getElementById("result");
        rec.innerHTML ="✅ Correct";
        rec.style.color= "#FFF";

            let marks = 0;

        if(attempt == 1)
            marks = 1;
        else if(attempt == 2)
            marks = 0.5;
        else
            marks = 0.25;

        fetch("/save-result/", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({
        question_no: questionNo,
        attempts_used: attempt,
        marks_scored: marks,
        correct_answer: correctAnswer,
        user_answer: ans
    })
});
        setTimeout(() => {
            nextQuestion();
        }, 1000);
    }
    else {

        if(attempt >= 3){

            let rew=document.getElementById("result");
            rew.innerHTML =`❌ Wrong..`;
            rew.style.color="#EF4444";
            setTimeout(() => {
                nextQuestion();
            }, 1500);

        } else {
            let rew1=document.getElementById("result");
            rew1.innerHTML =`❌ Wrong. Try again!`;
            rew1.style.color="#EF4444";
            }
    }
});
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}
fetch("/reset-quiz/");
loadQuestion();