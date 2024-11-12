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

    const handleDragStart = (cardIndex: number, taskIndex: number) => {
        setDraggingTask(cards[cardIndex].tasks[taskIndex]);
        setDraggingCardIndex(cardIndex);
    };

    const handleDrop = (targetCardIndex: number) => {
        if (draggingTask && draggingCardIndex !== null) {
            const newCards = [...cards];
            const sourceTasks = newCards[draggingCardIndex].tasks;
            const targetTasks = newCards[targetCardIndex].tasks;

            const updatedSourceTasks = sourceTasks.filter(task => task.id !== draggingTask.id);
            newCards[draggingCardIndex].tasks = updatedSourceTasks;

            targetTasks.push(draggingTask);
            newCards[targetCardIndex].tasks = targetTasks;

            setCards(newCards);
            setDraggingTask(null);
            setDraggingCardIndex(null);
            setHoveredCardIndex(null); // Återställ när drop sker
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

    const handleAddTaskToTodo = () => {
        if (newTaskTitle.trim() === '') return;

        const newTask: Task = {
            id: Date.now(),
            title: newTaskTitle,
        };

        const updatedCards = [...cards];
        updatedCards[0].tasks.push(newTask);
        setCards(updatedCards);
        setNewTaskTitle('');
        setIsAddTaskVisible(false); // Stänger formuläret när uppgiften har lagts till
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleAddTaskToTodo(); // Lägger till uppgiften om Enter trycks
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
                                onKeyDown={handleKeyDown} // Lägg till keydown event för Enter
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
            </div>
        </div>
    );
}
