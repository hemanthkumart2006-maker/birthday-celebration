document.addEventListener('DOMContentLoaded', () => {

    // --- VAULT LOGIC ---
    let enteredCode = '';
    
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const secretDateCode = dd + mm; 

    // We allow either the dynamic secretDateCode OR explicitly '0104' for April 1st OR the master fallback '0000'
    const validCodes = [secretDateCode, '0104', '0000']; 
    const maxCodeLength = 4;
    
    const dots = document.querySelectorAll('.dot');
    const errorMsg = document.getElementById('error-msg');
    const unlockBtn = document.getElementById('unlock-btn');
    
    const vaultScreen = document.getElementById('vault-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainScreen = document.getElementById('main-screen');
    
    // Key press handler
    window.pressKey = function(num) {
        if (enteredCode.length < maxCodeLength) {
            enteredCode += num;
            updateDots();
            errorMsg.classList.remove('visible');
        }
        
        // Auto-unlock check if 4 digits are filled
        if (enteredCode.length === maxCodeLength) {
            // small delay so user can see 4th dot filled
            setTimeout(attemptUnlock, 300);
        }
    };
    
    // Backspace handler
    window.clearKey = function() {
        if (enteredCode.length > 0) {
            enteredCode = enteredCode.slice(0, -1);
            updateDots();
            errorMsg.classList.remove('visible');
        }
    };
    
    function updateDots() {
        dots.forEach((dot, index) => {
            if (index < enteredCode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    function attemptUnlock() {
        if (validCodes.includes(enteredCode)) {
            // It's correct! Smoothly transition to the intermediate Welcome Screen!
            vaultScreen.classList.remove('active');
            welcomeScreen.classList.add('active');
        } else {
            // Shake effect and reset
            errorMsg.classList.add('visible');
            enteredCode = '';
            updateDots();
            
            const display = document.getElementById('passcode-display');
            display.style.transform = 'translateX(-5px)';
            setTimeout(() => display.style.transform = 'translateX(5px)', 100);
            setTimeout(() => display.style.transform = 'translateX(0)', 200);
        }
    }

    // Attach to button explicitly just in case they hit 4 digits too fast or prefer the button
    unlockBtn.addEventListener('click', attemptUnlock);

    // --- WELCOME SCREEN TO MAIN SCREEN ---
    const showerLoveBtn = document.getElementById('shower-love-btn');
    showerLoveBtn.addEventListener('click', () => {
        welcomeScreen.classList.remove('active');
        mainScreen.classList.add('active');
        window.scrollTo(0,0);
    });

    // --- LAST SURPRISE BOX LOGIC ---
    const finalBox = document.getElementById('final-box');
    const lastSurpriseContainer = finalBox.parentElement;
    const heartsContainer = document.getElementById('hearts-container');
    let isBoxOpen = false;

    finalBox.addEventListener('click', () => {
        if (!isBoxOpen) {
            isBoxOpen = true;
            finalBox.classList.add('open');
            lastSurpriseContainer.classList.add('revealed');
            
            // Burst Confetti Hearts
            for (let i = 0; i < 20; i++) {
                const heart = document.createElement('div');
                heart.classList.add('float-heart');
                heart.innerHTML = ['💖', '💕', '💗', '❤️'][Math.floor(Math.random()*4)];
                
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 100;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance - 50;
                
                heart.style.setProperty('--dx', `${dx}px`);
                heart.style.setProperty('--dy', `${dy}px`);
                heartsContainer.appendChild(heart);
                
                setTimeout(() => heart.remove(), 1500);
            }
        }
    });

    // --- FINAL YES BUTTON LOGIC ---
    const finalYesBtn = document.getElementById('final-yes-btn');
    if (finalYesBtn) {
        finalYesBtn.addEventListener('click', () => {
            finalYesBtn.innerHTML = 'I Knew It! ❤️';
            finalYesBtn.classList.remove('pulse-glow');
            
            // Mega burst confetti
            for (let i = 0; i < 40; i++) {
                const heart = document.createElement('div');
                heart.classList.add('float-heart');
                heart.innerHTML = ['💖', '💕', '💗', '❤️', '💝'][Math.floor(Math.random()*5)];
                const angle = Math.random() * Math.PI * 2;
                // Bigger explosion radius for the final button
                const distance = 100 + Math.random() * 200;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance - 100;
                
                heart.style.setProperty('--dx', `${dx}px`);
                heart.style.setProperty('--dy', `${dy}px`);
                heartsContainer.appendChild(heart);
                
                setTimeout(() => heart.remove(), 1500);
            }
            
            setTimeout(() => {
                alert("Thank you for being mine! I love you endlessly! ❤️");
            }, 800);
        });
    }

    // --- MUSIC PLAYER LOGIC ---
    const audioToggle = document.getElementById('audio-toggle');
    const playIcon = document.querySelector('.play-icon');
    let isPlaying = false;

    const pauseSVG = `<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>`;
    const playSVG = `<path d="M8 5V19L19 12L8 5Z"></path>`;

    audioToggle.addEventListener('click', () => {
        if (!isPlaying) {
            playIcon.innerHTML = pauseSVG;
            isPlaying = true;
        } else {
            playIcon.innerHTML = playSVG;
            isPlaying = false;
        }
    });

    // --- WHY I LOVE YOU BUTTON LOGIC ---
    const loveQuote = document.getElementById('love-quote');
    const feelLovedBtn = document.getElementById('feel-loved-btn');
    
    const sweetMessages = [
        '"I love you because tumhari presence hi enough hoti hai."',
        '"Your random texts always make me smile unexpectedly."',
        '"Every time I see you, I fall in love all over again."',
        '"I love how we can talk for hours and never get bored."',
        '"You make every ordinary moment feel so incredibly special."',
        '"You are my safe place, my home, and my favorite adventure."'
    ];

    if (feelLovedBtn && loveQuote) {
        feelLovedBtn.addEventListener('click', () => {
            const currentQuote = loveQuote.innerText;
            let newQuote = currentQuote;
            // Ensure we don't pick the same quote twice in a row
            while(newQuote === currentQuote) {
                newQuote = sweetMessages[Math.floor(Math.random() * sweetMessages.length)];
            }
            
            // Fade out, change text, fade back in
            loveQuote.style.opacity = 0;
            setTimeout(() => {
                loveQuote.innerText = newQuote;
                loveQuote.style.opacity = 1;
            }, 300);
        });
        
        // CSS Transition for the fade effect
        loveQuote.style.transition = 'opacity 0.3s ease';
    }
});
