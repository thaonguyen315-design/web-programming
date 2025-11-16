var myWords = [];
var currentIndex = 0;
var showingMeaning = false;

var API_KEY = 'b0d4fa31d4mshe37366d2fc6a00ap165c45jsnb31c666c5d21';

var searchInput = document.getElementById('search-input');
var searchButton = document.getElementById('search-button');
var wordDetailsContainer = document.getElementById('word-details-container');
var flashcardDisplay = document.getElementById('flashcard-display');
var flashcardText = document.getElementById('flashcard-text');
var flashcardPrev = document.getElementById('flashcard-prev');
var flashcardNext = document.getElementById('flashcard-next');
var flashcardCounter = document.getElementById('flashcard-counter');

window.onload = function() {
    var savedWords = localStorage.getItem('myVocabWords');
    
    if (savedWords) {
        myWords = JSON.parse(savedWords);
        capNhatFlashcard();
    }
};

function timKiemTu() {
    var tuKhoa = searchInput.value.trim();
    
    if (tuKhoa === '') {
        alert('Nhập một từ để tìm kiếm nhe!');
        return;
    }

    wordDetailsContainer.innerHTML = `
        <div class="d-flex justify-content-center align-items-center h-100">
            <div class="spinner-border text-warning" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <span class="ms-3 text-muted">Đang tìm từ "${tuKhoa}"...</span>
        </div>
    `;

    layDuLieuTuAPI(tuKhoa);
}

function layDuLieuTuAPI(tu) {
    var apiUrl = 'https://wordsapiv1.p.rapidapi.com/words/' + tu;
    
    var options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
        }
    };

    console.log('Đang gửi yêu cầu đến API cho từ:', tu);

    fetch(apiUrl, options)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Không tìm thấy từ "' + tu + '"');
            }
            return response.json();
        })
        .then(function(data) {
            console.log('Dữ liệu nhận được từ API:', data);
            
            hienThiThongTinTu(data);
        })
        .catch(function(error) {
            console.error('Lỗi khi gọi API:', error);
            
            wordDetailsContainer.innerHTML = `
                <div class="text-center d-flex flex-column justify-content-center align-items-center h-100">
                    <h4 class="mt-3 text-danger">Lỗi!</h4>
                    <p class="text-muted">${error.message}. Vui lòng thử lại.</p>
                </div>
            `;
        });
}

function hienThiThongTinTu(data) {
    var tu = data.word;
    
    var phienAm = 'N/A';
    if (data.pronunciation) {
        if (data.pronunciation.all) {
            phienAm = data.pronunciation.all;
        } else {
            phienAm = data.pronunciation;
        }
    }
    
    var dinhNghia = [];
    if (data.results && data.results.length > 0) {
        for (var i = 0; i < data.results.length; i++) {
            var result = data.results[i];
            dinhNghia.push({
                loaiTu: result.partOfSpeech || 'N/A',
                nghia: result.definition || 'Không có định nghĩa',
                viDu: result.examples ? result.examples[0] : 'Không có ví dụ'
            });
        }
    } else {
        dinhNghia.push({
            loaiTu: 'N/A',
            nghia: 'Không có định nghĩa',
            viDu: 'Không có ví dụ'
        });
    }

    var tuDongNghia = data.results && data.results[0] && data.results[0].synonyms ? data.results[0].synonyms : [];
    var tuTraiNghia = data.results && data.results[0] && data.results[0].antonyms ? data.results[0].antonyms : [];

    var htmlDinhNghia = '';
    for (var i = 0; i < dinhNghia.length; i++) {
        htmlDinhNghia += `
            <li class="mb-2">
                <span class="badge bg-warning-light text-dark me-2">${dinhNghia[i].loaiTu}</span>
                <strong class="d-block">${dinhNghia[i].nghia}</strong>
                <em class="text-muted">"${dinhNghia[i].viDu}"</em>
            </li>
        `;
    }

    var htmlDongNghia = '';
    if (tuDongNghia.length > 0) {
        for (var i = 0; i < tuDongNghia.length; i++) {
            htmlDongNghia += `<span class="badge bg-light text-dark me-1">${tuDongNghia[i]}</span>`;
        }
    } else {
        htmlDongNghia = '<span class="text-muted small">Không có.</span>';
    }

    var htmlTraiNghia = '';
    if (tuTraiNghia.length > 0) {
        for (var i = 0; i < tuTraiNghia.length; i++) {
            htmlTraiNghia += `<span class="badge bg-light text-dark me-1">${tuTraiNghia[i]}</span>`;
        }
    } else {
        htmlTraiNghia = '<span class="text-muted small">Không có.</span>';
    }

    var nghiaDauTien = dinhNghia[0].nghia;

    var htmlHoanChinh = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
                <h2 class="mb-0 text-warning">${tu}</h2>
                <span class="text-muted fs-5">/${phienAm}/</span>
            </div>
            <button class="btn btn-warning" id="save-word-btn" 
                    data-word="${tu}" 
                    data-ipa="/${phienAm}/" 
                    data-meaning="${nghiaDauTien}">
                <i class="bi bi-bookmark-plus me-2"></i> Lưu vào Flashcard
            </button>
        </div>
        
        <hr>

        <h5 class="fw-bold">Định nghĩa & Ví dụ</h5>
        <ul class="list-unstyled mb-3">${htmlDinhNghia}</ul>

        <h5 class="fw-bold">Từ đồng nghĩa (Synonyms)</h5>
        <p>${htmlDongNghia}</p>

        <h5 class="fw-bold">Từ trái nghĩa (Antonyms)</h5>
        <p>${htmlTraiNghia}</p>
    `;

    wordDetailsContainer.innerHTML = htmlHoanChinh;
}

function luuTuVaoFlashcard(tu, ipa, nghia) {
    var daTonTai = false;
    for (var i = 0; i < myWords.length; i++) {
        if (myWords[i].word.toLowerCase() === tu.toLowerCase()) {
            daTonTai = true;
            break;
        }
    }

    if (daTonTai) {
        alert('Từ "' + tu + '" đã có trong flashcard rồi!');
        return;
    }

    var tuMoi = {
        word: tu,
        ipa: ipa,
        meaning: nghia
    };

    myWords.push(tuMoi);
    
    currentIndex = myWords.length - 1;

    localStorage.setItem('myVocabWords', JSON.stringify(myWords));

    capNhatFlashcard();

    alert('Đã thêm từ "' + tu + '" vào flashcard!');
}

function capNhatFlashcard() {
    if (myWords.length === 0) {
        flashcardText.textContent = 'Chưa có từ nào';
        flashcardText.classList.add('text-muted');
        flashcardCounter.textContent = '0/0';
        flashcardPrev.disabled = true;
        flashcardNext.disabled = true;
        return;
    }

    var tuHienTai = myWords[currentIndex];

    if (showingMeaning) {
        flashcardText.innerHTML = '<small>' + tuHienTai.meaning + '</small>';
    } else {
        flashcardText.textContent = tuHienTai.word;
    }
    
    flashcardText.classList.remove('text-muted');

    flashcardCounter.textContent = (currentIndex + 1) + '/' + myWords.length;

    flashcardPrev.disabled = (currentIndex === 0);
    
    flashcardNext.disabled = (currentIndex === myWords.length - 1);
}

searchButton.onclick = timKiemTu;
searchInput.onkeypress = function(event) {
    if (event.key === 'Enter') {
        timKiemTu();
    }
};

flashcardDisplay.onclick = function() {
    if (myWords.length > 0) {
        showingMeaning = !showingMeaning;                capNhatFlashcard();
    }
};

flashcardPrev.onclick = function() {
    if (currentIndex > 0) {
        currentIndex--;
        showingMeaning = false;
        capNhatFlashcard();
    }
};

flashcardNext.onclick = function() {
    if (currentIndex < myWords.length - 1) {
        currentIndex++;
        showingMeaning = false;
        capNhatFlashcard();
    }
};

wordDetailsContainer.addEventListener('click', function(event) {
    if (event.target && event.target.id === 'save-word-btn') {
        var button = event.target;
        
        var tu = button.getAttribute('data-word');
        var ipa = button.getAttribute('data-ipa');
        var nghia = button.getAttribute('data-meaning');
        
        luuTuVaoFlashcard(tu, ipa, nghia);
        
        button.textContent = 'Đã lưu!';
        button.classList.remove('btn-warning');
        button.classList.add('btn-success');
        button.disabled = true;
    }
});
