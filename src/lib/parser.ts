/**
 * Re-export parser functions from @wagomu/todotxt-parser
 *
 * This module re-exports the todo.txt parsing functionality from the
 * standalone library to maintain backwards compatibility with existing imports.
 */
export {
	parseTodoTxt,
	parseTodoLine,
	serializeTodo,
	updateTodoInList,
	appendTaskToFile,
	updateTaskAtLine,
	deleteTaskAtLine,
} from "@wagomu/todotxt-parser";
