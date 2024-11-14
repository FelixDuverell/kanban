import React, { useState, useRef, useEffect } from 'react';
import styles from '../page.module.css';

interface Task {
    id: number;
    title: string;
}

interface Card {
    title: string;
    tasks: Task[];
}

export default function KanbanCards() {
    const initialCards: Card[] = [
        { title: 'To Do', tasks: [] },
        { title: 'In Progress', tasks: [] },
        { title: 'Review', tasks: [] },
        { title: 'Done', tasks: [] },
    ];

    const [cards, setCards] = useState(initialCards);
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [draggingCardIndex, setDraggingCardIndex] = useState<number | null>(null);
    const [newTaskTitles, setNewTaskTitles] = useState<string[]>(Array(cards.length).fill(''));
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isAddTaskVisible, setIsAddTaskVisible] = useState(false);
    const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);
    const [user, setUser] = useState<any>(null); // För att lagra användardata

    const addTaskBoxRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (addTaskBoxRef.current && !addTaskBoxRef.current.contains(event.target as Node)) {
                setIsAddTaskVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Hämta användardata från backend whoami
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('http://localhost:5285/api/auth/whoami', {
                    method: 'GET',
                    credentials: 'include',
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data); // Uppdatera användardatan
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUser();
    }, []);

    const handleDragStart = (cardIndex: number, taskIndex: number) => {
        setDraggingTask(cards[cardIndex].tasks[taskIndex]);
        setDraggingCardIndex(cardIndex);
    };

    const handleDrop = (targetCardIndex: number) => {
        if (draggingTask && draggingCardIndex !== null) {
            const newCards = [...cards];
            const sourceTasks = newCards[draggingCardIndex].tasks;
            const targetTasks = newCards[targetCardIndex].tasks;
    
            const taskExistsInTarget = targetTasks.some(task => task.id === draggingTask.id);
    
            if (!taskExistsInTarget) {
                const updatedSourceTasks = sourceTasks.filter(task => task.id !== draggingTask.id);
                newCards[draggingCardIndex].tasks = updatedSourceTasks;
    
                targetTasks.push(draggingTask);
                newCards[targetCardIndex].tasks = targetTasks;
    
                setCards(newCards);
            } else {
                console.log('Task already exists in the target card!');
            }
    
            setDraggingTask(null);
            setDraggingCardIndex(null);
            setHoveredCardIndex(null); 
        }
    };

    const handleDragOver = (cardIndex: number, event: React.DragEvent) => {
        event.preventDefault();
        setHoveredCardIndex(cardIndex);
    };

    const handleDragLeave = () => {
        setHoveredCardIndex(null);
    };

    const handleInputChange = (cardIndex: number, value: string) => {
        const updatedTitles = [...newTaskTitles];
        updatedTitles[cardIndex] = value;
        setNewTaskTitles(updatedTitles);
    };

    const handleAddTask = (cardIndex: number) => {
        const newTaskTitle = newTaskTitles[cardIndex].trim();
        if (newTaskTitle === '') return;

        const newTask: Task = {
            id: Date.now(),
            title: newTaskTitle,
        };

        const updatedCards = [...cards];
        updatedCards[cardIndex].tasks.push(newTask);
        setCards(updatedCards);
        setNewTaskTitles((prev) => {
            const newTitles = [...prev];
            newTitles[cardIndex] = '';
            return newTitles;
        });
    };

    const saveCardsToLocalStorage = (updatedCards: Card[]) => {
        localStorage.setItem('kanbanCards', JSON.stringify(updatedCards));
    };
    

    const handleAddTaskToTodo = async () => {
        if (newTaskTitle.trim() === '') return;

        if (user) {
            const newTask = {
                title: newTaskTitle,
                userId: user.id,  // Skicka med användarens ID
            };

            try {
                const response = await fetch('http://localhost:5285/api/kanbanposts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newTask),
                    credentials: 'include', 
                });

                if (response.ok) {
                    const taskData = await response.json();
                    const updatedCards = [...cards];
                    updatedCards[0].tasks.push(taskData); 
                    setCards(updatedCards);
                    saveCardsToLocalStorage(updatedCards);  
                    setNewTaskTitle('');
                    setIsAddTaskVisible(false); 
                } else {
                    console.error('Failed to create task');
                }
            } catch (error) {
                console.error('Error adding task:', error);
            }
        }
    };

    useEffect(() => {
        const storedCards = localStorage.getItem('kanbanCards');
        if (storedCards) {
            setCards(JSON.parse(storedCards));  // Återställ  med sparade data
        }
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddTaskToTodo(); 
        }
    };

    const handleDeleteTask = () => {
        if (draggingTask && draggingCardIndex !== null) {
            const newCards = [...cards];
            const sourceTasks = newCards[draggingCardIndex].tasks;
    
            const updatedSourceTasks = sourceTasks.filter(task => task.id !== draggingTask.id);
            newCards[draggingCardIndex].tasks = updatedSourceTasks;
    
            setCards(newCards);
            setDraggingTask(null);
            setDraggingCardIndex(null);
            setHoveredCardIndex(null);
        }
    };
    

    const getCardClass = (index: number) => {
        switch (index) {
            case 0:
                return styles.todoCard;
            case 1:
                return styles.inProgressCard;
            case 2:
                return styles.reviewCard;
            case 3:
                return styles.doneCard;
            default:
                return '';
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Kanban Board</h1>
            {user && <p>Welcome, {user.username}!</p>} {/* Visa användarnamn om användaren är inloggad */}
            <div className={styles.kanbanContainer}>
                <div
                    className={styles.addTaskBox}
                    ref={addTaskBoxRef}
                    onClick={() => setIsAddTaskVisible(true)}
                >
                    {isAddTaskVisible ? (
                        <div className={styles.addTaskForm}>
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                onKeyDown={handleKeyDown} 
                                className={styles.input}
                                placeholder="New Task"
                            />
                            <button className={styles.btn} onClick={handleAddTaskToTodo}>
                                Add Task
                            </button>
                        </div>
                    ) : (
                        <span className={styles.addTaskText}>+ Add Task</span>
                    )}
                </div>

                {cards.map((card, cardIndex) => (
                    <div
                        key={cardIndex}
                        className={`${styles.card} ${getCardClass(cardIndex)} ${hoveredCardIndex === cardIndex ? styles.cardHovered : ''}`}
                        onDragOver={(e) => handleDragOver(cardIndex, e)}
                        onDrop={() => handleDrop(cardIndex)}
                        onDragLeave={handleDragLeave}
                    >
                        <h3 className={styles.cardTitle}>{card.title}</h3>
                        <div className={styles.taskList}>
                            {card.tasks.map((task, taskIndex) => (
                                <div
                                    key={task.id}
                                    className={styles.task}
                                    draggable
                                    onDragStart={() => handleDragStart(cardIndex, taskIndex)}
                                >
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                <div 
                className={styles.deleteZone} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDeleteTask}>
                <span className={styles.deleteText}>🗑️</span>
            </div>
            </div>
        </div>
    );
}
