/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   coders.h                                           :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/24 20:16:39 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

// compile -> debug -> refactor
// deadline = last_compile_start + time_to_burnout

#ifndef CODERS_H
# define CODERS_H

# include <pthread.h>
# include <stdio.h>

# define CLEANUP_CORE_MUTEXES 1
# define CLEANUP_DONGLES 2
# define CLEANUP_DONGLE_MUTEXES 4
# define CLEANUP_DONGLE_CONDS 8
# define CLEANUP_CODERS 16
# define CLEANUP_CODER_MUTEXES 32

typedef struct s_data	t_data;

typedef enum e_sched
{
	CODERS_SCHED_FIFO,
	CODERS_SCHED_EDF,
}						t_sched;

typedef enum e_coder_status
{
	CODER_INITIALIZING,
	CODER_REQUESTING,
	CODER_COMPILE,
	CODER_DEBUG,
	CODER_REFACTOR,
	CODER_BURNED_OUT,
}						t_coder_status;

typedef struct s_node
{
	int					coder_id;
	long long			priority;
}						t_node;

typedef struct s_heap
{
	t_node				*array;
	int					size;
	int					capacity;
}						t_heap;

typedef struct s_coder
{
	int					id;
	pthread_t			thread;
	t_coder_status		status;
	t_data				*data;
	long long			last_compiling_at;
	pthread_mutex_t		mutex;
	int					compiles_done;
}						t_coder;

typedef enum e_dongle_status
{
	DONGLE_FREE,
	DONGLE_OCCUPIED,
}						t_dongle_status;

typedef struct s_dongle
{
	int					id;
	t_dongle_status		status;
	long long			last_released_at;
	t_heap				*queue;
	pthread_mutex_t		mutex;
	pthread_cond_t		cond;
}						t_dongle;

struct					s_data
{
	int					number_of_coders;
	long long			time_to_burnout;
	long long			time_to_compile;
	long long			time_to_debug;
	long long			time_to_refactor;
	int					number_of_compiles_required;

	long long			dongle_cooldown;

	long long			start_time;
	int					is_simulation_end;
	pthread_mutex_t		stop_mutex;
	t_sched				scheduler;

	pthread_mutex_t		print_mutex;
	FILE				*log_file;
	pthread_t			monitor;
	t_coder				*coders;
	t_dongle			*dongles;
};

int						parse(t_data *data, int argc, char *argv[]);
int						ft_isdigit(int c);
int						ft_isdigitstr(char *s);
long long				ft_atoll(const char *str);
long long				get_current_time(void);
int						get_is_simulation_end(t_data *data);
void					print_status(t_coder *coder, const char *msg);
void					log_json(t_data *data, const char *status, t_coder *coder,
							t_dongle *dongle);

t_heap					*create_heap(int capacity);
void					swap_heap(t_node *a, t_node *b);
void					insert_heap(t_heap *heap, t_node node);
t_node					pop_heap(t_heap *heap);

int						get_left_child(int i);
int						get_right_child(int i);
int						get_parent(int i);
int						should_bubble_up(t_heap *heap, int i);
int						pop_node_by_id(t_heap *heap, int coder_id);
void					bubble_up_from(t_heap *heap, int i);
void					heapify(t_heap *heap, int i);

int						init_coders(t_data *data);
int						init_coder_mutexes(t_data *data);
void					cleanup_coders_range(t_data *data, int count,
							int destroy_mutexes);
void					*coder_routine(void *arg);
int						start_coders(t_data *data);
int						join_coders(t_data *data);
int						init_start_time(t_data *data);
int						init_dongles(t_data *data);
int						init_dongle_mutexes(t_data *data);
void					cleanup_dongles_range(t_data *data, int count,
							int destroy_mutexes, int destroy_conds);

long long				get_timestamp(long long simulation_start_time);
void					ft_sleep(long long time);
int						init_data_mutexes(t_data *data);
int						init_dongle_conds(t_data *data);
void					update_compiling_at(t_coder *coder);
void					get_dongle_lock_order(t_coder *coder, int *first,
							int *second);
void					prepare_dongle_wait_time(t_dongle *dongle, t_data *data,
							struct timespec *ts);
void					coder_compile(t_coder *coder);
long long				get_node_priority(t_coder *coder);
void					*monitor_routine(void *arg);
int						start_monitor(t_data *data);
int						launch_simulation(t_data *data);
void					stop_simulation(t_data *data);
void					wake_all_dongle_waiters(t_data *data);
void					increment_compiles_done(t_coder *coder);

#endif