let expenseIndex = 0;

function addExpense() {
    const container = document.createElement('div');
    container.className = 'row g-2 mb-2 align-items-end expense-entry';
    container.dataset.index = expenseIndex;

    container.innerHTML = `
                <div class="row g-2 mb-2 align-items-end">
                    <div class="col-md-3">
                        <input type="text" name="item" class="form-control" placeholder="Item" required>
                    </div>
                    <div class="col-md-2">
                        <input type="number" name="quantity" class="form-control" placeholder="Qty" min="1" required>
                    </div>
                    <div class="col-md-2">
                        <input type="number" name="cost" class="form-control" placeholder="Cost" step="0.01" required>
                    </div>
                    <div class="col-md-3">
                        <select name="frequency" class="form-select" required>
                            <option value="">Frequency</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button type="button" class="btn btn-danger w-100 remove-btn">Remove</button>
                    </div>
                </div>

            `;

    container.querySelector('.remove-btn').addEventListener('click', function () {
        this.closest('.expense-entry').remove();
        updateRemoveButtons();
    });

    document.getElementById('expenses').appendChild(container);
    expenseIndex++;
    updateRemoveButtons();
}

function updateRemoveButtons() {
    const entries = document.querySelectorAll('.expense-entry');
    const removeButtons = document.querySelectorAll('.remove-btn');

    if (entries.length <= 1) {
        removeButtons.forEach(btn => btn.style.display = 'none');
    } else {
        removeButtons.forEach(btn => btn.style.display = 'inline-block');
    }
}

document.getElementById('reportForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const scope = document.getElementById('scope').value;
    const expenses = Array.from(document.querySelectorAll('#expenses .row')).map(row => {
        return {
            item: row.querySelector('[name="item"]').value,
            quantity: parseFloat(row.querySelector('[name="quantity"]').value),
            cost: parseFloat(row.querySelector('[name="cost"]').value),
            frequency: row.querySelector('[name="frequency"]').value
        };
    });

    const response = await fetch('/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, expenses })
    });

    const result = await response.json();
    document.getElementById('output').textContent = JSON.stringify(result, null, 2);
});

addExpense();