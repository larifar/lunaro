import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { DragEndEvent } from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import "./TaskManager.css";

// Componente SortableTaskItem
const SortableTaskItem = ({ task, index, toggleTask, deleteTask }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: task.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		zIndex: isDragging ? 999 : "auto",
		opacity: isDragging ? 0.8 : 1,
		boxShadow: isDragging ? "0 4px 15px rgba(52, 152, 219, 0.3)" : "none",
		border: isDragging ? "2px dashed #3498db" : "1px solid #e0e0e0",
	};

	return (
		<li
			ref={setNodeRef}
			style={style}
			className={`task-item ${task.completed ? "completed" : ""} ${
				isDragging ? "dragging" : ""
			}`}
		>
			<div className="task-content">
				<div
					className="drag-handle"
					{...attributes}
					{...listeners}
					title="Arraste para reordenar"
				>
					≡
				</div>
				<input
					type="checkbox"
					checked={task.completed}
					onChange={() => toggleTask(task.id)}
					className="task-checkbox"
				/>
				<span className="task-text">{task.text}</span>
			</div>
			<button
				onClick={() => deleteTask(task.id)}
				className="btn-delete"
				title="Eliminar tarea"
			>
				🗑️
			</button>
		</li>
	);
};

// Componente Principal
const TaskManager = () => {
	const [tasks, setTasks] = useState([
		{
			id: `task-${Date.now()}-1`,
			text: "Revisar reporte CNBV semanal",
			completed: false,
		},
		{
			id: `task-${Date.now()}-2`,
			text: "Validar estructura Excel para BRONZE",
			completed: true,
		},
		{
			id: `task-${Date.now()}-3`,
			text: "Actualizar documentación técnica",
			completed: false,
		},
	]);

	const [newTaskText, setNewTaskText] = useState("");
	const [error, setError] = useState("");

	// Configuração dos sensores DnD
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5, // previne drag acidental ao clicar
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const addTask = (e) => {
		e.preventDefault();
		if (newTaskText.trim() === "") {
			setError("Por favor, escribe una tarea para agregar");
			setTimeout(() => {
				setError("");
			}, 3000);
			return;
		}

		const newTask = {
			id: `task-${Date.now()}`,
			text: newTaskText,
			completed: false,
		};

		setTasks([...tasks, newTask]);
		setNewTaskText("");
		setError("");
	};

	const toggleTask = (id) => {
		setTasks(
			tasks.map((task) =>
				task.id === id ? { ...task, completed: !task.completed } : task
			)
		);
	};

	const deleteTask = (id) => {
		setTasks(tasks.filter((task) => task.id !== id));
	};

	const handleInputChange = (e) => {
		setNewTaskText(e.target.value);
		if (error) {
			setError("");
		}
	};

	// Handler para quando o drag termina
	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (!over || active.id === over.id) return;

		const oldIndex = tasks.findIndex((task) => task.id === active.id);
		const newIndex = tasks.findIndex((task) => task.id === over.id);

		setTasks(arrayMove(tasks, oldIndex, newIndex));
	};

	return (
		<div className="task-manager">
			<h2>📋 Gestor de Tareas - Time to Market</h2>

			<form onSubmit={addTask} className="task-form">
				<input
					type="text"
					value={newTaskText}
					onChange={handleInputChange}
					placeholder="Nueva tarea (ej: Crear tabla BRONZE para archivo XYZ)"
					className={`task-input ${error ? "input-error" : ""}`}
				/>
				<button type="submit" className="btn-add">
					Agregar
				</button>
			</form>

			{error && <div className="error-message">{error}</div>}

			<div className="task-list">
				<h3>
					Tareas ({tasks.filter((t) => !t.completed).length}{" "}
					pendientes)
				</h3>
				{tasks.length === 0 ? (
					<p className="no-tasks">
						No hay tareas. ¡Agrega una nueva!
					</p>
				) : (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={tasks.map((task) => task.id)}
							strategy={verticalListSortingStrategy}
						>
							<ul className="tasks-container">
								{tasks.map((task, index) => (
									<SortableTaskItem
										key={task.id}
										task={task}
										index={index}
										toggleTask={toggleTask}
										deleteTask={deleteTask}
									/>
								))}
							</ul>
						</SortableContext>
					</DndContext>
				)}
			</div>
		</div>
	);
};

export default TaskManager;
