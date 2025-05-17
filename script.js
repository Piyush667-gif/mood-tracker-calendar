const calendarContainer = document.getElementById('calendar-container');
const currentMonthElement = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const dayModal = document.getElementById('day-modal');
const modalDate = document.getElementById('modal-date');
const moodNotes = document.getElementById('mood-notes');
const saveMoodButton = document.getElementById('save-mood');
const closeModal = document.querySelector('.close-modal');
const emojiButtons = document.querySelectorAll('.emoji-btn');
const modalEmojiButtons = document.querySelectorAll('.modal-emoji-buttons .emoji-btn');


let currentDate = new Date();
let selectedDate = null;
let selectedMood = null;
let moodData = JSON.parse(localStorage.getItem('moodData')) || {};

initFloatingIcons();

//  calendar(it help to under stand to judges )
renderCalendar(currentDate);
updateStats();

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(currentDate);
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(currentDate);
});

emojiButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mood = button.getAttribute('data-mood');
        const color = button.getAttribute('data-color');
        
        emojiButtons.forEach(btn => btn.classList.remove('selected'));
        
       
        button.classList.add('selected');
        
        
        const today = new Date();
        const dateKey = formatDateKey(today);
        
        moodData[dateKey] = {
            mood: mood,
            color: color,
            date: today.toISOString(),
            notes: moodData[dateKey]?.notes || ''
        };
        
        localStorage.setItem('moodData', JSON.stringify(moodData));
        
       
        renderCalendar(currentDate);
        updateStats();
        
        animateEmojiButton(button);
    });
});

modalEmojiButtons.forEach(button => {
    button.addEventListener('click', () => {
        const mood = button.getAttribute('data-mood');
        
        
        modalEmojiButtons.forEach(btn => btn.classList.remove('selected'));
        
        
        button.classList.add('selected');
        
        // Store selected mood for easing to judge 
        selectedMood = {
            mood: mood,
            color: button.getAttribute('data-color')
        };
    });
});

saveMoodButton.addEventListener('click', () => {
    if (selectedDate && selectedMood) {
        const dateKey = formatDateKey(selectedDate);
        
        moodData[dateKey] = {
            mood: selectedMood.mood,
            color: selectedMood.color,
            date: selectedDate.toISOString(),
            notes: moodNotes.value
        };
        
        localStorage.setItem('moodData', JSON.stringify(moodData));
    
        renderCalendar(currentDate);
        updateStats();
        
        
        closeModal.click();
    }
});

closeModal.addEventListener('click', () => {
    dayModal.style.display = 'none';
});


window.addEventListener('click', (event) => {
    if (event.target === dayModal) {
        dayModal.style.display = 'none';
    }
});


function renderCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    
    currentMonthElement.textContent = `${new Date(year, month, 1).toLocaleString('default', { month: 'long' })} ${year}`;
    
  
    calendarContainer.innerHTML = '';
    
    
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    daysOfWeek.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-header';
        dayHeader.textContent = day;
        calendarContainer.appendChild(dayHeader);
    });
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
  
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const dayDate = new Date(year, month - 1, day);
        addDayToCalendar(dayDate, true);
    }
    
    
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
        const dayDate = new Date(year, month, day);
        addDayToCalendar(dayDate, false);
    }
    
    
    const daysAdded = firstDayOfWeek + lastDayOfMonth.getDate();
    const remainingCells = 42 - daysAdded; // 6 rows of 7 days
    
    for (let day = 1; day <= remainingCells; day++) {
        const dayDate = new Date(year, month + 1, day);
        addDayToCalendar(dayDate, true);
    }
}

function addDayToCalendar(date, isOtherMonth) {
    const day = date.getDate();
    const dateKey = formatDateKey(date);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    const dayElement = document.createElement('div');
    dayElement.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`;
    
   
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    
    
    if (moodData[dateKey]) {
        dayElement.classList.add('has-mood');
        dayElement.style.backgroundColor = moodData[dateKey].color;
        
        
        const dayEmoji = document.createElement('span');
        dayEmoji.className = 'day-emoji';
        
        switch (moodData[dateKey].mood) {
            case 'happy':
                dayEmoji.textContent = '😊';
                break;
            case 'sad':
                dayEmoji.textContent = '😢';
                break;
            case 'angry':
                dayEmoji.textContent = '😡';
                break;
            case 'tired':
                dayEmoji.textContent = '😴';
                break;
            case 'excited':
                dayEmoji.textContent = '🥳';
                break;
            case 'cool':
                dayEmoji.textContent = '😎';
                break;
        }
        
        dayElement.appendChild(dayEmoji);
    }
    
    dayElement.addEventListener('click', () => {
        openDayModal(date);
    });
    
    calendarContainer.appendChild(dayElement);
}

function openDayModal(date) {
    selectedDate = date;
    const dateKey = formatDateKey(date);
    
    
    modalDate.textContent = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    
    selectedMood = null;
    modalEmojiButtons.forEach(btn => btn.classList.remove('selected'));
    
    
    moodNotes.value = moodData[dateKey]?.notes || '';
    
    
    if (moodData[dateKey]) {
        const moodButton = document.querySelector(`.modal-emoji-buttons .emoji-btn[data-mood="${moodData[dateKey].mood}"]`);
        if (moodButton) {
            moodButton.classList.add('selected');
            selectedMood = {
                mood: moodData[dateKey].mood,
                color: moodData[dateKey].color
            };
        }
    }
    
    
    dayModal.style.display = 'flex';
}

function formatDateKey(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function updateStats() {
 
    const counts = {
        happy: 0,
        sad: 0,
        angry: 0,
        tired: 0,
        excited: 0,
        cool: 0
    };
    
    Object.values(moodData).forEach(data => {
        if (counts[data.mood] !== undefined) {
            counts[data.mood]++;
        }
    });
    
    
    for (const mood in counts) {
        const countElement = document.getElementById(`${mood}-count`);
        if (countElement) {
            countElement.textContent = counts[mood];
        }
    }
}

function animateEmojiButton(button) {
    button.querySelector('.emoji').style.animation = 'none';
    setTimeout(() => {
        button.querySelector('.emoji').style.animation = 'bounce 0.5s infinite alternate';
    }, 10);
}

function initFloatingIcons() {
    const floatingIcons = document.querySelectorAll('.floating-icon');
    
    floatingIcons.forEach(icon => {
        
        const randomX = Math.random() * 100;
        icon.style.left = `${randomX}%`;
        
       
        const randomDelay = Math.random() * 20;
        icon.style.animationDelay = `${randomDelay}s`;
        
        const randomDuration = 15 + Math.random() * 15;
        icon.style.animationDuration = `${randomDuration}s`;
    });
    
    
    const backgroundAnimation = document.querySelector('.background-animation');
    const emojis = ['😊', '😢', '😡', '😴', '🥳', '😎', '❤️', '✨', '🌈', '☁️'];
    
    for (let i = 0; i < 20; i++) {
        const icon = document.createElement('div');
        icon.className = 'floating-icon';
        
      
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        icon.textContent = randomEmoji;
        
      
        const randomX = Math.random() * 100;
        icon.style.left = `${randomX}%`;
        
      
        const randomDelay = Math.random() * 20;
        icon.style.animationDelay = `${randomDelay}s`;
        
        
        const randomDuration = 15 + Math.random() * 15;
        icon.style.animationDuration = `${randomDuration}s`;
        
        backgroundAnimation.appendChild(icon);
    }
}