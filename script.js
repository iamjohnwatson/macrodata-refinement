document.addEventListener('DOMContentLoaded', () => {
    // Core DOM elements
    const startScreen = document.getElementById('start-screen');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const fileSelect = document.getElementById('file-select');
    const startButton = document.getElementById('start-button');
    const infoButton = document.getElementById('info-button');
    const infoModal = document.getElementById('info-modal');
    const closeModal = document.querySelector('.close-modal');
    const appContainer = document.getElementById('app-container');
    const welcomeMessage = document.getElementById('welcome-message');
    const numberGrid = document.getElementById('number-grid');
    const message = document.getElementById('message');
    const bins = document.querySelectorAll('.bin');
    const mainProgress = document.getElementById('main-progress');
    const progressPercentage = document.getElementById('progress-percentage');
    const fileName = document.getElementById('file-name');
    const thumbsDown = document.getElementById('thumbs-down');
    const exitButton = document.getElementById('exit-button');
    const completionScreen = document.getElementById('completion-screen');
    const exitCompletionButton = document.getElementById('exit-completion');
    
    // Initialize progress elements
    const progressBars = {};
    const binProgressTexts = {};
    const temperDisplays = { wo: {}, fr: {}, dr: {}, ma: {} };
    
    for (let i = 0; i < 5; i++) {
        progressBars[i] = document.getElementById(`progress-${i}`);
        binProgressTexts[i] = document.getElementById(`bin-progress-${i}`);
        temperDisplays.wo[i] = document.getElementById(`temper-wo-${i}`);
        temperDisplays.fr[i] = document.getElementById(`temper-fr-${i}`);
        temperDisplays.dr[i] = document.getElementById(`temper-dr-${i}`);
        temperDisplays.ma[i] = document.getElementById(`temper-ma-${i}`);
    }
    
    // Game state
    const binProgress = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    const binTempers = {
        0: { wo: 0, fr: 0, dr: 0, ma: 0 },
        1: { wo: 0, fr: 0, dr: 0, ma: 0 },
        2: { wo: 0, fr: 0, dr: 0, ma: 0 },
        3: { wo: 0, fr: 0, dr: 0, ma: 0 },
        4: { wo: 0, fr: 0, dr: 0, ma: 0 }
    };
    let totalProgress = 0;
    let userFirstName = '';
    let userLastInitial = '';
    let selectedFile = '';
    let numbers = [];
    let isDragging = false;
    let selectedNumbers = new Set();
    let draggedGroup = [];
    let gameStarted = false; // New flag to track if the game has started
    
    // Ensure correct initial state
    function initializeAppState() {
        // Force initial visibility states
        startScreen.classList.remove('hidden');
        appContainer.classList.add('hidden');
        completionScreen.classList.add('hidden');
        exitButton.classList.add('hidden');
        
        // Ensure completion screen is hidden with inline style as a fallback
        completionScreen.style.display = 'none';
        
        // Reset game state
        resetApp();
        
        // Initialize progress display
        updateProgress();
        
        // Ensure game hasn't started yet
        gameStarted = false;
    }
    
    // Initialize the app state immediately
    initializeAppState();
    
    // Event listeners
    startButton.addEventListener('click', startApp);
    infoButton.addEventListener('click', showModal);
    closeModal.addEventListener('click', hideModal);
    exitButton.addEventListener('click', goBackToStartScreen);
    exitCompletionButton.addEventListener('click', goBackToStartScreen);
    
    window.addEventListener('click', (e) => {
        if (e.target === infoModal) hideModal();
    });
    
    function startApp() {
        if (firstName.value.trim() === '' || lastName.value.trim() === '' || !fileSelect.value) {
            alert('Please enter your first and last name and select a file');
            return;
        }
        
        userFirstName = firstName.value.trim();
        userLastInitial = lastName.value.trim()[0].toUpperCase();
        selectedFile = fileSelect.value;
        
        startScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
        exitButton.classList.remove('hidden');
        completionScreen.classList.add('hidden');
        completionScreen.style.display = 'none'; // Reinforce hidden state
        
        welcomeMessage.textContent = `Welcome, ${userFirstName} ${userLastInitial}.`;
        fileName.textContent = selectedFile;
        
        resetApp();
        initializeGrid();
        gameStarted = true; // Mark the game as started
    }
    
    function goBackToStartScreen() {
        appContainer.classList.add('hidden');
        startScreen.classList.remove('hidden');
        completionScreen.classList.add('hidden');
        completionScreen.style.display = 'none'; // Ensure hidden
        exitButton.classList.add('hidden');
        
        resetApp();
        gameStarted = false; // Reset game started flag
    }
    
    function showModal() {
        infoModal.style.display = 'block';
    }
    
    function hideModal() {
        infoModal.style.display = 'none';
    }
    
    function updateProgress() {
        let totalPercent = Object.values(binProgress).reduce((acc, val) => acc + val, 0) / 5;
        totalProgress = Math.floor(totalPercent);
        
        mainProgress.style.width = `${totalProgress}%`;
        progressPercentage.textContent = totalProgress;
        
        for (let bin in binProgress) {
            progressBars[bin].style.setProperty('--progress', `${binProgress[bin]}%`);
            binProgressTexts[bin].textContent = binProgress[bin];
            temperDisplays.wo[bin].textContent = binTempers[bin].wo;
            temperDisplays.fr[bin].textContent = binTempers[bin].fr;
            temperDisplays.dr[bin].textContent = binTempers[bin].dr;
            temperDisplays.ma[bin].textContent = binTempers[bin].ma;
        }
        
        // Only show completion screen if game has started and progress is complete
        if (gameStarted && totalProgress >= 100) {
            message.textContent = 'File refined! Waffle party earned!';
            setTimeout(() => {
                showCompletionScreen();
            }, 1500);
        }
    }
    
    function showCompletionScreen() {
        appContainer.classList.add('hidden');
        completionScreen.classList.remove('hidden');
        completionScreen.style.display = 'flex'; // Ensure it displays correctly
    }
    
    function resetApp() {
        for (let bin in binProgress) {
            binProgress[bin] = 0;
            binTempers[bin] = { wo: 0, fr: 0, dr: 0, ma: 0 };
        }
        totalProgress = 0;
        updateProgress();
        message.textContent = '';
        selectedNumbers.clear();
        draggedGroup = [];
    }
    
    function initializeGrid() {
        numberGrid.innerHTML = '';
        numbers = [];
        selectedNumbers.clear();
        
        const rows = 10;
        const cols = 10;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const numberCell = document.createElement('div');
                numberCell.classList.add('number-cell');
                
                const value = Math.floor(Math.random() * 10);
                numberCell.textContent = value;
                
                numberCell.dataset.row = i;
                numberCell.dataset.col = j;
                numberCell.dataset.value = value;
                
                numberCell.addEventListener('click', toggleSelection);
                numberCell.addEventListener('mousedown', handleMouseDown);
                numberCell.addEventListener('touchstart', handleTouchStart);
                
                numberGrid.appendChild(numberCell);
                numbers.push(numberCell);
            }
        }
    }
    
    function toggleSelection(event) {
        const cell = event.target;
        
        if (isDragging) return;
        
        if (selectedNumbers.has(cell)) {
            selectedNumbers.forEach(selectedCell => {
                selectedCell.classList.remove('selected');
                gsap.killTweensOf(selectedCell);
            });
            selectedNumbers.clear();
        } else {
            const connectedGroup = getConnectedGroup(cell);
            
            if (selectedNumbers.size > 0) {
                const firstSelectedValue = Array.from(selectedNumbers)[0].dataset.value;
                if (cell.dataset.value !== firstSelectedValue) {
                    selectedNumbers.forEach(selectedCell => {
                        selectedCell.classList.remove('selected');
                        gsap.killTweensOf(selectedCell);
                    });
                    selectedNumbers.clear();
                }
            }
            
            connectedGroup.forEach(groupCell => {
                selectedNumbers.add(groupCell);
                groupCell.classList.add('selected');
                
                gsap.to(groupCell, {
                    scale: 1.1,
                    boxShadow: "0 0 10px #00aaff",
                    duration: 0.5,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut"
                });
            });
        }
        
        event.stopPropagation();
    }
    
    function handleMouseDown(event) {
        if (selectedNumbers.size > 0 && selectedNumbers.has(event.target)) {
            startDragging(event);
        }
    }
    
    function handleTouchStart(event) {
        if (selectedNumbers.size > 0 && selectedNumbers.has(event.target)) {
            startDragging(event);
        }
    }
    
    function startDragging(event) {
        event.preventDefault();
        
        if (selectedNumbers.size === 0) return;
        
        draggedGroup = Array.from(selectedNumbers);
        
        draggedGroup.forEach(cell => {
            gsap.killTweensOf(cell);
            cell.classList.remove('selected');
            cell.classList.add('dragging');
            
            const gridRect = numberGrid.getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();
            cell.style.position = 'absolute';
            cell.style.left = `${cellRect.left - gridRect.left}px`;
            cell.style.top = `${cellRect.top - gridRect.top}px`;
            cell.style.zIndex = '10';
        });
        
        isDragging = true;
        document.addEventListener('mousemove', dragNumber);
        document.addEventListener('touchmove', dragNumber);
        document.addEventListener('mouseup', dropNumber);
        document.addEventListener('touchend', dropNumber);
    }
    
    function dragNumber(event) {
        event.preventDefault();
        if (!isDragging) return;
        
        const gridRect = numberGrid.getBoundingClientRect();
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        if (!clientX || !clientY) return;
        
        const deltaX = clientX - (gridRect.left + draggedGroup[0].offsetWidth / 2);
        const deltaY = clientY - (gridRect.top + draggedGroup[0].offsetHeight / 2);
        
        draggedGroup.forEach(cell => {
            const origRect = cell.getBoundingClientRect();
            cell.style.left = `${(origRect.left - gridRect.left) + (deltaX - (draggedGroup[0].getBoundingClientRect().left - gridRect.left))}px`;
            cell.style.top = `${(origRect.top - gridRect.top) + (deltaY - (draggedGroup[0].getBoundingClientRect().top - gridRect.top))}px`;
        });
        
        highlightBin(clientX, clientY);
    }
    
    function dropNumber(event) {
        event.preventDefault();
        if (!isDragging) return;
        isDragging = false;
        
        document.removeEventListener('mousemove', dragNumber);
        document.removeEventListener('touchmove', dragNumber);
        document.removeEventListener('mouseup', dropNumber);
        document.removeEventListener('touchend', dropNumber);
        
        const clientX = event.clientX || (event.changedTouches && event.changedTouches[0].clientX);
        const clientY = event.clientY || (event.changedTouches && event.changedTouches[0].clientY);
        
        if (!clientX || !clientY) {
            returnGroupToGrid();
            bins.forEach(bin => bin.classList.remove('highlight'));
            draggedGroup.forEach(cell => cell.classList.remove('dragging'));
            selectedNumbers.clear();
            draggedGroup = [];
            return;
        }
        
        const binElement = getHoveredBin(clientX, clientY);
        
        if (binElement) {
            const binIndex = parseInt(binElement.dataset.bin);
            const temper = determineTemper(draggedGroup);
            
            binProgress[binIndex] = Math.min(100, binProgress[binIndex] + Math.floor(Math.random() * 15) + 5);
            
            const temperKey = temper.toLowerCase().slice(0, 2);
            binTempers[binIndex][temperKey] += draggedGroup.length;
            
            updateProgress();
            message.textContent = `${temper} numbers refined in Bin ${String(binIndex + 1).padStart(2, '0')}.`;
            
            draggedGroup.forEach(cell => {
                numbers = numbers.filter(n => n !== cell);
                cell.remove();
            });
            
            addNewNumbers(draggedGroup.length);
        } else {
            returnGroupToGrid();
            message.textContent = '';
        }
        
        bins.forEach(bin => bin.classList.remove('highlight'));
        draggedGroup.forEach(cell => cell.classList.remove('dragging'));
        selectedNumbers.clear();
        draggedGroup = [];
    }
    
    function returnGroupToGrid() {
        draggedGroup.forEach(cell => {
            cell.style.position = '';
            cell.style.left = '';
            cell.style.top = '';
            cell.style.zIndex = '';
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const index = row * 10 + col;
            const existingCells = numberGrid.children;
            if (index < existingCells.length) {
                numberGrid.insertBefore(cell, existingCells[index]);
            } else {
                numberGrid.appendChild(cell);
            }
        });
    }
    
    function getHoveredBin(x, y) {
        return Array.from(bins).find(bin => {
            const rect = bin.getBoundingClientRect();
            return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
        }) || null;
    }
    
    function highlightBin(x, y) {
        bins.forEach(bin => bin.classList.remove('highlight'));
        const hoveredBin = getHoveredBin(x, y);
        if (hoveredBin) hoveredBin.classList.add('highlight');
    }
    
    function determineTemper(cells) {
        const value = parseInt(cells[0].dataset.value);
        
        if (value === 0) return "Dread";
        if (value === 1) return "Malice";
        if (value % 2 === 0) return "Woe";
        return "Frolic";
    }
    
    function addNewNumbers(count) {
        const rows = 10;
        const cols = 10;
        const availablePositions = [];
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (!numbers.some(cell => 
                    parseInt(cell.dataset.row) === i && parseInt(cell.dataset.col) === j)) {
                    availablePositions.push({ row: i, col: j });
                }
            }
        }
        
        for (let i = 0; i < Math.min(count, availablePositions.length); i++) {
            const pos = availablePositions[i];
            const numberCell = document.createElement('div');
            numberCell.classList.add('number-cell');
            
            const value = Math.floor(Math.random() * 10);
            numberCell.textContent = value;
            
            numberCell.dataset.row = pos.row;
            numberCell.dataset.col = pos.col;
            numberCell.dataset.value = value;
            
            numberCell.addEventListener('click', toggleSelection);
            numberCell.addEventListener('mousedown', handleMouseDown);
            numberCell.addEventListener('touchstart', handleTouchStart);
            
            numberGrid.appendChild(numberCell);
            numbers.push(numberCell);
        }
    }
    
    function getConnectedGroup(startCell) {
        const value = startCell.dataset.value;
        const row = parseInt(startCell.dataset.row);
        const col = parseInt(startCell.dataset.col);
        const visited = new Set();
        const group = [];
        
        function dfs(r, c) {
            if (r < 0 || r >= 10 || c < 0 || c >= 10) return;
            const cell = numbers.find(n => 
                parseInt(n.dataset.row) === r && parseInt(n.dataset.col) === c);
            if (!cell || visited.has(cell) || cell.dataset.value !== value) return;
            
            visited.add(cell);
            group.push(cell);
            
            dfs(r - 1, c); // up
            dfs(r + 1, c); // down
            dfs(r, c - 1); // left
            dfs(r, c + 1); // right
        }
        
        dfs(row, col);
        return group;
    }
});