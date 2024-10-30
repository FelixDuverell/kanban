// src/app/components/KanbanCards.tsx

"use client";

// src/app/components/KanbanCards.tsx

import React, { useState } from 'react';
import styles from './page.module.css';

export default function KanbanCards() {
    const [tasks, setTasks] = useState<{ title: string; content: string[] }[]>([
        { title: 'To Do', content: [] },
        { title: 'In Progress', content: [] },
        { title: 'Review', content: [] },
        { title: 'Done', content: [] },
    ]);

    const [newTask, setNewTask] = useState('');
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);

    const addTask = () => {
        if (newTask && selectedColumn !== null) {
            const updatedTasks = [...tasks];
            updatedTasks[selectedColumn].content.push(newTask);
            setTasks(updatedTasks);
            setNewTask('');
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.header}>Kanban Board</h1>
            <div className={styles.kanbanContainer}>
                {tasks.map((task, index) => (
                    <div className={styles.card} key={index}>
                        <h3 className={styles.cardTitle}>{task.title}</h3>
                        <div className={styles.taskList}>
                            {task.content.map((content, idx) => (
                                <div className={styles.task} key={idx}>
                                    {content}
                                </div>
                            ))}
                        </div>
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task"
                            className={styles.textarea}
                        />
                        <button className={styles.btn} onClick={() => {
                            setSelectedColumn(index);
                            addTask();
                        }}>
                            Add Task
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

