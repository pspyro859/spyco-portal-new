// Spyco Portal JavaScript Application

// Configuration
const API_BASE = '/api';
let currentPage = 1;
let itemsPerPage = 10;
let csrfToken = '';

// Initialize application - Check authentication on load
checkAuthentication();

// Authentication Functions
function checkAuthentication() {
    fetch(`${API_BASE}/auth/check`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.authenticated) {
                csrfToken = data.csrf_token;
                loadSuppliers();
                loadDashboardStats();
            }
        })
        .catch(error => console.error('Auth check failed:', error));
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    
    fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            csrfToken = data.csrf_token;
            window.location.reload();
        } else {
            errorDiv.textContent = data.message;
            errorDiv.classList.add('show');
            setTimeout(() => errorDiv.classList.remove('show'), 5000);
        }
    })
    .catch(error => {
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.classList.add('show');
    });
}

function logout() {
    fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.reload();
        }
    })
    .catch(error => console.error('Logout failed:', error));
}

// Supplier Functions
function loadSuppliers(page = 1, search = '') {
    const url = `${API_BASE}/suppliers/?page=${page}&limit=${itemsPerPage}${search ? '&search=' + encodeURIComponent(search) : ''}`;
    
    fetch(url, {
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displaySuppliers(data.data);
            displayPagination(data.pagination);
            currentPage = page;
        }
    })
    .catch(error => {
        console.error('Failed to load suppliers:', error);
        showError('Failed to load suppliers');
    });
}

function displaySuppliers(suppliers) {
    const tbody = document.getElementById('suppliers-tbody');
    
    if (suppliers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No suppliers found</td></tr>';
        return;
    }
    
    tbody.innerHTML = suppliers.map(supplier => `
        <tr>
            <td><strong>${escapeHtml(supplier.code)}</strong></td>
            <td>${escapeHtml(supplier.category || 'General')}</td>
            <td>${escapeHtml(supplier.name)}</td>
            <td>${escapeHtml(supplier.contact_person)}</td>
            <td>${escapeHtml(supplier.email)}</td>
            <td>${escapeHtml(supplier.phone)}</td>
            <td><span class="status-badge ${supplier.status}">${supplier.status}</span></td>
            <td>
                <button class="action-btn edit" onclick="editSupplier(${supplier.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deleteSupplier(${supplier.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function displayPagination(pagination) {
    const paginationDiv = document.getElementById('pagination');
    
    if (pagination.total_pages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Previous button
    html += `<button onclick="loadSuppliers(${pagination.page - 1})" ${pagination.page === 1 ? 'disabled' : ''}>Previous</button>`;
    
    // Page numbers
    for (let i = 1; i <= pagination.total_pages; i++) {
        html += `<button onclick="loadSuppliers(${i})" ${pagination.page === i ? 'class="active"' : ''}>${i}</button>`;
    }
    
    // Next button
    html += `<button onclick="loadSuppliers(${pagination.page + 1})" ${pagination.page === pagination.total_pages ? 'disabled' : ''}>Next</button>`;
    
    paginationDiv.innerHTML = html;
}

function searchSuppliers() {
    const searchTerm = document.getElementById('search-input').value;
    loadSuppliers(1, searchTerm);
}

function openModal(supplierId = null) {
    const modal = document.getElementById('supplier-modal');
    const form = document.getElementById('supplier-form');
    const title = document.getElementById('modal-title');
    
    form.reset();
    document.getElementById('supplier-id').value = '';
    
    // Load categories
    loadCategories();
    
    if (supplierId) {
        title.textContent = 'Edit Supplier';
        // Load supplier data
        fetch(`${API_BASE}/suppliers/${supplierId}`, {
            headers: {
                'X-CSRF-Token': csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('supplier-id').value = data.data.id;
                document.getElementById('supplier-code').value = data.data.code || '';
                document.getElementById('supplier-name').value = data.data.name;
                document.getElementById('supplier-category').value = data.data.category || 'General';
                document.getElementById('contact-person').value = data.data.contact_person;
                document.getElementById('supplier-email').value = data.data.email;
                document.getElementById('supplier-phone').value = data.data.phone;
                document.getElementById('supplier-address').value = data.data.address || '';
            }
        });
    } else {
        title.textContent = 'Add Supplier';
    }
    
    modal.classList.add('show');
}

function loadCategories() {
    fetch(`${API_BASE}/suppliers/categories`, {
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const select = document.getElementById('supplier-category');
            select.innerHTML = '<option value="">Select Category</option>';
            
            // Add common categories first
            const commonCategories = ['General', 'Electronics', 'Materials', 'Services', 'Software', 'Hardware'];
            commonCategories.forEach(cat => {
                select.innerHTML += `<option value="${cat}">${cat}</option>`;
            });
            
            // Add existing categories
            data.data.forEach(cat => {
                if (!commonCategories.includes(cat)) {
                    select.innerHTML += `<option value="${cat}">${cat}</option>`;
                }
            });
        }
    })
    .catch(error => console.error('Failed to load categories:', error));
}

// Auto-generate code based on supplier name - Set up when page loads
function setupCodeGeneration() {
    const nameInput = document.getElementById('supplier-name');
    const codeInput = document.getElementById('supplier-code');
    
    if (nameInput && codeInput) {
        nameInput.addEventListener('input', function() {
            // Only auto-generate if code field is empty or not manually edited
            if (!codeInput.dataset.manuallyEdited) {
                const name = this.value;
                if (name.length > 0) {
                    const code = generateCodeFromName(name);
                    codeInput.value = code;
                } else {
                    codeInput.value = '';
                }
            }
        });
        
        // Mark code as manually edited when user types in it
        codeInput.addEventListener('input', function() {
            this.dataset.manuallyEdited = 'true';
        });
    }
}

// Call setup when page loads
setupCodeGeneration();

// Generate code from name (XXXX-X format)
function generateCodeFromName(name) {
    // Clean name - keep only letters
    const cleanName = name.replace(/[^a-zA-Z]/g, '');
    
    // Get first 4 letters, uppercase
    let prefix = cleanName.substring(0, 4).toUpperCase();
    
    // Pad with 'X' if needed
    while (prefix.length < 4) {
        prefix += 'X';
    }
    
    // Use 1 as placeholder number (actual number will be assigned on server)
    return `${prefix}-1`;
}

// Validate code format
function validateCodeFormat() {
    const codeInput = document.getElementById('supplier-code');
    const code = codeInput.value;
    const formatRegex = /^[A-Z]{4}-\d+$/;
    
    if (code && !formatRegex.test(code)) {
        codeInput.style.borderColor = '#ff6b6b';
        showWarning('Code format should be XXXX-X (e.g., TECH-1)');
    } else {
        codeInput.style.borderColor = '';
    }
}

function showWarning(message) {
    alert('Warning: ' + message);
}

function closeModal() {
    document.getElementById('supplier-modal').classList.remove('show');
}

function saveSupplier(event) {
    event.preventDefault();
    
    const supplierId = document.getElementById('supplier-id').value;
    const supplierCode = document.getElementById('supplier-code').value;
    
    const formData = {
        name: document.getElementById('supplier-name').value,
        category: document.getElementById('supplier-category').value,
        contact_person: document.getElementById('contact-person').value,
        email: document.getElementById('supplier-email').value,
        phone: document.getElementById('supplier-phone').value,
        address: document.getElementById('supplier-address').value
    };
    
    // Only include code if it's provided (for editing existing suppliers)
    if (supplierCode && supplierId) {
        formData.code = supplierCode;
    }
    
    const url = supplierId ? `${API_BASE}/suppliers/${supplierId}` : `${API_BASE}/suppliers/`;
    const method = supplierId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            loadSuppliers(currentPage);
            showSuccess(data.message);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        console.error('Failed to save supplier:', error);
        showError('Failed to save supplier');
    });
}

function editSupplier(id) {
    openModal(id);
}

function deleteSupplier(id) {
    if (!confirm('Are you sure you want to delete this supplier?')) {
        return;
    }
    
    fetch(`${API_BASE}/suppliers/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadSuppliers(currentPage);
            showSuccess('Supplier deleted successfully');
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        console.error('Failed to delete supplier:', error);
        showError('Failed to delete supplier');
    });
}

// Dashboard Functions
function loadDashboardStats() {
    // Load suppliers count
    fetch(`${API_BASE}/suppliers/?limit=1`, {
        headers: {
            'X-CSRF-Token': csrfToken
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.pagination) {
            document.getElementById('total-suppliers').textContent = data.pagination.total;
        }
    });
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccess(message) {
    alert('Success: ' + message);
}

function showError(message) {
    alert('Error: ' + message);
}

function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.sidebar nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }
    
    // Add active class to clicked link
    event.target.closest('a').classList.add('active');
}