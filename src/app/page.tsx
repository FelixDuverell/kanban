// src/app/page.tsx

"use client";
// src/app/components/KanbanCards.tsx

import React, { useState } from 'react';
import styles from './page.module.css';

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
        { title: 'To Do', tasks: [{ id: 1, title: 'Task 1' }, { id: 2, title: 'Task 2' }] },
        { title: 'In Progress', tasks: [{ id: 3, title: 'Task 3' }] },
        { title: 'Review', tasks: [{ id: 4, title: 'Task 4' }] },
        { title: 'Done', tasks: [{ id: 5, title: 'Task 5' }] },
    ];

    const [cards, setCards] = useState(initialCards);
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [draggingCardIndex, setDraggingCardIndex] = useState<number | null>(null);
    const [newTaskTitles, setNewTaskTitles] = useState<string[]>(Array(cards.length).fill(''));

    const handleDragStart = (cardIndex: number, taskIndex: number) => {
        setDraggingTask(cards[cardIndex].tasks[taskIndex]);
        setDraggingCardIndex(cardIndex);
    };

    const handleDrop = (targetCardIndex: number) => {
        if (draggingTask && draggingCardIndex !== null) {
            const newCards = [...cards];
            const sourceTasks = newCards[draggingCardIndex].tasks;
            const targetTasks = newCards[targetCardIndex].tasks;

            // Remove task from source
            const updatedSourceTasks = sourceTasks.filter(task => task.id !== draggingTask.id);
            newCards[draggingCardIndex].tasks = updatedSourceTasks;

            // Add task to target
            targetTasks.push(draggingTask);
            newCards[targetCardIndex].tasks = targetTasks;

            setCards(newCards);
            setDraggingTask(null);
            setDraggingCardIndex(null);
        }
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
            id: Date.now(), // Using timestamp as a unique ID
            title: newTaskTitle,
        };

        const updatedCards = [...cards];
        updatedCards[cardIndex].tasks.push(newTask);
        setCards(updatedCards);
        setNewTaskTitles((prev) => {
            const newTitles = [...prev];
            newTitles[cardIndex] = ''; // Clear input field
            return newTitles;
        });
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Kanban Board</h1>
            <div className={styles.kanbanContainer}>
                {cards.map((card, cardIndex) => (
                    <div
                        className={styles.card}
                        key={cardIndex}
                        onDragOver={(e) => e.preventDefault()} // Allow drop
                        onDrop={() => handleDrop(cardIndex)} // Handle drop
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
                        <input
                            type="text"
                            value={newTaskTitles[cardIndex]}
                            onChange={(e) => handleInputChange(cardIndex, e.target.value)}
                            className={styles.input}
                            placeholder="New Task"
                        />
                        <button className={styles.btn} onClick={() => handleAddTask(cardIndex)}>
                            Add Task
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

