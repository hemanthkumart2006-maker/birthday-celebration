/**
 * The Vault — Celebration-H
 * Complete Professional Interactive Engine
 * Dynamic DDMM Passcode, Web Audio Ambient Generator, 3D Polaroids & Envelopes, Climax
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. DYNAMIC DATE PASSCODE & VAULT SYSTEM
    // ==========================================
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const requiredDateCode = dd + mm; // e.g. "1609" on Sept 16

    let enteredCode = '';
    let isVaultUnlocked = false;
    const maxCodeLength = 4;

    const passDots = document.querySelectorAll('.pass-dot');
    const passcodeDisplay = document.getElementById('passcode-display');
    const vaultError = document.getElementById('vault-error');
    const vaultUnlockBtn = document.getElementById('vault-unlock-btn');
    const vaultScreen = document.getElementById('vault-screen');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainScreen = document.getElementById('main-screen');

    // Update Passcode Dots
    function updatePasscodeDots() {
        passDots.forEach((dot, index) => {
            if (index < enteredCode.length) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // Handle digit input
    function handleDigitInput(digit) {
        if (isVaultUnlocked) return;
        if (enteredCode.length < maxCodeLength) {
            enteredCode += digit;
            updatePasscodeDots();
            vaultError.classList.remove('visible');

            // Try unlocking if 4 digits entered
            if (enteredCode.length === maxCodeLength) {
                setTimeout(attemptVaultUnlock, 250);
            }
        }
    }

    // Handle backspace
    function handleBackspace() {
        if (isVaultUnlocked) return;
        if (enteredCode.length > 0) {
            enteredCode = enteredCode.slice(0, -1);
            updatePasscodeDots();
            vaultError.classList.remove('visible');
        }
    }

    // Attempt Unlock Verification
    function attemptVaultUnlock() {
        if (isVaultUnlocked) return;

        // ONLY today's date (DDMM) is accepted
        if (enteredCode === requiredDateCode) {
            isVaultUnlocked = true;

            // Success unlock animation
            passcodeDisplay.style.borderColor = 'var(--gold-accent)';
            
            // Start ambient audio on unlock user interaction
            audioEngine.initAndPlay();

            // Cinematic transition from Vault to Welcome Screen
            setTimeout(() => {
                vaultScreen.style.opacity = '0';
                vaultScreen.style.transform = 'scale(0.96)';

                setTimeout(() => {
                    vaultScreen.classList.remove('active');
                    welcomeScreen.classList.add('active');
                    requestAnimationFrame(() => {
                        welcomeScreen.style.opacity = '1';
                        welcomeScreen.style.transform = 'scale(1)';
                    });
                }, 600);
            }, 400);

        } else {
            // Incorrect passcode: shake display & show error feedback
            vaultError.classList.add('visible');
            passcodeDisplay.classList.add('shake');

            setTimeout(() => {
                passcodeDisplay.classList.remove('shake');
                enteredCode = '';
                updatePasscodeDots();
            }, 500);
        }
    }

    // Keypad Click Listeners
    const numKeys = document.querySelectorAll('.num-key[data-key]');
    numKeys.forEach(key => {
        key.addEventListener('click', () => {
            const digit = key.getAttribute('data-key');
            handleDigitInput(digit);
        });
    });

    const keyDel = document.getElementById('key-del');
    if (keyDel) {
        keyDel.addEventListener('click', handleBackspace);
    }

    if (vaultUnlockBtn) {
        vaultUnlockBtn.addEventListener('click', () => {
            if (enteredCode.length === maxCodeLength) {
                attemptVaultUnlock();
            } else {
                vaultError.classList.add('visible');
                passcodeDisplay.classList.add('shake');
                setTimeout(() => passcodeDisplay.classList.remove('shake'), 450);
            }
        });
    }

    // Physical Keyboard Support
    window.addEventListener('keydown', (e) => {
        if (vaultScreen.classList.contains('active') && !isVaultUnlocked) {
            if (/^[0-9]$/.test(e.key)) {
                handleDigitInput(e.key);
            } else if (e.key === 'Backspace') {
                handleBackspace();
            } else if (e.key === 'Enter') {
                attemptVaultUnlock();
            }
        }
    });

    // ==========================================
    // 2. WELCOME SCREEN TO MAIN SCRAPBOOK
    // ==========================================
    const stepInsideBtn = document.getElementById('step-inside-btn');
    if (stepInsideBtn) {
        stepInsideBtn.addEventListener('click', () => {
            audioEngine.initAndPlay();

            welcomeScreen.style.opacity = '0';
            welcomeScreen.style.transform = 'translateY(-20px)';

            setTimeout(() => {
                welcomeScreen.classList.remove('active');
                mainScreen.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                requestAnimationFrame(() => {
                    mainScreen.style.opacity = '1';
                });
            }, 600);
        });
    }

    // ==========================================
    // 3. AMBIENT AUDIO ENGINE (WEB AUDIO & MP3)
    // ==========================================
    class AmbientAudioEngine {
        constructor() {
            this.ctx = null;
            this.isPlaying = false;
            this.isMuted = false;
            this.masterGain = null;
            this.currentVolume = 0.75;
            this.intervalId = null;

            this.deck = document.getElementById('audio-deck');
            this.toggleBtn = document.getElementById('audio-toggle-btn');
            this.muteBtn = document.getElementById('mute-toggle-btn');
            this.volumeSlider = document.getElementById('volume-slider');
            this.statusText = document.getElementById('audio-status-text');
            this.localAudio = document.getElementById('local-audio-track');

            this.initListeners();
        }

        initListeners() {
            if (this.toggleBtn) {
                this.toggleBtn.addEventListener('click', () => {
                    if (this.isPlaying) {
                        this.pause();
                    } else {
                        this.initAndPlay();
                    }
                });
            }

            if (this.muteBtn) {
                this.muteBtn.addEventListener('click', () => {
                    this.toggleMute();
                });
            }

            if (this.volumeSlider) {
                this.volumeSlider.addEventListener('input', (e) => {
                    this.setVolume(parseFloat(e.target.value));
                });
            }
        }

        initContext() {
            if (!this.ctx) {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.ctx = new AudioContextClass();
                    this.masterGain = this.ctx.createGain();
                    this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
                    this.masterGain.connect(this.ctx.destination);
                }
            }
        }

        playPianoNote(freq, startTime, duration = 3.5) {
            if (!this.ctx || !this.masterGain || this.isMuted) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, startTime);

            // Warm low-pass filter for acoustic warmth
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(900, startTime);
            filter.frequency.exponentialRampToValueAtTime(300, startTime + duration);

            // Envelope: gentle bell attack, resonant decay
            gain.gain.setValueAtTime(0.0001, startTime);
            gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(startTime);
            osc.stop(startTime + duration + 0.1);
        }

        startSynthesizedChords() {
            if (!this.ctx) return;
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }

            // Fmaj7 -> Cmaj -> Dm7 -> Bbmaj7 romantic progression
            const chordProgressions = [
                [174.61, 220.00, 261.63, 329.63], // F, A, C, E
                [130.81, 196.00, 261.63, 329.63], // C, G, C, E
                [146.83, 220.00, 261.63, 349.23], // D, A, C, F
                [116.54, 174.61, 233.08, 293.66]  // Bb, F, Bb, D
            ];

            let chordIndex = 0;

            const playNextChord = () => {
                if (!this.isPlaying || !this.ctx) return;
                const nowTime = this.ctx.currentTime;
                const chord = chordProgressions[chordIndex % chordProgressions.length];

                // Play arpeggiated piano notes
                chord.forEach((noteFreq, i) => {
                    this.playPianoNote(noteFreq, nowTime + i * 0.28, 4.0);
                });

                chordIndex++;
            };

            playNextChord();
            this.intervalId = setInterval(playNextChord, 3800);
        }

        initAndPlay() {
            this.initContext();

            // Try local audio track first if available
            if (this.localAudio && this.localAudio.currentSrc && this.localAudio.src) {
                this.localAudio.volume = this.currentVolume;
                this.localAudio.play().then(() => {
                    this.setPlayingState(true);
                    return;
                }).catch(() => {
                    // Fall back to built-in Web Audio synthesis
                    this.playSynthesizer();
                });
            } else {
                this.playSynthesizer();
            }
        }

        playSynthesizer() {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            this.startSynthesizedChords();
            this.setPlayingState(true);
        }

        pause() {
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            if (this.localAudio) {
                this.localAudio.pause();
            }
            this.setPlayingState(false);
        }

        setPlayingState(playing) {
            this.isPlaying = playing;
            if (this.deck) {
                if (playing) {
                    this.deck.classList.add('playing');
                    if (this.statusText) this.statusText.textContent = 'Now Playing ♪';
                } else {
                    this.deck.classList.remove('playing');
                    if (this.statusText) this.statusText.textContent = 'Paused';
                }
            }
        }

        setVolume(val) {
            this.currentVolume = val;
            if (this.masterGain && this.ctx) {
                this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : val, this.ctx.currentTime);
            }
            if (this.localAudio) {
                this.localAudio.volume = this.isMuted ? 0 : val;
            }
        }

        toggleMute() {
            this.isMuted = !this.isMuted;
            this.setVolume(this.currentVolume);
            const icon = document.getElementById('volume-icon');
            if (icon) {
                if (this.isMuted) {
                    icon.innerHTML = `<line x1="1" y1="1" x2="23" y2="23"></line><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>`;
                } else {
                    icon.innerHTML = `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>`;
                }
            }
        }
    }

    const audioEngine = new AmbientAudioEngine();

    // ==========================================
    // 4. CAPTURED MOMENTS (3D FLIP & LIGHTBOX)
    // ==========================================
    const polaroidCards = document.querySelectorAll('.polaroid-card:not(.quote-polaroid-card)');
    polaroidCards.forEach(card => {
        // Toggle 3D Flip on card click
        card.addEventListener('click', (e) => {
            // Ignore if clicking the zoom button
            if (e.target.closest('.btn-lightbox-zoom')) return;
            card.classList.toggle('flipped');
        });

        // Accessible Keyboard Flip
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                card.classList.toggle('flipped');
            }
        });
    });

    // Lightbox Modal Handling
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    function openLightbox(src, caption) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxCaption.textContent = caption || '';
        lightboxModal.removeAttribute('hidden');
        requestAnimationFrame(() => {
            lightboxModal.classList.add('active');
        });
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove('active');
        setTimeout(() => {
            lightboxModal.setAttribute('hidden', '');
            lightboxImg.src = '';
        }, 300);
    }

    const zoomBtns = document.querySelectorAll('.btn-lightbox-zoom');
    zoomBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imgUrl = btn.getAttribute('data-img');
            const caption = btn.getAttribute('data-caption');
            openLightbox(imgUrl, caption);
        });
    });

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
            closeLightbox();
        }
    });

    // ==========================================
    // 5. WHY I LOVE YOU (CAROUSEL SYSTEM)
    // ==========================================
    const sweetReasons = [
        "I love you because tumhari presence hi enough hoti hai.",
        "Your random texts always make me smile unexpectedly.",
        "Every time I see you, I fall in love all over again.",
        "I love how we can talk for hours and never get bored.",
        "You make every ordinary moment feel so incredibly special.",
        "You are my safe place, my home, and my favorite adventure."
    ];

    let currentReasonIndex = 0;
    const loveQuote = document.getElementById('love-quote');
    const reasonCard = document.getElementById('reason-card');
    const reasonsCounter = document.getElementById('reasons-counter');
    const prevReasonBtn = document.getElementById('prev-reason-btn');
    const nextReasonBtn = document.getElementById('next-reason-btn');
    const feelLovedBtn = document.getElementById('feel-loved-btn');

    function showReason(index) {
        if (!loveQuote || !reasonCard) return;

        reasonCard.classList.add('fade-out');

        setTimeout(() => {
            currentReasonIndex = (index + sweetReasons.length) % sweetReasons.length;
            loveQuote.innerHTML = `&ldquo;${sweetReasons[currentReasonIndex]}&rdquo;`;

            if (reasonsCounter) {
                const formattedNum = String(currentReasonIndex + 1).padStart(2, '0');
                reasonsCounter.textContent = `REASON ${formattedNum} / 06`;
            }

            reasonCard.classList.remove('fade-out');
        }, 300);
    }

    if (prevReasonBtn) {
        prevReasonBtn.addEventListener('click', () => showReason(currentReasonIndex - 1));
    }

    if (nextReasonBtn) {
        nextReasonBtn.addEventListener('click', () => showReason(currentReasonIndex + 1));
    }

    if (feelLovedBtn) {
        feelLovedBtn.addEventListener('click', () => {
            // Pick a random reason different from current
            let nextIdx = currentReasonIndex;
            while (nextIdx === currentReasonIndex) {
                nextIdx = Math.floor(Math.random() * sweetReasons.length);
            }
            showReason(nextIdx);
        });
    }

    // ==========================================
    // 6. OPEN WHEN ENVELOPES
    // ==========================================
    const envelopeItems = document.querySelectorAll('.envelope-item');
    envelopeItems.forEach(env => {
        const toggleEnvelope = () => {
            const isOpened = env.classList.contains('opened');
            env.classList.toggle('opened');
            env.setAttribute('aria-expanded', !isOpened);
        };

        env.addEventListener('click', toggleEnvelope);

        env.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleEnvelope();
            }
        });
    });

    // ==========================================
    // 7. VALENTINE QUESTION ACTIONS
    // ==========================================
    const valYesBtn = document.getElementById('val-yes-btn');
    const valNoBtn = document.getElementById('val-no-btn');
    const climaxSection = document.getElementById('section-climax');

    if (valYesBtn) {
        valYesBtn.addEventListener('click', () => {
            valYesBtn.innerHTML = `<span>Forever &amp; Always! 💕</span>`;
            if (climaxSection) {
                climaxSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (valNoBtn) {
        valNoBtn.addEventListener('mouseover', () => {
            valNoBtn.textContent = 'Yes! ❤️';
            valNoBtn.style.color = '#ffffff';
            valNoBtn.style.borderColor = 'var(--primary-rose)';
        });

        valNoBtn.addEventListener('click', () => {
            valNoBtn.textContent = 'Of course yes! 💕';
            if (climaxSection) {
                climaxSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // ==========================================
    // 8. FINAL SURPRISE (3D GIFT BOX & CLIMAX)
    // ==========================================
    const giftBox = document.getElementById('gift-box-3d');
    const giftParticlesContainer = document.getElementById('gift-particles-container');
    const finalClimaxCard = document.getElementById('final-climax-card');
    const giftTapPrompt = document.getElementById('gift-tap-prompt');
    let isGiftOpened = false;

    function burstHeartParticles() {
        if (!giftParticlesContainer) return;
        const emojis = ['💖', '💕', '✨', '❤️', '🌟', '💗'];

        for (let i = 0; i < 28; i++) {
            const particle = document.createElement('span');
            particle.classList.add('float-burst-particle');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];

            const angle = Math.random() * Math.PI * 2;
            const distance = 80 + Math.random() * 150;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance - 80;

            particle.style.setProperty('--dx', `${dx}px`);
            particle.style.setProperty('--dy', `${dy}px`);
            particle.style.left = '50%';
            particle.style.top = '50%';

            giftParticlesContainer.appendChild(particle);
            setTimeout(() => particle.remove(), 1800);
        }
    }

    function openGiftBox() {
        if (isGiftOpened) return;
        isGiftOpened = true;

        giftBox.classList.add('opened');
        burstHeartParticles();

        if (giftTapPrompt) {
            giftTapPrompt.style.opacity = '0';
        }

        // Reveal the in-page emotional climax card
        setTimeout(() => {
            if (finalClimaxCard) {
                finalClimaxCard.classList.add('revealed');
                finalClimaxCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 700);
    }

    if (giftBox) {
        giftBox.addEventListener('click', openGiftBox);
        giftBox.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openGiftBox();
            }
        });
    }

    // ==========================================
    // 9. EXPERIENCE AGAIN (COMPLETE RESET LOOP)
    // ==========================================
    const resetBtn = document.getElementById('experience-again-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            // 1. Reset Climax & Gift Box
            if (finalClimaxCard) finalClimaxCard.classList.remove('revealed');
            if (giftBox) giftBox.classList.remove('opened');
            if (giftTapPrompt) giftTapPrompt.style.opacity = '1';
            isGiftOpened = false;

            // 2. Reset All Polaroid Flips
            polaroidCards.forEach(card => card.classList.remove('flipped'));

            // 3. Reset All Envelopes
            envelopeItems.forEach(env => {
                env.classList.remove('opened');
                env.setAttribute('aria-expanded', 'false');
            });

            // 4. Reset Reasons Carousel
            showReason(0);

            // 5. Reset Passcode & Vault
            enteredCode = '';
            isVaultUnlocked = false;
            updatePasscodeDots();
            passcodeDisplay.style.borderColor = 'rgba(255, 255, 255, 0.06)';
            vaultError.classList.remove('visible');

            // 6. Reset Screen Visibility to Vault Screen
            mainScreen.style.opacity = '0';
            setTimeout(() => {
                mainScreen.classList.remove('active');
                welcomeScreen.classList.remove('active');
                vaultScreen.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });

                requestAnimationFrame(() => {
                    vaultScreen.style.opacity = '1';
                    vaultScreen.style.transform = 'scale(1)';
                });
            }, 500);
        });
    }

    // ==========================================
    // 10. STORY SCROLL-SPY & AMBIENT CANVAS
    // ==========================================
    const navDots = document.querySelectorAll('.nav-dot');
    const sections = document.querySelectorAll('.story-section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navDots.forEach(dot => {
                    if (dot.getAttribute('data-target') === id) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(s => observer.observe(s));

    navDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Ambient Stardust Canvas
    const canvas = document.getElementById('ambient-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = Array.from({ length: 45 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: 0.5 + Math.random() * 1.5,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -0.2 - Math.random() * 0.4,
            alpha: 0.2 + Math.random() * 0.6
        }));

        function renderCanvas() {
            ctx.clearRect(0, 0, width, height);

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.y < -10) p.y = height + 10;
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(247, 231, 180, ${p.alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(renderCanvas);
        }

        renderCanvas();
    }
});
