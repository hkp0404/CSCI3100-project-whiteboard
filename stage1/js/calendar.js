// calendar.js - Calendar Functionality

class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.schedules = [];
        this.init();
    }
    
    init() {
        const user = AuthService.getCurrentUser();
        if (user) {
            this.schedules = DatabaseManager.getSchedules(user.id);
        }
        this.renderCalendar();
        this.renderScheduleList();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        document.getElementById('prev-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('next-month').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        document.getElementById('add-event-btn').addEventListener('click', () => this.showEventModal());
        document.getElementById('save-event').addEventListener('click', () => this.saveEvent());
        document.getElementById('cancel-event').addEventListener('click', () => this.hideEventModal());
    }
    
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';
        const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'calendar-day-header';
            header.textContent = day;
            grid.appendChild(header);
        });
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = daysInPrevMonth - i;
            grid.appendChild(day);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day';
            const dayNum = document.createElement('div');
            dayNum.className = 'calendar-day-number';
            dayNum.textContent = i;
            day.appendChild(dayNum);
            const dateStr = Utils.formatDate(new Date(year, month, i));
            const dayEvents = this.schedules.filter(s => s.date === dateStr);
            if (dayEvents.length > 0) day.classList.add('has-event');
            grid.appendChild(day);
        }
        const totalCells = grid.children.length - 7;
        const remainingCells = 35 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const day = document.createElement('div');
            day.className = 'calendar-day other-month';
            day.textContent = i;
            grid.appendChild(day);
        }
    }
    
    renderScheduleList() {
        const list = document.getElementById('event-list');
        list.innerHTML = '';
        const sortedSchedules = [...this.schedules].sort((a, b) => new Date(a.date + ' ' + a.startTime) - new Date(b.date + ' ' + b.startTime));
        sortedSchedules.forEach(schedule => {
            const li = document.createElement('li');
            const info = document.createElement('div');
            info.className = 'event-info';
            const title = document.createElement('div');
            title.className = 'event-title';
            title.textContent = schedule.title;
            const time = document.createElement('div');
            time.className = 'event-time';
            time.textContent = `${schedule.date} ${schedule.startTime} - ${schedule.endTime}`;
            info.appendChild(title);
            info.appendChild(time);
            const actions = document.createElement('div');
            actions.className = 'event-actions';
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-warning btn-sm';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => this.deleteEvent(schedule.id));
            actions.appendChild(deleteBtn);
            li.appendChild(info);
            li.appendChild(actions);
            list.appendChild(li);
        });
    }
    
    showEventModal() {
        document.getElementById('event-title').value = '';
        document.getElementById('event-description').value = '';
        document.getElementById('event-date').value = '';
        document.getElementById('event-start-time').value = '';
        document.getElementById('event-end-time').value = '';
        document.getElementById('event-modal').classList.add('active');
    }
    
    hideEventModal() {
        document.getElementById('event-modal').classList.remove('active');
    }
    
    saveEvent() {
        const title = document.getElementById('event-title').value.trim();
        const description = document.getElementById('event-description').value.trim();
        const date = document.getElementById('event-date').value;
        const startTime = document.getElementById('event-start-time').value;
        const endTime = document.getElementById('event-end-time').value;
        if (!title || !date || !startTime || !endTime) {
            alert('Please fill in all required fields');
            return;
        }
        const user = AuthService.getCurrentUser();
        const schedule = {
            id: Utils.generateUUID(),
            userId: user.id,
            title,
            description,
            date,
            startTime,
            endTime,
            createdAt: new Date().toISOString()
        };
        DatabaseManager.saveSchedule(schedule);
        this.schedules.push(schedule);
        this.hideEventModal();
        this.renderCalendar();
        this.renderScheduleList();
    }
    
    deleteEvent(id) {
        if (confirm('Are you sure you want to delete this event?')) {
            DatabaseManager.deleteSchedule(id);
            this.schedules = this.schedules.filter(s => s.id !== id);
            this.renderCalendar();
            this.renderScheduleList();
        }
    }
}
