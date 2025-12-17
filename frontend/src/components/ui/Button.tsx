// /**
//  * Button Component
//  */

// import React from 'react';
// import { cn } from '@/lib/utils';
// import { Loader2 } from 'lucide-react';

// interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
//   size?: 'sm' | 'md' | 'lg';
//   isLoading?: boolean;
//   leftIcon?: React.ReactNode;
//   rightIcon?: React.ReactNode;
// }

// const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
//   (
//     {
//       className,
//       variant = 'primary',
//       size = 'md',
//       isLoading = false,
//       leftIcon,
//       rightIcon,
//       children,
//       disabled,
//       ...props
//     },
//     ref
//   ) => {
//     const variants = {
//       primary: 'btn-primary',
//       secondary: 'btn-secondary',
//       danger: 'btn-danger',
//       ghost: 'btn-ghost',
//     };

//     const sizes = {
//       sm: 'px-3 py-1.5 text-xs',
//       md: 'px-4 py-2 text-sm',
//       lg: 'px-6 py-3 text-base',
//     };

//     return (
//       <button
//         ref={ref}
//         className={cn(
//           'btn',
//           variants[variant],
//           sizes[size],
//           isLoading && 'cursor-wait',
//           className
//         )}
//         disabled={disabled || isLoading}
//         {...props}
//       >
//         {isLoading ? (
//           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//         ) : leftIcon ? (
//           <span className="mr-2">{leftIcon}</span>
//         ) : null}
//         {children}
//         {rightIcon && !isLoading && <span className="ml-2">{rightIcon}</span>}
//       </button>
//     );
//   }
// );

// Button.displayName = 'Button';

// export default Button;







/**
 * Task Form Component
 */

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Task, Priority, CreateTaskInput, User } from '@/types';
import { useUsers } from '@/hooks/useNotifications';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';

const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be less than 5000 characters'),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.nativeEnum(Priority),
  assignedToId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { data: users = [] } = useUsers();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: format(new Date(Date.now() + 86400000), "yyyy-MM-dd'T'HH:mm"),
      priority: Priority.MEDIUM,
      assignedToId: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        dueDate: format(new Date(task.dueDate), "yyyy-MM-dd'T'HH:mm"),
        priority: task.priority,
        assignedToId: task.assignedToId?._id || '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: TaskFormData) => {
    const payload: CreateTaskInput = {
      title: data.title,
      description: data.description,
      dueDate: new Date(data.dueDate).toISOString(),
      priority: data.priority,
      assignedToId: data.assignedToId || undefined,
    };
    await onSubmit(payload);
  };

  const priorityOptions = Object.values(Priority).map((p) => ({
    value: p,
    label: p,
  }));

  const userOptions = [
    { value: '', label: 'Unassigned' },
    ...users.map((user: User) => ({
      value: user._id,
      label: user.name,
    })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        {...register('title')}
      />

      <Textarea
        label="Description"
        placeholder="Enter task description"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Due Date"
          type="datetime-local"
          error={errors.dueDate?.message}
          {...register('dueDate')}
        />

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              label="Priority"
              options={priorityOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.priority?.message}
            />
          )}
        />
      </div>

      <Controller
        name="assignedToId"
        control={control}
        render={({ field }) => (
          <Select
            label="Assign To"
            options={userOptions}
            value={field.value || ''}
            onChange={field.onChange}
            error={errors.assignedToId?.message}
          />
        )}
      />

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;