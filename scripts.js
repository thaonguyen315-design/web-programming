var myWords = [];
var currentIndex = 0;
var meaning = false;

var API_KEY = 'b0d4fa31d4mshe37366d2fc6a00ap165c45jsnb31c666c5d21';

var searchInput = document.getElementById('search-input');
var searchButton = document.getElementById('search-button');
var wordDetailsContainer = document.getElementById('word-details-container');
var flashcardDisplay = document.getElementById('flashcard-display');
var flashcardText = document.getElementById('flashcard-text');
var flashcardPrev = document.getElementById('flashcard-prev');
var flashcardNext = document.getElementById('flashcard-next');
var flashcardCounter = document.getElementById('flashcard-counter');

function searchWord() {
    var keyWord = searchInput.value;
    keyWord = keyWord.trim();
    
    if (keyWord === '') {
        alert('Nhập một từ để tìm kiếm nhe!');
        return;
    }

    wordDetailsContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
            <div class="spinner-border text-warning"></div>
            <span class="ms-3 text-muted">Đang tìm từ "${keyWord}"...</span>
        </div>

    `;

    getDataAPI(keyWord);
}

async function getDataAPI(tu) {
    const url = 'https://wordsapiv1.p.rapidapi.com/words/' + tu;
    
    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': API_KEY,
            'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com'
        }
    };

    console.log('Đang gửi yêu cầu đến API cho từ:', tu);

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error('Không tìm thấy từ "' + tu + '"');
        }
        
        const data = await response.json();
        console.log('Dữ liệu nhận được từ API:', data);
        
        showingWordDetails(data);

    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
        
        wordDetailsContainer.innerHTML = `
            <div class="text-center d-flex flex-column justify-content-center align-items-center h-100">
                <h4 class="mt-3 text-danger">Lỗi!</h4>
                <p class="text-muted">${error.message}. Vui lòng thử lại.</p>
            </div>
        `;
    }
}

function showingWordDetails(data) {
    var tu = data.word;
    
    var ipa = 'N/A';
    if (data.pronunciation) {
        if (data.pronunciation.all) {
            ipa = data.pronunciation.all;
        } else {
            ipa = data.pronunciation;
        }
    }
    
    var def = [];
    if (data.results && data.results.length > 0) {
        for (var i = 0; i < data.results.length; i++) {
            var result = data.results[i];
            def.push({
                pos: result.partOfSpeech || 'N/A',
                nghia: result.definition || 'Không có định nghĩa',
                vd: result.examples ? result.examples[0] : 'Không có ví dụ'
            });
        }
    } else {
        def.push({
            pos: 'N/A',
            nghia: 'Không có định nghĩa',
            vd: 'Không có ví dụ'
        });
    }

    var sym = data.results && data.results[0] && data.results[0].synonyms ? data.results[0].synonyms : [];
    var anto = data.results && data.results[0] && data.results[0].antonyms ? data.results[0].antonyms : [];

    var htmlDef = '';
    for (var i = 0; i < def.length; i++) {
        htmlDef += `
            <li class="mb-2">
                <span class="badge bg-warning-light text-dark me-2">${def[i].pos}</span>
                <strong class="d-block">${def[i].nghia}</strong>
                <em class="text-muted">"${def[i].vd}"</em>
            </li>
        `;
    }

    var htmlSym = '';
    if (sym.length > 0) {
        for (var i = 0; i < sym.length; i++) {
            htmlSym += `<span class="badge bg-light text-dark me-1">${sym[i]}</span>`;
        }
    } else {
        htmlSym = '<span class="text-muted small">Không có.</span>';
    }

    var htmlAnto = '';
    if (anto.length > 0) {
        for (var i = 0; i < anto.length; i++) {
            htmlAnto += `<span class="badge bg-light text-dark me-1">${anto[i]}</span>`;
        }
    } else {
        htmlAnto = '<span class="text-muted small">Không có.</span>';
    }

    var firstMeaning = def[0].nghia;

    wordDetailsContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="mb-0 text-warning">${tu}</h2>
                <span class="text-muted fs-5">/${ipa}/</span>
            </div>
            <button class="btn btn-warning" id="save-word-btn" 
                    data-word="${tu}" 
                    data-ipa="/${ipa}/" 
                    data-meaning="${firstMeaning}">
                <i class="bi bi-bookmark-plus me-2"></i> Lưu vào Flashcard
            </button>
        </div>
        
        <hr>

        <h5 class="fw-bold">Định nghĩa & Ví dụ</h5>
        <ul class="list-unstyled mb-3">${htmlDef}</ul>

        <h5 class="fw-bold">Từ đồng nghĩa (Synonyms)</h5>
        <p>${htmlSym}</p>

        <h5 class="fw-bold">Từ trái nghĩa (Antonyms)</h5>
        <p>${htmlAnto}</p>
    `;
}

function saveWordsToFlashcard(tu, ipa, nghia) {
    var alreadtExist = false;
    for (var i = 0; i < myWords.length; i++) {
        if (myWords[i].word.toLowerCase() === tu.toLowerCase()) {
            alreadtExist = true;
            break;
        }
    }

    if (alreadtExist) {
        alert('Từ "' + tu + '" đã có trong flashcard rồi!');
        return;
    }

    var newWord = {
        word: tu,
        ipa: ipa,
        meaning: nghia
    };

    myWords.push(newWord);
    
    currentIndex = myWords.length - 1;

    localStorage.setItem('myVocabWords', JSON.stringify(myWords));

    updateFlashcard();

    alert('Đã thêm từ "' + tu + '" vào flashcard!');
}

function updateFlashcard() {
    if (myWords.length === 0) {
        flashcardText.textContent = 'Chưa có từ nào';
        flashcardText.classList.add('text-muted');
        flashcardCounter.textContent = '0/0';
        flashcardPrev.disabled = true;
        flashcardNext.disabled = true;
        return;
    }

    var currentWord = myWords[currentIndex];

    if (meaning) {
        flashcardText.innerHTML = currentWord.meaning;
    } else {
        flashcardText.textContent = currentWord.word;
    }
    
    flashcardText.classList.remove('text-muted');

    flashcardCounter.textContent = (currentIndex + 1) + '/' + myWords.length;

    flashcardPrev.disabled = (currentIndex === 0);
    
    flashcardNext.disabled = (currentIndex === myWords.length - 1);
}

searchButton.onclick = searchWord;

flashcardDisplay.onclick = function() {
    if (myWords.length > 0) {
        meaning = !meaning;
        updateFlashcard();
    }
};

flashcardPrev.onclick = function() {
    if (currentIndex > 0) {
        currentIndex--;
        meaning = false;
        updateFlashcard();
    }
};

flashcardNext.onclick = function() {
    if (currentIndex < myWords.length - 1) {
        currentIndex++;
        meaning = false;
        updateFlashcard();
    }
};

wordDetailsContainer.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'save-word-btn') {
        var button = event.target;
        
        var tu = button.getAttribute('data-word');
        var ipa = button.getAttribute('data-ipa');
        var nghia = button.getAttribute('data-meaning');
        
        saveWordsToFlashcard(tu, ipa, nghia);
        
        button.textContent = 'Đã lưu!';
        button.classList.remove('btn-warning');
        button.classList.add('btn-success');
        button.disabled = true;
    }
});

window.onload = function() {
    var savedWords = localStorage.getItem('myVocabWords');
    
    if (savedWords) {
        myWords = JSON.parse(savedWords);
        updateFlashcard();
    }
};