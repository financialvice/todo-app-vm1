'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Edit2, Plus, Check } from 'lucide-react';

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
};

type FilterType = 'all' | 'active' | 'completed';

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [mounted, setMounted] = useState(false);

  // Load todos from localStorage on mount
  useEffect(() => {
    const storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      setTodos(JSON.parse(storedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt)
      })));
    }
    setMounted(true);
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('todos', JSON.stringify(todos));
    }
  }, [todos, mounted]);

  const addTodo = useCallback(() => {
    if (inputValue.trim()) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: inputValue.trim(),
        completed: false,
        createdAt: new Date()
      };
      setTodos(prev => [newTodo, ...prev]);
      setInputValue('');
    }
  }, [inputValue]);

  const toggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const deleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const startEditing = useCallback((id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  }, []);

  const saveEdit = useCallback(() => {
    if (editingId && editText.trim()) {
      setTodos(prev => prev.map(todo => 
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
    }
    setEditingId(null);
    setEditText('');
  }, [editingId, editText]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeTodoCount = todos.filter(todo => !todo.completed).length;
  const completedTodoCount = todos.filter(todo => todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-3xl p-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Todo App
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Keep track of your tasks efficiently
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 space-y-6">
          {/* Add Todo Input */}
          <div className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              className="flex-1 text-lg py-6 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 focus:scale-[1.01]"
            />
            <Button 
              onClick={addTodo}
              size="lg"
              className="px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add
            </Button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center justify-between">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <TabsList className="grid w-full grid-cols-3 max-w-sm">
                <TabsTrigger value="all">
                  All ({todos.length})
                </TabsTrigger>
                <TabsTrigger value="active">
                  Active ({activeTodoCount})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedTodoCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Todo List */}
          <div className="space-y-2 min-h-[200px]">
            {filteredTodos.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-400">
                {filter === 'all' && 'No todos yet. Add one above!'}
                {filter === 'active' && 'No active todos.'}
                {filter === 'completed' && 'No completed todos.'}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTodos.map((todo, index) => (
                  <div
                    key={todo.id}
                    className={`group flex items-center gap-3 p-4 ${todo.completed ? 'bg-gray-50' : 'bg-white'} dark:bg-gray-700 rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-md animate-in slide-in-from-top-2`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'backwards'
                    }}
                  >
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 transition-all duration-200 hover:scale-110"
                    />
                    
                    {editingId === todo.id ? (
                      <div className="flex-1 flex gap-2">
                        <Input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={saveEdit}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className={`flex-1 text-lg transition-all duration-200 ${
                            todo.completed 
                              ? 'line-through text-gray-400 dark:text-gray-400' 
                              : 'text-gray-800 dark:text-white'
                          }`}
                        >
                          {todo.text}
                        </span>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(todo.id, todo.text)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTodo(todo.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {todos.length > 0 && (
            <div className="flex justify-between items-center pt-4 border-t text-sm text-gray-500 dark:text-gray-400">
              <span>{activeTodoCount} {activeTodoCount === 1 ? 'item' : 'items'} left</span>
              {completedTodoCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTodos(prev => prev.filter(t => !t.completed))}
                  className="text-red-500 hover:text-red-600"
                >
                  Clear completed
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
