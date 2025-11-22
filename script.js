// Creative Iterations Blog JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Iteration counter functionality
    let currentIteration = 1;
    const iterationDisplay = document.getElementById('iteration-count');
    const iterateBtn = document.getElementById('iterate-btn');
    
    iterateBtn.addEventListener('click', function() {
        currentIteration++;
        iterationDisplay.textContent = `Version ${currentIteration}.0`;
        
        // Add a little animation
        iterationDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            iterationDisplay.style.transform = 'scale(1)';
        }, 200);
        
        // Show a creative message
        const messages = [
            "Another iteration closer to perfection!",
            "Evolution in progress...",
            "Building on the previous version!",
            "Creativity through repetition!",
            "Every iteration teaches us something new!",
            "Progress, not perfection!",
            "The beauty of endless possibility!"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        showNotification(randomMessage);
    });
    
    // Like button functionality
    const likeBtn = document.getElementById('like-btn');
    let isLiked = false;
    let likeCount = Math.floor(Math.random() * 50) + 10; // Random initial likes
    
    likeBtn.addEventListener('click', function() {
        if (!isLiked) {
            likeCount++;
            likeBtn.textContent = `❤️ Liked (${likeCount})`;
            likeBtn.style.background = '#ffebef';
            likeBtn.style.color = '#c53030';
            isLiked = true;
            showNotification("Thanks for the like! ❤️");
        } else {
            likeCount--;
            likeBtn.textContent = `👍 Like`;
            likeBtn.style.background = '#e8f5e8';
            likeBtn.style.color = '#2d5a3d';
            isLiked = false;
        }
    });
    
    // Share button functionality
    const shareBtn = document.getElementById('share-btn');
    
    shareBtn.addEventListener('click', function() {
        if (navigator.share) {
            navigator.share({
                title: 'Creative Iterations - How Computers Let Me Create',
                text: 'Check out this blog post about how computers enable endless creative possibilities through iteration!',
                url: window.location.href
            }).then(() => {
                showNotification('Thanks for sharing!');
            }).catch((error) => {
                console.log('Error sharing:', error);
                fallbackShare();
            });
        } else {
            fallbackShare();
        }
    });
    
    function fallbackShare() {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            showNotification('URL copied to clipboard!');
        }).catch(() => {
            // Final fallback - show URL in alert
            alert(`Share this URL: ${url}`);
        });
    }
    
    // Recent thoughts interactivity
    const thoughtItems = document.querySelectorAll('.recent-thoughts li');
    thoughtItems.forEach(item => {
        item.addEventListener('click', function() {
            const thoughts = [
                "Sometimes the most beautiful art comes from computational accidents and unexpected behaviors.",
                "Constraints in coding are like haikus in poetry - they force creativity through limitation.",
                "Digital art isn't just made on computers; it lives and breathes through them, constantly evolving.",
                "Code is poetry where logic and creativity dance together in perfect harmony."
            ];
            
            const randomThought = thoughts[Math.floor(Math.random() * thoughts.length)];
            showNotification(randomThought, 4000);
        });
    });
    
    // Notification system
    function showNotification(message, duration = 3000) {
        // Remove any existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            zIndex: '1000',
            maxWidth: '300px',
            fontSize: '0.9rem',
            lineHeight: '1.4',
            animation: 'slideInRight 0.3s ease-out'
        });
        
        document.body.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }
    
    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Easter egg: Konami code for special iteration
    let konamiSequence = [];
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiSequence.push(e.code);
        
        if (konamiSequence.length > konamiCode.length) {
            konamiSequence.shift();
        }
        
        if (konamiSequence.length === konamiCode.length &&
            konamiSequence.every((code, index) => code === konamiCode[index])) {
            
            currentIteration = 100;
            iterationDisplay.textContent = `Version ${currentIteration}.0 - INFINITE MODE!`;
            showNotification("🎉 Infinite iterations unlocked! You've discovered the secret of computational creativity!", 5000);
            
            // Add some visual flair
            document.body.style.background = 'linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c)';
            document.body.style.backgroundSize = '400% 400%';
            document.body.style.animation = 'gradientShift 4s ease infinite';
            
            const gradientStyle = document.createElement('style');
            gradientStyle.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(gradientStyle);
            
            konamiSequence = []; // Reset
        }
    });
    
    // Smooth scroll for any anchor links (if added later)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Welcome message
    setTimeout(() => {
        showNotification("Welcome to Creative Iterations! Click around to explore the interactive elements.", 4000);
    }, 1000);
});