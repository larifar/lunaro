import React, { useState, useRef, useEffect } from "react";
import styles from "./TodoList.module.css";

// 🔹 Tipos
interface Task {
	id: number;
	text: string;
	completed: boolean;
}

// 🧠 Componente Principal
const TodoList: React.FC = () => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [inputValue, setInputValue] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const dragItem = useRef<number | null>(null);
	const dragOverItem = useRef<number | null>(null);
	const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// ➕ Adicionar nova tarefa
	const addTask = () => {
		if (inputValue.trim() === "") {
			setError("A tarefa não pode estar vazia.");

			// Limpa timeout anterior, se existir
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
			}

			// Agenda limpeza automática após 3s
			errorTimeoutRef.current = setTimeout(() => {
				setError(null);
			}, 3000);

			return;
		}

		// Limpa erro se existir e input for válido
		if (error) {
			setError(null);
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
				errorTimeoutRef.current = null;
			}
		}

		setTasks([
			...tasks,
			{ id: Date.now(), text: inputValue, completed: false },
		]);
		setInputValue("");
	};

	// ✏️ Limpa erro se usuário começar a digitar
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
		if (error) {
			setError(null);
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
				errorTimeoutRef.current = null;
			}
		}
	};

	// ✅ Alternar completado
	const toggleComplete = (id: number) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, completed: !task.completed } : task
			)
		);
	};

	// 🗑️ Excluir tarefa
	const deleteTask = (id: number) => {
		setTasks(tasks.filter((task) => task.id !== id));
	};

	// ⌨️ Suporte a Enter
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") addTask();
	};

	// 🖱️ Drag & Drop — Início do arrasto
	const handleDragStart = (index: number) => {
		dragItem.current = index;
	};

	// 🖱️ Drag & Drop — Sobreposição
	const handleDragOver = (index: number) => {
		dragOverItem.current = index;
	};

	// 🖱️ Drag & Drop — Solta
	const handleDrop = () => {
		if (dragItem.current === null || dragOverItem.current === null) return;

		const newTasks = [...tasks];
		const draggedItem = newTasks[dragItem.current];
		newTasks.splice(dragItem.current, 1);
		newTasks.splice(dragOverItem.current, 0, draggedItem);

		setTasks(newTasks);
		dragItem.current = null;
		dragOverItem.current = null;
	};

	// 🧹 Limpeza do timeout ao desmontar o componente
	useEffect(() => {
		return () => {
			if (errorTimeoutRef.current) {
				clearTimeout(errorTimeoutRef.current);
			}
		};
	}, []);

	return (
		<div className={styles.container}>
			<h2 className={styles.title}>🐝 Colmena - Lista de Tarefas</h2>

			{/* Input + Botão */}
			<div className={styles.inputGroup}>
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder="Nova tarefa..."
					className={error ? styles.inputError : styles.input}
				/>
				<button onClick={addTask} className={styles.addButton}>
					+ Adicionar
				</button>
			</div>

			{/* Mensagem de erro */}
			{error && <div className={styles.errorText}>{error}</div>}

			{/* Lista de tarefas */}
			<ul className={styles.taskList}>
				{tasks.length === 0 ? (
					<li className={styles.emptyState}>
						Nenhuma tarefa. Adicione uma!
					</li>
				) : (
					tasks.map((task, index) => (
						<li
							key={task.id}
							draggable
							onDragStart={() => handleDragStart(index)}
							onDragOver={(e) => {
								e.preventDefault();
								handleDragOver(index);
							}}
							onDrop={handleDrop}
							className={`${styles.taskItem} ${
								dragItem.current === index
									? styles.taskItemDragging
									: ""
							}`}
						>
							<label className={styles.taskLabel}>
								<input
									type="checkbox"
									checked={task.completed}
									onChange={() => toggleComplete(task.id)}
									className={styles.checkbox}
								/>
								<span
									className={`${styles.taskText} ${
										task.completed
											? styles.taskTextCompleted
											: ""
									}`}
								>
									{task.text}
								</span>
							</label>
							<button
								onClick={() => deleteTask(task.id)}
								className={styles.deleteButton}
								aria-label="Excluir tarefa"
								title="Excluir tarefa"
							>
								🗑️
							</button>
						</li>
					))
				)}
			</ul>
		</div>
	);
};

export default TodoList;
