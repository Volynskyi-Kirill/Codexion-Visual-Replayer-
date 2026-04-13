/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   main.c                                             :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/03/20 14:14:25 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <stdlib.h>

void		print_data(t_data *data);
static int	cleanup_data(t_data *data, int cleanup_state);
static int	init_resources(t_data *data, int *cleanup_state);
int			launch_simulation(t_data *data);

int	main(int argc, char *argv[])
{
	t_data	*data;
	int		cleanup_state;

	data = malloc(sizeof(t_data));
	if (!data)
		return (1);
	*data = (t_data){0};
	if (parse(data, argc, argv) != 0)
		return (free(data), 1);
	if (init_resources(data, &cleanup_state) != 0)
		return (cleanup_data(data, cleanup_state));
	print_data(data);
	if (launch_simulation(data) != 0)
		return (cleanup_data(data, cleanup_state));
	cleanup_data(data, cleanup_state);
	return (0);
}

static int	init_resources(t_data *data, int *cleanup_state)
{
	*cleanup_state = 0;
	data->log_file = fopen("coders.log", "w");
	if (!data->log_file)
	{
		perror("Error opening coders.log");
		return (1);
	}
	if (init_data_mutexes(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_CORE_MUTEXES;
	if (init_dongles(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_DONGLES;
	if (init_dongle_mutexes(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_DONGLE_MUTEXES;
	if (init_dongle_conds(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_DONGLE_CONDS;
	if (init_start_time(data) != 0)
		return (1);
	if (init_coders(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_CODERS;
	if (init_coder_mutexes(data) != 0)
		return (1);
	*cleanup_state |= CLEANUP_CODER_MUTEXES;
	return (0);
}

static int	cleanup_data(t_data *data, int cleanup_state)
{
	if (cleanup_state & CLEANUP_DONGLES)
		cleanup_dongles_range(data, data->number_of_coders,
			cleanup_state & CLEANUP_DONGLE_MUTEXES,
			cleanup_state & CLEANUP_DONGLE_CONDS);
	if (cleanup_state & CLEANUP_CODERS)
		cleanup_coders_range(data, data->number_of_coders,
			cleanup_state & CLEANUP_CODER_MUTEXES);
	if (cleanup_state & CLEANUP_CORE_MUTEXES)
	{
		pthread_mutex_destroy(&data->stop_mutex);
		pthread_mutex_destroy(&data->print_mutex);
	}
	if (data->log_file)
		fclose(data->log_file);
	free(data);
	return (1);
}

void	print_data(t_data *data)
{
	pthread_mutex_lock(&data->print_mutex);
	if (data->log_file)
	{
		fprintf(data->log_file, "{\"status\": \"INITIALIZE\", \"num_coders\": %d, "
			"\"num_dongles\": %d, \"time_to_burnout\": %lld, \"time_to_compile\": %lld, "
			"\"time_to_debug\": %lld, \"time_to_refactor\": %lld, "
			"\"num_compiles_required\": %d, \"dongle_cooldown\": %lld, "
			"\"scheduler\": \"%s\"}\n", data->number_of_coders,
			data->number_of_coders, data->time_to_burnout, data->time_to_compile,
			data->time_to_debug, data->time_to_refactor,
			data->number_of_compiles_required, data->dongle_cooldown,
			(data->scheduler == CODERS_SCHED_FIFO) ? "FIFO" : "EDF");
		fflush(data->log_file);
	}
	pthread_mutex_unlock(&data->print_mutex);
}
