// app.js - Main Application Logic (with Undo/Reverse button integration)

let drawingEngine;
let calendarManager;

document.addEventListener('DOMContentLoaded', () => {
    if (!AuthService.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    const user = AuthService.getCurrentUser();
    document.getElementById('username-display').textContent = `Welcome, ${user.username}!`;
    drawingEngine = new DrawingEngine(document.getElementById('whiteboard-canvas'));
    calendarManager = new CalendarManager();
    setupToolbar();
    setupTabs();
    setupModals();
    document.getElementById('logout-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            AuthService.logout();
        }
    });
    // Setup undo/reverse button
    const undoBtn = document.getElementById('undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => {
        drawingEngine.undo();
    });
});
function setupToolbar() {
    document.getElementById('pen-tool').addEventListener('click', () => {
        setActiveTool('pen');
        drawingEngine.setTool('pen');
    });
    document.getElementById('eraser-tool').addEventListener('click', () => {
        setActiveTool('eraser');
        drawingEngine.setTool('eraser');
    });
    document.getElementById('text-tool').addEventListener('click', () => {
        setActiveTool('text');
        drawingEngine.setTool('text');
    });
    document.getElementById('color-picker').addEventListener('change', (e) => {
        drawingEngine.setColor(e.target.value);
    });
    document.getElementById('stroke-width').addEventListener('input', (e) => {
        document.getElementById('width-display').textContent = e.target.value;
        drawingEngine.setWidth(parseInt(e.target.value));
    });
    document.getElementById('clear-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            drawingEngine.clearCanvas();
        }
    });
    document.getElementById('save-btn').addEventListener('click', () => {
        document.getElementById('save-modal').classList.add('active');
    });
    document.getElementById('load-btn').addEventListener('click', () => {
        loadWhiteboardList();
        document.getElementById('load-modal').classList.add('active');
    });
}
function setActiveTool(tool) {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`${tool}-tool`).classList.add('active');
}
function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
            if (tabName === 'calendar') {
                calendarManager.renderCalendar();
                calendarManager.renderScheduleList();
            }
        });
    });
}
function setupModals() {
    document.getElementById('confirm-save').addEventListener('click', () => {
        const title = document.getElementById('whiteboard-title').value.trim();
        if (!title) {
            alert('Please enter a title');
            return;
        }
        const user = AuthService.getCurrentUser();
        const whiteboard = {
            id: Utils.generateUUID(),
            userId: user.id,
            title,
            canvasState: drawingEngine.getCanvasState(),
            createdAt: new Date().toISOString()
        };
        DatabaseManager.saveWhiteboard(whiteboard);
        document.getElementById('save-modal').classList.remove('active');
        document.getElementById('whiteboard-title').value = '';
        alert('Whiteboard saved successfully!');
    });
    document.getElementById('cancel-save').addEventListener('click', () => {
        document.getElementById('save-modal').classList.remove('active');
        document.getElementById('whiteboard-title').value = '';
    });
    document.getElementById('cancel-load').addEventListener('click', () => {
        document.getElementById('load-modal').classList.remove('active');
    });
}
function loadWhiteboardList() {
    const user = AuthService.getCurrentUser();
    const whiteboards = DatabaseManager.getWhiteboards(user.id);
    const list = document.getElementById('whiteboard-list');
    list.innerHTML = '';
    if (whiteboards.length === 0) {
        list.innerHTML = '<li style="padding: 1rem; text-align: center; color: #7f8c8d;">No saved whiteboards</li>';
        return;
    }
    whiteboards.forEach(wb => {
        const li = document.createElement('li');
        const info = document.createElement('div');
        info.textContent = wb.title;
        info.style.flex = '1';
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-primary btn-sm';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
            drawingEngine.loadCanvasState(wb.canvasState);
            document.getElementById('load-modal').classList.remove('active');
        });
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-warning btn-sm';
        deleteBtn.textContent = 'Delete';
        deleteBtn.style.marginLeft = '0.5rem';
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Delete "${wb.title}"?`)) {
                DatabaseManager.deleteWhiteboard(wb.id);
                loadWhiteboardList();
            }
        });
        li.appendChild(info);
        li.appendChild(loadBtn);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
}
