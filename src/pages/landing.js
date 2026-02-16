// ============================================
// Landing Page — The Gatekeeper
// ============================================
// This is the first page users see.
// It asks for a password to keep random people out.

/**
 * Render the Landing Page
 * @param {Function} onLoginSuccess - Called when password is correct
 */
export function renderLanding(onLoginSuccess) {
    const app = document.getElementById('app');

    // Clear previous content
    app.innerHTML = '';

    // Create container
    const container = document.createElement('div');
    container.className = 'landing-container fade-in';

    // Build HTML content
    container.innerHTML = `
        <div class="glass-card auth-box">
            <div class="logo-emoji">🎙️</div>
            <h1>Yaha Baat Karo</h1>
            <p>Private Group Voice Chat</p>
            
            <form id="login-form">
                <input type="password" id="password-input" placeholder="Enter Password" required />
                <button type="submit" class="btn">Enter App</button>
            </form>
            <p id="error-msg" style="color: var(--error); display: none; margin-top: 10px;"></p>
        </div>
    `;

    app.appendChild(container);

    // Handle form submission
    const form = document.getElementById('login-form');
    const input = document.getElementById('password-input');
    const errorMsg = document.getElementById('error-msg');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const password = input.value.trim();

        // Hardcoded password check (simple & effective)
        if (password === 'jeetdalla') {
            // Save session so they don't have to login again if they refresh
            sessionStorage.setItem('ybk_authenticated', 'true');
            onLoginSuccess();
        } else {
            // Shake animation for error
            const card = document.querySelector('.glass-card');
            card.animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 300 });

            errorMsg.textContent = 'Incorrect password!';
            errorMsg.style.display = 'block';
            input.value = '';
        }
    });

    // Auto-focus input
    input.focus();
}
