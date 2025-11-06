document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificação de Autenticação e Configuração Inicial
    const user = JSON.parse(localStorage.getItem('user_token'));
    if (!user) {
        window.location.href = 'index.html'; // Redireciona se não estiver logado
        return;
    }
    document.getElementById('usernameDisplay').textContent = user.username;

    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('user_token');
        window.location.href = 'index.html';
    });

    // Lógica de Alternância de Seção (Menu Sidebar)
    const menuItems = document.querySelectorAll('.menu-item');
    const crudSections = document.querySelectorAll('.crud-section');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            crudSections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });

            // Recarrega a lista da seção ativa ao clicar
            if (targetId === 'products-crud') loadProducts();
            if (targetId === 'clients-crud') loadClients();
        });
    });

    // --- FUNÇÕES CRUD GENÉRICAS ---

    // Função para carregar e renderizar dados na tabela
    async function loadData(endpoint, tableBodyId, renderRowFn) {
        try {
            const response = await fetch(endpoint);
            const data = await response.json();
            const tableBody = document.querySelector(`#${tableBodyId} tbody`);
            tableBody.innerHTML = ''; // Limpa a tabela

            if (data.length > 0) {
                data.forEach(item => {
                    tableBody.appendChild(renderRowFn(item));
                });
            } else {
                tableBody.innerHTML = '<tr><td colspan="4">Nenhum registro encontrado.</td></tr>';
            }
        } catch (error) {
            console.error(`Erro ao carregar dados de ${endpoint}:`, error);
        }
    }

    // Função para deletar um item
    async function deleteItem(endpoint, id, reloadFn) {
        if (!confirm('Tem certeza que deseja deletar este item?')) return;
        try {
            const response = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                alert('Item deletado com sucesso!');
                reloadFn();
            } else {
                const errorData = await response.json();
                alert(`Erro ao deletar: ${errorData.error}`);
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    }

    // --- CRUD DE PRODUTOS (Rotinas Específicas) ---

    const productForm = document.getElementById('productForm');
    const productName = document.getElementById('productName');
    const productDescription = document.getElementById('productDescription');
    const productPrice = document.getElementById('productPrice');
    const productId = document.getElementById('productId');
    const productSubmitBtn = document.getElementById('productSubmitBtn');
    const productCancelBtn = document.getElementById('productCancelBtn');

    // Renderiza uma linha de Produto
    function renderProductRow(product) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>R$ ${product.price.toFixed(2)}</td>
            <td>
                <button class="edit-btn" data-id="${product.id}" data-type="product">Editar</button>
                <button class="delete-btn" data-id="${product.id}" data-type="product">Deletar</button>
            </td>
        `;
        return row;
    }

    // Carrega a lista de Produtos
    const loadProducts = () => loadData('/api/products', 'productsTable', renderProductRow);

    // Submissão do Formulário de Produto (Create/Update)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: productName.value,
            description: productDescription.value,
            price: parseFloat(productPrice.value)
        };
        const isUpdate = productId.value !== '';
        const url = isUpdate ? `/api/products/${productId.value}` : '/api/products';
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert(`Produto ${isUpdate ? 'atualizado' : 'cadastrado'} com sucesso!`);
                productForm.reset();
                productId.value = '';
                productSubmitBtn.textContent = 'Cadastrar Produto';
                productCancelBtn.style.display = 'none';
                loadProducts();
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    });

    // Ações de Tabela (Editar/Deletar) para Produtos
    document.getElementById('productsTable').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteItem('/api/products', id, loadProducts);
        } else if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            try {
                const response = await fetch(`/api/products`);
                const products = await response.json();
                const product = products.find(p => p.id == id); // Encontra o produto na lista
                
                if (product) {
                    productId.value = product.id;
                    productName.value = product.name;
                    productDescription.value = product.description;
                    productPrice.value = product.price;
                    productSubmitBtn.textContent = 'Atualizar Produto';
                    productCancelBtn.style.display = 'inline-block';
                    window.scrollTo(0, 0); // Sobe para o formulário
                }
            } catch (error) {
                alert('Erro ao buscar dados do produto para edição.');
            }
        }
    });
    
    // Cancelar Edição de Produto
    productCancelBtn.addEventListener('click', () => {
        productForm.reset();
        productId.value = '';
        productSubmitBtn.textContent = 'Cadastrar Produto';
        productCancelBtn.style.display = 'none';
    });


    // --- CRUD DE CLIENTES (Rotinas Específicas) ---

    const clientForm = document.getElementById('clientForm');
    const clientName = document.getElementById('clientName');
    const clientPhone = document.getElementById('clientPhone');
    const clientEmail = document.getElementById('clientEmail');
    const clientId = document.getElementById('clientId');
    const clientSubmitBtn = document.getElementById('clientSubmitBtn');
    const clientCancelBtn = document.getElementById('clientCancelBtn');

    // Renderiza uma linha de Cliente
    function renderClientRow(client) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.id}</td>
            <td>${client.name}</td>
            <td>${client.email}</td>
            <td>
                <button class="edit-btn" data-id="${client.id}" data-type="client">Editar</button>
                <button class="delete-btn" data-id="${client.id}" data-type="client">Deletar</button>
            </td>
        `;
        return row;
    }

    // Carrega a lista de Clientes
    const loadClients = () => loadData('/api/clients', 'clientsTable', renderClientRow);

    // Submissão do Formulário de Cliente (Create/Update)
    clientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: clientName.value,
            phone: clientPhone.value,
            email: clientEmail.value
        };
        const isUpdate = clientId.value !== '';
        const url = isUpdate ? `/api/clients/${clientId.value}` : '/api/clients';
        const method = isUpdate ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert(`Cliente ${isUpdate ? 'atualizado' : 'cadastrado'} com sucesso!`);
                clientForm.reset();
                clientId.value = '';
                clientSubmitBtn.textContent = 'Cadastrar Cliente';
                clientCancelBtn.style.display = 'none';
                loadClients();
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.error}`);
            }
        } catch (error) {
            alert('Erro de conexão com o servidor.');
        }
    });

    // Ações de Tabela (Editar/Deletar) para Clientes
    document.getElementById('clientsTable').addEventListener('click', async (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.dataset.id;
            deleteItem('/api/clients', id, loadClients);
        } else if (e.target.classList.contains('edit-btn')) {
            const id = e.target.dataset.id;
            try {
                const response = await fetch(`/api/clients`);
                const clients = await response.json();
                const client = clients.find(c => c.id == id);
                
                if (client) {
                    clientId.value = client.id;
                    clientName.value = client.name;
                    clientPhone.value = client.phone;
                    clientEmail.value = client.email;
                    clientSubmitBtn.textContent = 'Atualizar Cliente';
                    clientCancelBtn.style.display = 'inline-block';
                    window.scrollTo(0, 0); 
                }
            } catch (error) {
                alert('Erro ao buscar dados do cliente para edição.');
            }
        }
    });
    
    // Cancelar Edição de Cliente
    clientCancelBtn.addEventListener('click', () => {
        clientForm.reset();
        clientId.value = '';
        clientSubmitBtn.textContent = 'Cadastrar Cliente';
        clientCancelBtn.style.display = 'none';
    });


    // Inicia carregando a primeira seção (Produtos)
    loadProducts();
});