document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginMessage = document.getElementById('loginMessage');
    const registerMessage = document.getElementById('registerMessage');
    const loginSection = document.getElementById('loginSection');
    const registerSection = document.getElementById('registerSection');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    if (localStorage.getItem('user_token')) {
        window.location.href = 'dashboard.html';
    }

    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden-section'); 
        registerSection.classList.remove('hidden-section');

        loginMessage.textContent = '';
        registerMessage.textContent = '';
        
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerSection.classList.add('hidden-section');
        loginSection.classList.remove('hidden-section');

        loginMessage.textContent = '';
        registerMessage.textContent = '';
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        loginMessage.textContent = 'Autenticando...';
        loginMessage.className = 'message';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('user_token', JSON.stringify(data.user)); 
                loginMessage.textContent = 'Login realizado! Redirecionando...';
                loginMessage.className = 'message success';
                window.location.href = 'dashboard.html';
            } else {
                loginMessage.textContent = data.error || 'Erro no login.';
                loginMessage.className = 'message error';
            }
        } catch (error) {
            loginMessage.textContent = 'Erro de conexão com o servidor.';
            loginMessage.className = 'message error';
            console.error(error);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        registerMessage.textContent = 'Cadastrando...';
        registerMessage.className = 'message';

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                registerMessage.textContent = 'Usuário cadastrado! Por favor, faça o login.';
                registerMessage.className = 'message success';
                registerForm.reset();   
                document.getElementById('showLogin').click(); 
            } else {
                registerMessage.textContent = data.error || 'Erro no cadastro.';
                registerMessage.className = 'message error';
            }
        } catch (error) {
            registerMessage.textContent = 'Erro de conexão com o servidor.';
            registerMessage.className = 'message error';
            console.error(error);
        }
    });
});