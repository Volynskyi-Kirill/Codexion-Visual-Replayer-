/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   monitor_routine.c                                  :+:    :+:            */
/*                                                     +:+                    */
/*   By: kvolynsk <kvolynsk@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2026/04/11 17:30:00 by kvolynsk      #+#    #+#                 */
/*   Updated: 2026/04/11 17:30:00 by kvolynsk      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

#include "coders.h"
#include <stdio.h>
#include <unistd.h>

static int	all_compiles_done(t_data *data);
static int	find_burned_out_coder(t_data *data, int *burned_out_id);
static void	handle_stop_event(t_data *data, int burned_out_id);

void	*monitor_routine(void *arg)
{
	t_data	*data;
	int		burned_out_id;

	data = (t_data *)arg;
	while (!get_is_simulation_end(data))
	{
		if (find_burned_out_coder(data, &burned_out_id))
		{
			handle_stop_event(data, burned_out_id);
			return (NULL);
		}
		if (all_compiles_done(data))
		{
			handle_stop_event(data, 0);
			return (NULL);
		}
		usleep(1000);
	}
	return (NULL);
}

static void	handle_stop_event(t_data *data, int burned_out_id)
{
	stop_simulation(data);
	wake_all_dongle_waiters(data);
	pthread_mutex_lock(&data->print_mutex);
	if (burned_out_id)
	{
		printf("%lld %d burned out\n", get_timestamp(data->start_time),
			burned_out_id);
		pthread_mutex_unlock(&data->print_mutex);
		log_json(data, "BURNOUT", &data->coders[burned_out_id - 1], NULL);
	}
	else
	{
		pthread_mutex_unlock(&data->print_mutex);
		log_json(data, "SUCCESS", NULL, NULL);
	}
}

static int	all_compiles_done(t_data *data)
{
	int	i;
	int	compiles_done;

	i = 0;
	while (i < data->number_of_coders)
	{
		pthread_mutex_lock(&data->coders[i].mutex);
		compiles_done = data->coders[i].compiles_done;
		pthread_mutex_unlock(&data->coders[i].mutex);
		if (compiles_done < data->number_of_compiles_required)
			return (0);
		i++;
	}
	return (1);
}

static int	find_burned_out_coder(t_data *data, int *burned_out_id)
{
	int			i;
	long long	last_compile;
	long long	now;

	now = get_current_time();
	i = 0;
	while (i < data->number_of_coders)
	{
		pthread_mutex_lock(&data->coders[i].mutex);
		last_compile = data->coders[i].last_compiling_at;
		pthread_mutex_unlock(&data->coders[i].mutex);
		if (now - last_compile >= data->time_to_burnout)
		{
			*burned_out_id = data->coders[i].id;
			return (1);
		}
		i++;
	}
	return (0);
}

void	stop_simulation(t_data *data)
{
	pthread_mutex_lock(&data->stop_mutex);
	data->is_simulation_end = 1;
	pthread_mutex_unlock(&data->stop_mutex);
}
